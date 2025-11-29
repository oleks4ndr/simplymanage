// src/db.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'simplymanage',
  waitForConnections: true,
  connectionLimit: 10,
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

  console.debug(`QUERY [${role}]:`, sql, '| PARAMS:', params);
  const [rows] = await selectedPool.execute(sql, params);
  return rows;
}
