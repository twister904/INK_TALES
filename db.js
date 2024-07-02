import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config()
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

db.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Connection error', err.stack));

export default db;
