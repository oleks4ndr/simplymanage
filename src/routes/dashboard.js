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

    res.render('dashboard/index', {
      title: 'Staff Dashboard',
      pendingLoans
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

    // 2. Get Requested Items (Grouped by Item ID)
    // Note: In a real scenario, we need to know HOW MANY of each item were requested.
    // For now, let's assume the loan_details table ALREADY has entries for the requested items,
    // but the 'a_id' might be NULL or a placeholder if we haven't assigned them yet.
    // OR, if we are just storing "Item Requests" separately, we'd need a different table.
    //
    // BASED ON YOUR SCHEMA: `loan_details` links `l_id` and `a_id`.
    // This implies that when a user "checks out", we must have already assigned an asset OR
    // we need a way to store "Requested Item ID" before "Assigned Asset ID".
    //
    // CRITICAL FIX: The current schema `loan_details (l_id, a_id)` requires an Asset ID immediately.
    // If users only request an *Item Type*, we can't insert into `loan_details` yet if we don't know the asset.
    //
    // TEMPORARY WORKAROUND:
    // We will assume that for now, the system auto-assigned a random available asset at checkout (Phase 1 behavior),
    // OR we need to query what items are in this loan.
    //
    // Let's fetch the items currently associated with this loan.
    const items = await query(`
      SELECT i.it_id, i.it_name, i.it_sku, a.a_id, a.a_condition
      FROM loan_details ld
      JOIN assets a ON ld.a_id = a.a_id
      JOIN items i ON a.it_id = i.it_id
      WHERE ld.l_id = ?
    `, [loanId], 'staff');

    // For the "Re-assign" or "Review" UI, we might want to show available assets for these items.
    // For simplicity in this step, we will just show what is currently assigned.
    // If you want to change the asset, that would be a more complex UI.
    
    // Let's adjust the view to just "Review" the auto-assigned assets for now, 
    // unless you want to implement a "Swap Asset" feature.
    
    res.render('dashboard/loanDetail', {
      title: `Review Loan #${loanId}`,
      loan,
      items,
      // We can fetch available assets if we want to allow swapping
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
    
    // 1. Update Loan Status
    // Set l_checked_out_at to NOW() upon approval
    await query(
      `UPDATE loans SET l_status = 'active', l_checked_out_at = NOW() WHERE l_id = ?`,
      [loanId],
      'staff'
    );

    // 2. Handle Asset Swapping (Optional)
    // If the form sends new asset IDs (e.g., assets[itemId] = newAssetId), we would:
    // - Release the old asset (set status 'available')
    // - Reserve the new asset (set status 'loaned')
    // - Update loan_details
    // For Phase 2, we assume the auto-assigned assets are accepted.

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
    // TODO: Check in returned items
    res.redirect(`/dashboard/loans/${req.params.id}`);
  } catch (err) {
    console.error('Error checking in loan:', err);
    res.status(500).send('Error checking in loan');
  }
});

export default router;
