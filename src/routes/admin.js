// src/routes/admin.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Middleware to handle flash messages
router.use((req, res, next) => {
  if (req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
});

// Admin Dashboard
router.get('/', async (req, res) => {
  try {
    // Get statistics
    const totalUsers = await query(
      'SELECT COUNT(*) as count FROM users',
      [],
      'admin'
    );
    const totalItems = await query(
      'SELECT COUNT(*) as count FROM items',
      [],
      'admin'
    );
    const totalAssets = await query(
      'SELECT COUNT(*) as count FROM assets',
      [],
      'admin'
    );
    const openMessages = await query(
      'SELECT COUNT(*) as count FROM contact_tickets WHERE status = ?',
      ['open'],
      'admin'
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        totalUsers: totalUsers[0].count,
        totalItems: totalItems[0].count,
        totalAssets: totalAssets[0].count,
        openMessages: openMessages[0].count
      }
    });
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});

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
      users,
      currentUserId: req.session.user.u_id
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
    if (!userId || !newRole) {
      req.session.flash = { type: 'error', message: 'Missing required fields' };
      return res.redirect('/admin/users');
    }

    if (!['user', 'staff', 'admin'].includes(newRole)) {
      req.session.flash = { type: 'error', message: 'Invalid role selected' };
      return res.redirect('/admin/users');
    }

    // Prevent changing own role to avoid locking oneself out
    if (parseInt(userId) === req.session.user.u_id) {
      req.session.flash = { type: 'error', message: 'Cannot change your own role' };
      return res.redirect('/admin/users');
    }

    await query(
      'UPDATE users SET u_role = ? WHERE u_id = ?', 
      [newRole, userId],
      'admin'
    );
    
    req.session.flash = { type: 'success', message: 'User role updated successfully' };
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error updating user role:', err);
    req.session.flash = { type: 'error', message: 'Error updating user role' };
    res.redirect('/admin/users');
  }
});

// Toggle user active status
router.post('/users/toggle-status', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validation
    if (!userId) {
      req.session.flash = { type: 'error', message: 'User ID is required' };
      return res.redirect('/admin/users');
    }

    // Prevent toggling own status
    if (parseInt(userId) === req.session.user.u_id) {
      req.session.flash = { type: 'error', message: 'Cannot change your own active status' };
      return res.redirect('/admin/users');
    }

    // Toggle the status (flip the boolean)
    await query(
      'UPDATE users SET u_active = NOT u_active WHERE u_id = ?',
      [userId],
      'admin'
    );

    req.session.flash = { type: 'success', message: 'User status updated successfully' };
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error toggling user status:', err);
    req.session.flash = { type: 'error', message: 'Error updating user status' };
    res.redirect('/admin/users');
  }
});

// Delete user
router.post('/users/delete', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validation
    if (!userId) {
      req.session.flash = { type: 'error', message: 'User ID is required' };
      return res.redirect('/admin/users');
    }

    // Prevent deleting yourself
    if (parseInt(userId) === req.session.user.u_id) {
      req.session.flash = { type: 'error', message: 'Cannot delete your own account' };
      return res.redirect('/admin/users');
    }

    // Check if user has active loans
    const activeLoans = await query(
      'SELECT COUNT(*) as count FROM loans WHERE u_id = ? AND l_status IN ("pending", "open", "active")',
      [userId],
      'admin'
    );

    if (activeLoans[0].count > 0) {
      req.session.flash = { 
        type: 'error', 
        message: 'Cannot delete user with active loans. Please close all loans first.' 
      };
      return res.redirect('/admin/users');
    }

    // Call stored procedure to delete user
    await query(
      'CALL delete_user(?)',
      [userId],
      'admin'
    );

    req.session.flash = { type: 'success', message: 'User deleted successfully' };
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    
    // Handle foreign key constraint errors
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      req.session.flash = { 
        type: 'error', 
        message: 'Cannot delete user due to existing references. Please contact system administrator.' 
      };
    } else {
      req.session.flash = { type: 'error', message: 'Error deleting user' };
    }
    
    res.redirect('/admin/users');
  }
});

// =============================================
// AUDIT HISTORY ROUTES
// =============================================

// Item Additions Audit History
router.get('/audit/additions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const entityTypeFilter = req.query.entityType || '';

    // Build WHERE clause for filtering
    let whereClause = '';
    let params = [];
    if (entityTypeFilter && ['ITEM', 'CATEGORY'].includes(entityTypeFilter)) {
      whereClause = 'WHERE iah.entity_type = ?';
      params.push(entityTypeFilter);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM item_additions_history iah ${whereClause}`;
    const countResult = await query(countQuery, params, 'admin');
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Get audit records
    const additions = await query(
      `SELECT 
        iah.addition_id,
        iah.entity_type,
        iah.entity_id,
        iah.added_at,
        u.u_fname,
        u.u_lname,
        u.u_email,
        CASE 
          WHEN iah.entity_type = 'ITEM' THEN i.it_name
          WHEN iah.entity_type = 'CATEGORY' THEN c.cat_name
        END as entity_name
      FROM item_additions_history iah
      LEFT JOIN users u ON iah.added_by = u.u_id
      LEFT JOIN items i ON iah.entity_type = 'ITEM' AND iah.entity_id = i.it_id
      LEFT JOIN categories c ON iah.entity_type = 'CATEGORY' AND iah.entity_id = c.cat_id
      ${whereClause}
      ORDER BY iah.added_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      params,
      'admin'
    );

    res.render('admin/auditAdditions', {
      title: 'Item Additions Audit History',
      additions,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords
      },
      filter: {
        entityType: entityTypeFilter
      }
    });
  } catch (err) {
    console.error('Error loading additions audit:', err);
    res.status(500).send('Error loading audit history');
  }
});

// Item Modifications Audit History
router.get('/audit/modifications', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const actionTypeFilter = req.query.actionType || '';

    // Build WHERE clause for filtering
    let whereClause = '';
    let params = [];
    if (actionTypeFilter && ['INSERT', 'UPDATE', 'DELETE'].includes(actionTypeFilter)) {
      whereClause = 'WHERE imh.action_type = ?';
      params.push(actionTypeFilter);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM item_modification_history imh ${whereClause}`;
    const countResult = await query(countQuery, params, 'admin');
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Get modifications
    const modifications = await query(
      `SELECT 
        imh.history_id,
        imh.it_id,
        imh.action_type,
        imh.old_info,
        imh.new_info,
        imh.modified_at,
        i.it_name
      FROM item_modification_history imh
      LEFT JOIN items i ON imh.it_id = i.it_id
      ${whereClause}
      ORDER BY imh.modified_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      params,
      'admin'
    );

    // Parse JSON fields
    modifications.forEach(mod => {
      // Handle old_info - can be either JSON string or already parsed object
      if (mod.old_info) {
        try {
          // If it's already an object (MySQL JSON type), use it directly
          mod.old_info_parsed = typeof mod.old_info === 'string' 
            ? JSON.parse(mod.old_info) 
            : mod.old_info;
        } catch (e) {
          console.error('Error parsing old_info:', e);
          mod.old_info_parsed = null;
        }
      }
      
      // Handle new_info - can be either JSON string or already parsed object
      if (mod.new_info) {
        try {
          // If it's already an object (MySQL JSON type), use it directly
          mod.new_info_parsed = typeof mod.new_info === 'string' 
            ? JSON.parse(mod.new_info) 
            : mod.new_info;
        } catch (e) {
          console.error('Error parsing new_info:', e);
          mod.new_info_parsed = null;
        }
      }
    });

    res.render('admin/auditModifications', {
      title: 'Item Modifications Audit History',
      modifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords
      },
      filter: {
        actionType: actionTypeFilter
      }
    });
  } catch (err) {
    console.error('Error loading modifications audit:', err);
    res.status(500).send('Error loading audit history');
  }
});

// User Role Changes Audit History
router.get('/audit/roles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as count FROM user_role_audit',
      [],
      'admin'
    );
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Get role changes
    const roleChanges = await query(
      `SELECT 
        ura.audit_id,
        ura.uid,
        u.u_fname,
        u.u_lname,
        u.u_email,
        ura.old_role,
        ura.new_role,
        ura.changed_at,
        ura.changed_by
      FROM user_role_audit ura
      LEFT JOIN users u ON ura.uid = u.u_id
      ORDER BY ura.changed_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      [],
      'admin'
    );

    res.render('admin/auditRoles', {
      title: 'User Role Changes Audit History',
      roleChanges,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords
      }
    });
  } catch (err) {
    console.error('Error loading role audit:', err);
    res.status(500).send('Error loading audit history');
  }
});

// =============================================
// USER MESSAGES / CONTACT TICKETS ROUTES
// =============================================

// View all contact messages
router.get('/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || 'all';

    // Build WHERE clause for filtering
    let whereClause = '';
    let params = [];
    if (statusFilter && ['open', 'resolved'].includes(statusFilter)) {
      whereClause = 'WHERE ct.status = ?';
      params.push(statusFilter);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM contact_tickets ct ${whereClause}`;
    const countResult = await query(countQuery, params, 'admin');
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Get statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM contact_tickets`,
      [],
      'admin'
    );
    const stats = statsResult[0];

    // Get messages
    const messages = await query(
      `SELECT 
        ct.ticket_id,
        ct.user_id,
        ct.c_fname,
        ct.c_lname,
        ct.c_email,
        ct.subject,
        ct.message,
        ct.status,
        ct.created_at,
        u.u_fname,
        u.u_lname,
        u.u_email as user_email
      FROM contact_tickets ct
      LEFT JOIN users u ON ct.user_id = u.u_id
      ${whereClause}
      ORDER BY ct.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      params,
      'admin'
    );

    res.render('admin/messages', {
      title: 'User Messages',
      messages,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords
      },
      filter: {
        status: statusFilter
      }
    });
  } catch (err) {
    console.error('Error loading messages:', err);
    res.status(500).send('Error loading messages');
  }
});

// Mark message as resolved
router.post('/messages/mark-resolved', async (req, res) => {
  try {
    const { ticketId } = req.body;
    
    if (!ticketId) {
      req.session.flash = { type: 'error', message: 'Ticket ID is required' };
      return res.redirect('/admin/messages');
    }

    await query(
      'UPDATE contact_tickets SET status = ? WHERE ticket_id = ?',
      ['resolved', ticketId],
      'admin'
    );

    req.session.flash = { type: 'success', message: 'Message marked as resolved' };
    res.redirect('/admin/messages');
  } catch (err) {
    console.error('Error marking message as resolved:', err);
    req.session.flash = { type: 'error', message: 'Error updating message status' };
    res.redirect('/admin/messages');
  }
});

export default router;
