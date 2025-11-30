// src/db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL Configuration for Aiven
let sslConfig = undefined;
if (process.env.DB_SSL === 'true') {
  // Try to read CA cert from file (local development)
  const caCertPath = path.resolve(__dirname, '../ca.pem');
  if (fs.existsSync(caCertPath)) {
    sslConfig = {
      ca: fs.readFileSync(caCertPath),
      rejectUnauthorized: true
    };
  } 
  // If CA cert is provided as environment variable (Render deployment)
  else if (process.env.DB_CA_CERT) {
    sslConfig = {
      ca: process.env.DB_CA_CERT,
      rejectUnauthorized: true
    };
  } 
  // Fallback: accept connection without cert verification
  else {
    sslConfig = {
      rejectUnauthorized: false
    };
  }
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'simplymanage',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig
};

// Pool for 'user' role (Public/Standard User)
const userPool = mysql.createPool({
  ...dbConfig,
  user: process.env.DB_USER_ROLE_USER || 'simply_user',
  password: process.env.DB_USER_ROLE_PASS || 'user_password',
});

// Pool for 'staff' role
const staffPool = mysql.createPool({
  ...dbConfig,
  user: process.env.DB_STAFF_ROLE_USER || 'simply_staff',
  password: process.env.DB_STAFF_ROLE_PASS || 'staff_password',
});

// Pool for 'admin' role
const adminPool = mysql.createPool({
  ...dbConfig,
  user: process.env.DB_ADMIN_ROLE_USER || 'simply_admin',
  password: process.env.DB_ADMIN_ROLE_PASS || 'admin_password',
});

// Export adminPool as default 'pool' for session store and backward compatibility
export const pool = adminPool;

export async function query(sql, params, role = 'user') {
  let selectedPool;

  switch (role) {
    case 'admin':
      selectedPool = adminPool;
      break;
    case 'staff':
      selectedPool = staffPool;
      break;
    case 'user':
    default:
      selectedPool = userPool;
      break;
  }

  const [rows] = await selectedPool.execute(sql, params);
  return rows;
}
