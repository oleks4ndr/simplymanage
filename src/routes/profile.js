// src/routes/profile.js
import express from 'express';
import { query } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// GET /profile - show user profile
router.get('/', async (req, res) => {
  const user = req.session.user;
  // Keep it simple: data comes from session for display
  return res.render('profile', {
    userDetails: {
      name: `${user.u_fname} ${user.u_lname}`,
      email: user.u_email,
      role: user.u_role,
    }
  });
});

// POST /profile/change-password - change user password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const uid = req.session.user.u_id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).render('profile', {
        userDetails: {
          name: `${req.session.user.u_fname} ${req.session.user.u_lname}`,
          email: req.session.user.u_email,
          role: req.session.user.u_role,
        },
        error: 'All password fields are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).render('profile', {
        userDetails: {
          name: `${req.session.user.u_fname} ${req.session.user.u_lname}`,
          email: req.session.user.u_email,
          role: req.session.user.u_role,
        },
        error: 'New passwords do not match.'
      });
    }

    // Fetch user with password hash
    const rows = await query('SELECT u_password FROM users WHERE u_id = ?', [uid]);
    const dbUser = rows[0];
    if (!dbUser) {
      return res.status(404).render('profile', {
        userDetails: {
          name: `${req.session.user.u_fname} ${req.session.user.u_lname}`,
          email: req.session.user.u_email,
          role: req.session.user.u_role,
        },
        error: 'User not found.'
      });
    }

    const match = await bcrypt.compare(currentPassword, dbUser.u_password);
    if (!match) {
      return res.status(401).render('profile', {
        userDetails: {
          name: `${req.session.user.u_fname} ${req.session.user.u_lname}`,
          email: req.session.user.u_email,
          role: req.session.user.u_role,
        },
        error: 'Current password is incorrect.'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET u_password = ? WHERE u_id = ?', [hashed, uid]);

    return res.render('profile', {
      userDetails: {
        name: `${req.session.user.u_fname} ${req.session.user.u_lname}`,
        email: req.session.user.u_email,
        role: req.session.user.u_role,
      },
      success: 'Password updated successfully.'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).render('profile', {
      userDetails: {
        name: `${req.session.user.u_fname} ${req.session.user.u_lname}`,
        email: req.session.user.u_email,
        role: req.session.user.u_role,
      },
      error: 'An error occurred while changing password.'
    });
  }
});

export default router;
