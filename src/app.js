//libraries
import './config.js';
import './db.js';

import express from 'express';
import session from 'express-session';
import path from 'path';
import url from 'url';
import mysqlSession from 'express-mysql-session';
import { pool, query } from './db.js';
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
import cartRoutes from './routes/cart.js';
import loansRoutes from './routes/loans.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import profileRoutes from './routes/profile.js';
import hbs from 'hbs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3000;

app.set('view engine', 'hbs');

// ensure Express uses the views directory inside src
app.set('views', path.join(__dirname, 'views'));

// register partials directory so {{> navbar}} works
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Register Handlebars helpers
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

hbs.registerHelper('or', function() {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});

hbs.registerHelper('gt', function(a, b) {
  return a > b;
});

hbs.registerHelper('not', function(value) {
  return !value;
});

hbs.registerHelper('toString', function(value) {
  return String(value);
});

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

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user && (req.session.user.u_role === 'admin');
  res.locals.isStaff = req.session.user && (req.session.user.u_role === 'staff' || req.session.user.u_role === 'admin');
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

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.u_role !== 'admin') {
    return res.status(403).send('Forbidden: Admin access required');
  }
  next();
}

function requireStaff(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.u_role !== 'staff' && req.session.user.u_role !== 'admin') {
    return res.status(403).send('Forbidden: Staff access required');
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    if (!roles.includes(req.session.user.u_role)) {
      return res.status(403).send('Forbidden: Insufficient permissions');
    }
    next();
  };
}

app.use((req, res, next) => {
  console.log(req.session.user);
  next();
})

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

// Mount items routes (public)
app.use('/items', requireAuth, itemsRoutes);

// Mount cart routes (requires authentication)
app.use('/cart', requireAuth, cartRoutes);

// Mount loans routes (requires authentication)
app.use('/loans', requireAuth, loansRoutes);

// Mount profile routes (requires authentication)
app.use('/profile', requireAuth, profileRoutes);

// Mount dashboard routes (requires staff/admin)
app.use('/dashboard', requireStaff, dashboardRoutes);

// Mount admin routes (requires admin)
app.use('/admin', requireAdmin, adminRoutes);

// Contact page (public)
app.use('/contact', contactRoutes);

// ------ Start Server ----------
async function startServer() {
  await testDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}/`);
  });
}

startServer();
