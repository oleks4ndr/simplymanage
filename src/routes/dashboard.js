// src/routes/dashboard.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Staff dashboard
router.get('/', async (req, res) => {
  try {
    // Fetch pending loans with user details and item count
    const pendingLoans = await query(`
      SELECT 
        l.l_id, 
        l.l_checked_out_at, 
        u.u_fname, 
        u.u_lname, 
        u.u_email,
        COUNT(ld.a_id) as item_count
      FROM loans l
      JOIN users u ON l.u_id = u.u_id
      LEFT JOIN loan_details ld ON l.l_id = ld.l_id
      WHERE l.l_status = 'pending'
      GROUP BY l.l_id, l.l_checked_out_at, u.u_fname, u.u_lname, u.u_email
      ORDER BY l.l_checked_out_at ASC
    `, [], 'staff');

    // Fetch current (active/open) loans with overdue status
    const currentLoans = await query(`
      SELECT 
        l.l_id, 
        l.l_checked_out_at,
        l.l_due_at,
        l.l_status,
        u.u_fname, 
        u.u_lname, 
        u.u_email,
        COUNT(ld.a_id) as item_count,
        CASE 
          WHEN l.l_due_at < NOW() THEN 1
          ELSE 0
        END as is_overdue
      FROM loans l
      JOIN users u ON l.u_id = u.u_id
      LEFT JOIN loan_details ld ON l.l_id = ld.l_id
      WHERE l.l_status IN ('active', 'open', 'overdue')
      GROUP BY l.l_id, l.l_checked_out_at, l.l_due_at, l.l_status, u.u_fname, u.u_lname, u.u_email
      ORDER BY l.l_due_at ASC
    `, [], 'staff');

    res.render('dashboard/index', {
      title: 'Staff Dashboard',
      pendingLoans,
      currentLoans
    });
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
    const loanId = req.params.id;

    // 1. Get Loan & User Info
    const loanResult = await query(`
      SELECT l.*, u.u_fname, u.u_lname, u.u_email 
      FROM loans l
      JOIN users u ON l.u_id = u.u_id
      WHERE l.l_id = ?
    `, [loanId], 'staff');

    if (loanResult.length === 0) {
      return res.status(404).send('Loan not found');
    }

    const loan = loanResult[0];

    const items = await query(`
      SELECT i.it_id, i.it_name, i.it_sku, a.a_id, a.a_condition
      FROM loan_details ld
      JOIN assets a ON ld.a_id = a.a_id
      JOIN items i ON a.it_id = i.it_id
      WHERE ld.l_id = ?
    `, [loanId], 'staff');
    
    res.render('dashboard/loanDetail', {
      title: `Review Loan #${loanId}`,
      loan,
      items,
      availableAssets: [] 
    });

  } catch (err) {
    console.error('Error loading loan:', err);
    res.status(500).send('Error loading loan');
  }
});

// Approve loan
router.post('/loans/:id/approve', async (req, res) => {
  try {
    const loanId = req.params.id;
    
    await query(
      `UPDATE loans SET l_status = 'active', l_checked_out_at = NOW() WHERE l_id = ?`,
      [loanId],
      'staff'
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error approving loan:', err);
    res.status(500).send('Error approving loan');
  }
});

// Reject loan
router.post('/loans/:id/reject', async (req, res) => {
  try {
    const loanId = req.params.id;

    // 1. Update Loan Status
    await query(
      `UPDATE loans SET l_status = 'rejected' WHERE l_id = ?`,
      [loanId],
      'staff'
    );

    // 2. Release Reserved Assets
    // Find all assets associated with this loan
    const assets = await query(
      `SELECT a_id FROM loan_details WHERE l_id = ?`,
      [loanId],
      'staff'
    );

    // Set them back to available
    for (const asset of assets) {
      await query(
        `UPDATE assets SET a_status = 'available' WHERE a_id = ?`,
        [asset.a_id],
        'staff'
      );
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error rejecting loan:', err);
    res.status(500).send('Error rejecting loan');
  }
});

// Check in returned items
router.post('/loans/:id/checkin', async (req, res) => {
  try {
    const loanId = req.params.id;

    // 1. Update loan status to closed and set check-in time
    await query(
      `UPDATE loans SET l_status = 'closed', l_checked_in_at = NOW() WHERE l_id = ?`,
      [loanId],
      'staff'
    );

    // 2. Get all assets from this loan
    const assets = await query(
      `SELECT a_id FROM loan_details WHERE l_id = ?`,
      [loanId],
      'staff'
    );

    // 3. Return all assets to available status
    for (const asset of assets) {
      await query(
        `UPDATE assets SET a_status = 'available' WHERE a_id = ?`,
        [asset.a_id],
        'staff'
      );
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error checking in loan:', err);
    res.status(500).send('Error checking in loan');
  }
});

export default router;
