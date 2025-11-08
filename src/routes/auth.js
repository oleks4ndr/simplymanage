// src/routes/auth.js
import express from 'express';
import { query } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  // Lookup user and implement proper password hashing (bcrypt)
  const rows = await query('SELECT id, name, role FROM users WHERE email = ? AND password = ?', [email, password]);
  const user = rows[0];
  if (!user) {
    return res.status(401).render('login', { error: 'Invalid credentials' });
  }
  // Save minimal info to session (id is sufficient; role/name for convenience)
  req.session.userId = user.id;
  // attach role/name to session
  req.session.userRole = user.role;
  req.session.userName = user.name;

  // persist session and redirect
  req.session.save(err => {
    if (err) return next(err);
    return res.redirect('/');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    // ignore err for now
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

router.post('/register', async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).render('register', { error: 'Passwords do not match' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, 'user']);
    const rows = await query('SELECT id, name, role FROM users WHERE email = ?', [email]);
    const user = rows[0];

    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    req.session.save(err => {
      if (err) return next(err);
      return res.redirect('/');
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render('register', { error: 'Error registering user' });
  }
});

export default router;