// src/routes/loans.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// View user's loans
router.get('/', async (req, res) => {
  try {
    // TODO: Fetch user's loans from database
    res.send('My loans page - Coming soon');
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).send('Error loading loans');
  }
});

// View specific loan details
router.get('/:id', async (req, res) => {
  try {
    // TODO: Fetch loan details
    res.send(`Loan detail page for loan ${req.params.id} - Coming soon`);
  } catch (err) {
    console.error('Error fetching loan:', err);
    res.status(500).send('Error loading loan');
  }
});

export default router;
