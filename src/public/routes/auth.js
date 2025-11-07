// src/routes/auth.js
import express from 'express';
import { query } from '../db.js';
const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  // Lookup user - implement proper password hashing (bcrypt)
  const rows = await query('SELECT id, name, role FROM users WHERE email = ? AND password = ?', [email, password]);
  const user = rows[0];
  if (!user) {
    return res.status(401).render('login', { error: 'Invalid credentials' });
  }
  // Save minimal info to session (id is sufficient; role/name for convenience)
  req.session.userId = user.id;
  // optionally attach role/name to session
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

export default router;