// src/routes/loans.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// View user's loans
router.get('/', async (req, res) => {
  try {
    const userId = req.session.user.u_id;

    // Fetch pending loans (not yet checked out)
    const pendingRows = await query(
      `SELECT l.l_id, l.l_status, l.l_checked_out_at, l.l_due_at, l.l_checked_in_at,
              a.a_id, it.it_name, it.it_image_url
         FROM loans l
         LEFT JOIN loan_details ld ON ld.l_id = l.l_id
         LEFT JOIN assets a ON a.a_id = ld.a_id
         LEFT JOIN items it ON it.it_id = a.it_id
        WHERE l.u_id = ? AND l.l_checked_out_at IS NULL
        ORDER BY l.l_id DESC`,
      [userId]
    );

    // Fetch current loans (checked out but not yet checked in)
    const currentRows = await query(
      `SELECT l.l_id, l.l_status, l.l_checked_out_at, l.l_due_at, l.l_checked_in_at,
              a.a_id, it.it_name, it.it_image_url
         FROM loans l
         LEFT JOIN loan_details ld ON ld.l_id = l.l_id
         LEFT JOIN assets a ON a.a_id = ld.a_id
         LEFT JOIN items it ON it.it_id = a.it_id
        WHERE l.u_id = ? AND l.l_checked_out_at IS NOT NULL AND l.l_checked_in_at IS NULL
        ORDER BY l.l_id DESC`,
      [userId]
    );

    function groupLoans(rows) {
      const map = new Map();
      for (const r of rows) {
        if (!map.has(r.l_id)) {
          map.set(r.l_id, {
            l_id: r.l_id,
            l_status: r.l_status,
            l_checked_out_at: r.l_checked_out_at,
            l_due_at: r.l_due_at,
            l_checked_in_at: r.l_checked_in_at,
            items: [],
          });
        }
        if (r.a_id) {
          map.get(r.l_id).items.push({
            a_id: r.a_id,
            it_name: r.it_name,
            it_image_url: r.it_image_url,
          });
        }
      }
      return Array.from(map.values());
    }

    const pendingLoans = groupLoans(pendingRows).map(l => ({
      ...l,
      displayStatus: 'Pending',
    }));
    const currentLoans = groupLoans(currentRows).map(l => ({
      ...l,
      displayStatus: 'Checked Out',
    }));

    return res.render('loans', { pendingLoans, currentLoans });
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
