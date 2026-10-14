import 'dotenv/config';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lists (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  owner_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS list_members (
  list_id  INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role     TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (list_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id         SERIAL PRIMARY KEY,
  list_id    INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  notes      TEXT NOT NULL DEFAULT '',
  due_date   DATE,
  priority   TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed  BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_list_id_idx ON tasks(list_id);
CREATE INDEX IF NOT EXISTS list_members_user_id_idx ON list_members(user_id);
`;
