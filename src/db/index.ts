import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
  })
  .catch((err: Error) => {
    console.error('❌ Error connecting to the database:', err);
  });
