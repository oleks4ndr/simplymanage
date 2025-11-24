import './config.js';
import './db.js';

import express from 'express';
import session from 'express-session';
import path from 'path';
import url from 'url';
import mysqlSession from 'express-mysql-session';
import { pool, query } from './db.js';
import authRoutes from './routes/auth.js';
import hbs from 'hbs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3000;

app.set('view engine', 'hbs');

// ensure Express uses the views directory inside src
app.set('views', path.join(__dirname, 'views'));

// register partials directory so {{> navbar}} works
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// ------ Middleware and Sessions ----------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false}));

// express-mysql-session exports a factory that needs the session module
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({}, pool);

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  }
}));

app.use(async (req, res, next) => {
  res.locals.user = null;
  res.locals.isAdmin = false;
  res.locals.isAuthenticated = false;

  try {
    if (req.session && req.session.userId) {
      // Fetch fresh user from DB
      const rows = await query('SELECT id, name, role FROM users WHERE id = ?', [req.session.userId]);
      if (rows[0]) {
        res.locals.user = rows[0];
        res.locals.isAuthenticated = true;
        res.locals.isAdmin = rows[0].role === 'admin';
      }
    }
  } catch (err) {
    return next(err);
  }
  next();
});

// ------ Helper Functions ----------

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully.');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.code);
    process.exit(1); // Stop the server
  }
}

function requireAdmin(req, res, next) {
  if (res.locals.isAdmin) return next();
  res.status(403).send('Forbidden');
}

// ------ Test SQL DB ----------
app.get('/test-db', async (req, res) => {
  try {
    const users = await query("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database test failed" });
  }
});


// ------ Main Routes ----------
app.get('/', (req, res) => {
  return res.render('landing');
});

// Mount auth routes
app.use('/auth', authRoutes);

// ------ Start Server ----------
async function startServer() {
  await testDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}/`);
  });
}

startServer();
