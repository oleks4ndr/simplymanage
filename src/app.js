import './config.js';
import './db.js';

import express from 'express';
import session from 'express-session';
import path from 'path';
import url from 'url';
import MySQLStore from 'express-mysql-session';
import { pool } from './db.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();

app.set('view engine', 'hbs');

// Middleware and Sessions
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false}));

const sessionStore = new MySQLStore({}, pool.promise ? pool.promise() : pool);

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

