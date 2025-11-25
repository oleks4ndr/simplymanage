// src/routes/admin.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Manage items
router.get('/items', async (req, res) => {
  try {
    // TODO: Show all items with add/edit/delete options
    res.send('Admin: Manage items - Coming soon');
  } catch (err) {
    console.error('Error loading items:', err);
    res.status(500).send('Error loading items');
  }
});

// Manage assets
router.get('/assets', async (req, res) => {
  try {
    // TODO: Show all assets with add/edit/delete options
    res.send('Admin: Manage assets - Coming soon');
  } catch (err) {
    console.error('Error loading assets:', err);
    res.status(500).send('Error loading assets');
  }
});

// Manage users
router.get('/users', async (req, res) => {
  try {
    // TODO: Show all users with view/edit/deactivate options
    res.send('Admin: Manage users - Coming soon');
  } catch (err) {
    console.error('Error loading users:', err);
    res.status(500).send('Error loading users');
  }
});

export default router;
