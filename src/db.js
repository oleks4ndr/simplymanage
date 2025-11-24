// src/db.js
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'simplymanage',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function query(sql, params) {
  console.debug('QUERY:', sql, '| PARAMS:', params);
  const [rows] = await pool.execute(sql, params);
  return rows;
}