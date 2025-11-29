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
    const users = await query(
      'SELECT u_id, u_fname, u_lname, u_email, u_role, u_active FROM users ORDER BY u_id ASC',
      [],
      'admin'
    );
    res.render('admin/users', {
      title: 'User Management',
      users
    });
  } catch (err) {
    console.error('Error loading users:', err);
    res.status(500).send('Error loading users');
  }
});

// Update user role
router.post('/users/role', async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    
    // Basic validation
    if (!['user', 'staff', 'admin'].includes(newRole)) {
      return res.status(400).send('Invalid role');
    }

    // Prevent changing own role to avoid locking oneself out (optional but good practice)
    if (parseInt(userId) === req.session.user.u_id) {
       // For now, let's allow it but maybe warn? Or just allow it. 
       // If I demote myself, I lose access immediately.
    }

    await query(
      'UPDATE users SET u_role = ? WHERE u_id = ?', 
      [newRole, userId],
      'admin'
    );
    
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).send('Error updating user role');
  }
});

export default router;
