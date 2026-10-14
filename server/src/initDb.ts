import { pool, schema } from './db.js';

await pool.query(schema);
console.log('Database schema is ready.');
await pool.end();
