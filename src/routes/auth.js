// src/routes/auth.js
import express from 'express';
import { query } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  const registered = req.query.registered === 'true';
  res.render('login', { 
    success: registered ? 'Registration successful! Please login.' : null 
  });
});

router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register');
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', { 
        error: 'Email and password are required',
        email: email || ''
      });
    }

    // Query user by email using prefixed column names
    const rows = await query(
      'SELECT u_id, u_fname, u_lname, u_email, u_password, u_role, u_active FROM users WHERE u_email = ?', 
      [email]
    );
    
    const user = rows[0];
    if (!user) {
      return res.status(401).render('login', { 
        error: 'Invalid email or password',
        email: email
      });
    }

    // Check if user is active
    if (!user.u_active) {
      return res.status(403).render('login', { 
        error: 'Account is disabled. Please contact support.',
        email: email
      });
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.u_password);
    if (!passwordMatch) {
      return res.status(401).render('login', { 
        error: 'Invalid email or password',
        email: email
      });
    }

    // Store user info in session with prefixed properties
    req.session.user = {
      u_id: user.u_id,
      u_fname: user.u_fname,
      u_lname: user.u_lname,
      u_email: user.u_email,
      u_role: user.u_role
    };

    // persist session and redirect
    req.session.save(err => {
      if (err) return next(err);
      
      // Redirect based on role
      if (user.u_role === 'admin' || user.u_role === 'staff') {
        return res.redirect('/dashboard');
      } else {
        return res.redirect('/');
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('login', { 
      error: 'An error occurred during login',
      email: req.body.email || ''
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

router.post('/register', async (req, res, next) => {
  try {
    const { fname, lname, email, password, confirmPassword } = req.body;

    // Validation
    if (!fname || !lname || !email || !password) {
      return res.status(400).render('register', { 
        error: 'All fields are required',
        fname: fname || '',
        lname: lname || '',
        email: email || ''
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('register', { 
        error: 'Passwords do not match',
        fname: fname,
        lname: lname,
        email: email
      });
    }

    // Check if user already exists
    const existingUsers = await query('SELECT u_id FROM users WHERE u_email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).render('register', { 
        error: 'Email already registered',
        fname: fname,
        lname: lname,
        email: email
      });
    }

    // Get the next available user ID
    const maxIdResult = await query('SELECT MAX(u_id) as max_id FROM users');
    const nextId = (maxIdResult[0].max_id || 0) + 1;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with prefixed column names
    await query(
      'INSERT INTO users (u_id, u_fname, u_lname, u_email, u_password, u_role, u_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nextId, fname, lname, email, hashedPassword, 'user', true]
    );

    // Auto-login: Store user info in session
    req.session.user = {
      u_id: nextId,
      u_fname: fname,
      u_lname: lname,
      u_email: email,
      u_role: 'user'
    };

    // Save session and redirect to home
    req.session.save(err => {
      if (err) return next(err);
      return res.redirect('/');
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).render('register', { 
      error: 'An error occurred during registration',
      fname: req.body.fname || '',
      lname: req.body.lname || '',
      email: req.body.email || ''
    });
  }
});

export default router;