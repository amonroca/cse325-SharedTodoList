import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { type Response } from 'express';
import { requireAuth, signToken, type AuthedRequest } from './auth.js';
import { pool, schema } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const publicUser = (u: { id: number; name: string; email: string }) => ({ id: u.id, name: u.name, email: u.email });

// Returns the caller's role on a list, or null if they are not a member.
async function roleOn(listId: number, userId: number): Promise<'owner' | 'editor' | null> {
  const { rows } = await pool.query('SELECT role FROM list_members WHERE list_id = $1 AND user_id = $2', [listId, userId]);
  return rows[0]?.role ?? null;
}

// Wraps async handlers so thrown errors become 500 responses instead of crashing.
const handle =
  (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) => (req: AuthedRequest, res: Response) =>
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });

// ---------- Auth ----------

app.post('/api/auth/register', handle(async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  if (!name || !email || password.length < 6) {
    return res.status(400).json({ error: 'Name, email and a password of at least 6 characters are required' });
  }
  const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (existing.rowCount) return res.status(409).json({ error: 'An account with that email already exists' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hash],
  );
  res.status(201).json({ token: signToken(rows[0].id), user: publicUser(rows[0]) });
}));

app.post('/api/auth/login', handle(async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: signToken(rows[0].id), user: publicUser(rows[0]) });
}));

app.get('/api/me', requireAuth, handle(async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
  if (!rows[0]) return res.status(401).json({ error: 'User not found' });
  res.json(publicUser(rows[0]));
}));

// ---------- Lists ----------

app.get('/api/lists', requireAuth, handle(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT l.id, l.name, l.color, l.owner_id AS "ownerId", m.role,
            (SELECT COUNT(*)::int FROM tasks t WHERE t.list_id = l.id) AS "taskCount",
            (SELECT COUNT(*)::int FROM tasks t WHERE t.list_id = l.id AND t.completed) AS "doneCount",
            (SELECT COUNT(*)::int FROM list_members lm WHERE lm.list_id = l.id) AS "memberCount"
       FROM lists l
       JOIN list_members m ON m.list_id = l.id AND m.user_id = $1
      ORDER BY l.created_at`,
    [req.userId],
  );
  res.json(rows);
}));

app.post('/api/lists', requireAuth, handle(async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  const color = String(req.body.color ?? '#6366f1');
  if (!name) return res.status(400).json({ error: 'List name is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO lists (name, color, owner_id) VALUES ($1, $2, $3) RETURNING id, name, color, owner_id AS "ownerId"',
      [name, color, req.userId],
    );
    await client.query("INSERT INTO list_members (list_id, user_id, role) VALUES ($1, $2, 'owner')", [rows[0].id, req.userId]);
    await client.query('COMMIT');
    res.status(201).json({ ...rows[0], role: 'owner', taskCount: 0, doneCount: 0, memberCount: 1 });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

app.patch('/api/lists/:id', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  if ((await roleOn(listId, req.userId!)) !== 'owner') return res.status(403).json({ error: 'Only the owner can edit this list' });
  const { rows } = await pool.query(
    'UPDATE lists SET name = COALESCE($1, name), color = COALESCE($2, color) WHERE id = $3 RETURNING id, name, color',
    [req.body.name?.trim() || null, req.body.color || null, listId],
  );
  res.json(rows[0]);
}));

app.delete('/api/lists/:id', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  if ((await roleOn(listId, req.userId!)) !== 'owner') return res.status(403).json({ error: 'Only the owner can delete this list' });
  await pool.query('DELETE FROM lists WHERE id = $1', [listId]);
  res.status(204).end();
}));

// ---------- Members (sharing) ----------

app.get('/api/lists/:id/members', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  if (!(await roleOn(listId, req.userId!))) return res.status(404).json({ error: 'List not found' });
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, m.role FROM list_members m JOIN users u ON u.id = m.user_id
      WHERE m.list_id = $1 ORDER BY m.role DESC, u.name`,
    [listId],
  );
  res.json(rows);
}));

app.post('/api/lists/:id/members', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  if ((await roleOn(listId, req.userId!)) !== 'owner') return res.status(403).json({ error: 'Only the owner can share this list' });
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const { rows } = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
  if (!rows[0]) return res.status(404).json({ error: 'No user with that email. Ask them to sign up first.' });
  await pool.query(
    "INSERT INTO list_members (list_id, user_id, role) VALUES ($1, $2, 'editor') ON CONFLICT DO NOTHING",
    [listId, rows[0].id],
  );
  res.status(201).json({ ...publicUser(rows[0]), role: (await roleOn(listId, rows[0].id)) ?? 'editor' });
}));

app.delete('/api/lists/:id/members/:userId', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  const targetId = Number(req.params.userId);
  const myRole = await roleOn(listId, req.userId!);
  const leavingMyself = targetId === req.userId;
  if (!myRole || (!leavingMyself && myRole !== 'owner')) return res.status(403).json({ error: 'Not allowed' });
  if ((await roleOn(listId, targetId)) === 'owner') return res.status(400).json({ error: 'The owner cannot leave; delete the list instead' });
  await pool.query('DELETE FROM list_members WHERE list_id = $1 AND user_id = $2', [listId, targetId]);
  res.status(204).end();
}));

// ---------- Tasks ----------

const taskColumns = `t.id, t.list_id AS "listId", t.title, t.notes, to_char(t.due_date, 'YYYY-MM-DD') AS "dueDate",
  t.priority, t.completed, t.created_at AS "createdAt", t.updated_at AS "updatedAt",
  u.name AS "createdByName"`;

app.get('/api/lists/:id/tasks', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  if (!(await roleOn(listId, req.userId!))) return res.status(404).json({ error: 'List not found' });
  const { rows } = await pool.query(
    `SELECT ${taskColumns} FROM tasks t LEFT JOIN users u ON u.id = t.created_by
      WHERE t.list_id = $1 ORDER BY t.completed, t.due_date NULLS LAST, t.created_at DESC`,
    [listId],
  );
  res.json(rows);
}));

app.post('/api/lists/:id/tasks', requireAuth, handle(async (req, res) => {
  const listId = Number(req.params.id);
  if (!(await roleOn(listId, req.userId!))) return res.status(404).json({ error: 'List not found' });
  const title = String(req.body.title ?? '').trim();
  if (!title) return res.status(400).json({ error: 'Task title is required' });
  const { rows } = await pool.query(
    `WITH t AS (
       INSERT INTO tasks (list_id, title, notes, due_date, priority, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
     ) SELECT ${taskColumns} FROM t LEFT JOIN users u ON u.id = t.created_by`,
    [listId, title, req.body.notes ?? '', req.body.dueDate || null, req.body.priority ?? 'medium', req.userId],
  );
  res.status(201).json(rows[0]);
}));

app.patch('/api/tasks/:id', requireAuth, handle(async (req, res) => {
  const taskId = Number(req.params.id);
  const found = await pool.query('SELECT list_id FROM tasks WHERE id = $1', [taskId]);
  if (!found.rows[0] || !(await roleOn(found.rows[0].list_id, req.userId!))) return res.status(404).json({ error: 'Task not found' });

  const b = req.body;
  const { rows } = await pool.query(
    `WITH t AS (
       UPDATE tasks SET
         title     = COALESCE($1, title),
         notes     = COALESCE($2, notes),
         due_date  = CASE WHEN $3::boolean THEN $4::date ELSE due_date END,
         priority  = COALESCE($5, priority),
         completed = COALESCE($6, completed),
         updated_at = now()
       WHERE id = $7 RETURNING *
     ) SELECT ${taskColumns} FROM t LEFT JOIN users u ON u.id = t.created_by`,
    [
      typeof b.title === 'string' && b.title.trim() ? b.title.trim() : null,
      typeof b.notes === 'string' ? b.notes : null,
      'dueDate' in b,
      b.dueDate || null,
      b.priority ?? null,
      typeof b.completed === 'boolean' ? b.completed : null,
      taskId,
    ],
  );
  res.json(rows[0]);
}));

app.delete('/api/tasks/:id', requireAuth, handle(async (req, res) => {
  const taskId = Number(req.params.id);
  const found = await pool.query('SELECT list_id FROM tasks WHERE id = $1', [taskId]);
  if (!found.rows[0] || !(await roleOn(found.rows[0].list_id, req.userId!))) return res.status(404).json({ error: 'Task not found' });
  await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  res.status(204).end();
}));

// Make sure tables exist, then start listening.
await pool.query(schema);
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
