import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

pool.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
  })
  .catch((err: Error) => {
    console.error('❌ Error connecting to the database:', err);
  });

export default pool;
