// src/routes/dashboard.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Staff dashboard
router.get('/', async (req, res) => {
  try {
    // TODO: Show pending loan requests, statistics, etc.
    res.send('Staff Dashboard - Coming soon');
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});

// All loans management
router.get('/loans', async (req, res) => {
  try {
    // TODO: Show all loans with filters
    res.send('All loans management - Coming soon');
  } catch (err) {
    console.error('Error loading loans:', err);
    res.status(500).send('Error loading loans');
  }
});

// Loan management page
router.get('/loans/:id', async (req, res) => {
  try {
    // TODO: Show loan details with approval/reject options
    res.send(`Loan management for loan ${req.params.id} - Coming soon`);
  } catch (err) {
    console.error('Error loading loan:', err);
    res.status(500).send('Error loading loan');
  }
});

// Approve loan
router.post('/loans/:id/approve', async (req, res) => {
  try {
    // TODO: Approve loan and assign specific assets
    res.redirect(`/dashboard/loans/${req.params.id}`);
  } catch (err) {
    console.error('Error approving loan:', err);
    res.status(500).send('Error approving loan');
  }
});

// Reject loan
router.post('/loans/:id/reject', async (req, res) => {
  try {
    // TODO: Reject loan request
    res.redirect(`/dashboard/loans/${req.params.id}`);
  } catch (err) {
    console.error('Error rejecting loan:', err);
    res.status(500).send('Error rejecting loan');
  }
});

// Check in returned items
router.post('/loans/:id/checkin', async (req, res) => {
  try {
    // TODO: Check in returned items
    res.redirect(`/dashboard/loans/${req.params.id}`);
  } catch (err) {
    console.error('Error checking in loan:', err);
    res.status(500).send('Error checking in loan');
  }
});

export default router;
