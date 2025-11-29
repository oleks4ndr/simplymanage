// src/routes/items.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Rendering the page
router.get('/', (req, res) => {
  res.render('contact', {
    user: req.session.user || null
  });
});

// POSTing the form
router.post('/', async (req, res) => {
  try {
    const { fname, lname, email, subject, message } = req.body;

    // some security checks
    if (!email || !message) {
      return res.render('contact', {
        error: 'Email and message are required.',
        user: req.session.user || null
      });
    }

    if (message.length > 5000) {
      return res.render('contact', {
        error: 'Message is too long (max 5000 chars).',
        user: req.session.user || null
      });
    }

    // get the user id if logged in
    const userId = req.session.user ? req.session.user.u_id : null;

    // insert into db
    await query(
      `
      INSERT INTO contact_tickets (user_id, c_fname, c_lname, c_email, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [userId, fname || null, lname || null, email, subject || null, message]
    );

    // success
    res.render('contact', {
      success: "MESSAGE SENT! WE WILL GET BACK TO YOU SOON.",
      user: req.session.user || null
    });

  } catch (err) {
    console.error("Error submitting contact ticket:", err);

    res.render('contact', {
      error: "Something went wrong. Please try again later.",
      user: req.session.user || null
    });
  }
});

export default router;

