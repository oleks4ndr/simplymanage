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
import hbs from 'hbs';


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'hbs');

// ensure Express uses the views directory inside src
app.set('views', path.join(__dirname, 'views'));

import hbs from 'hbs';
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
function requireAdmin(req, res, next) {
  if (res.locals.isAdmin) return next();
  res.status(403).send('Forbidden');
}

// ------ Main Routes ----------
app.get('/', (req, res) => {
  return res.render('landing');
});

// Mount auth routes
app.use('/auth', authRoutes);


// ------ Start Server ----------
app.listen(process.env.PORT ?? 3000);

// Mount items routes (public)
app.use('/items', requireAuth, itemsRoutes);

// Mount cart routes (requires authentication)
app.use('/cart', requireAuth, cartRoutes);

// Mount loans routes (requires authentication)
app.use('/loans', requireAuth, loansRoutes);

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

