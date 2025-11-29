// src/routes/cart.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// View cart
router.get('/', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    // Fetch item details for items in cart
    let cartItems = [];
    if (cart.length > 0) {
      const itemIds = cart.map(c => c.itemId);
      const placeholders = itemIds.map(() => '?').join(',');
      
      cartItems = await query(`
        SELECT 
          i.*,
          COUNT(CASE WHEN a.a_status = 'available' THEN 1 END) as available_count
        FROM items i
        LEFT JOIN assets a ON i.it_id = a.it_id
        WHERE i.it_id IN (${placeholders})
        GROUP BY i.it_id
      `, itemIds);
      
      // Merge with cart quantity
      cartItems = cartItems.map(item => ({
        ...item,
        quantity: cart.find(c => c.itemId === item.it_id)?.quantity || 1
      }));
    }

    // Calculate minimum max timeout
    let minMaxTimeout = 0;
    let maxDateStr = '';
    
    if (cartItems.length > 0) {
      // Find the smallest it_max_time_out among all items
      minMaxTimeout = Math.min(...cartItems.map(i => i.it_max_time_out));
      
      // Calculate the date: Today + minMaxTimeout days
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + minMaxTimeout);
      
      // Format as YYYY-MM-DD for HTML input
      maxDateStr = maxDate.toISOString().split('T')[0];
    }
    
    res.render('cart', {
      title: 'Cart',
      cartItems,
      minMaxTimeout,
      maxDateStr,
      todayStr: new Date().toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Error loading cart:', err);
    res.status(500).send('Error loading cart');
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Check if item already in cart
    const existingIndex = req.session.cart.findIndex(c => c.itemId === parseInt(itemId));
    
    if (existingIndex >= 0) {
      req.session.cart[existingIndex].quantity += parseInt(quantity);
    } else {
      req.session.cart.push({
        itemId: parseInt(itemId),
        quantity: parseInt(quantity)
      });
    }
    
    req.session.save(err => {
      if (err) {
        console.error('Error saving cart:', err);
        return res.status(500).send('Error adding to cart');
      }
      res.redirect('/cart');
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).send('Error adding to cart');
  }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (req.session.cart) {
      req.session.cart = req.session.cart.filter(c => c.itemId !== parseInt(itemId));
      
      req.session.save(err => {
        if (err) {
          console.error('Error removing from cart:', err);
        }
        res.redirect('/cart');
      });
    } else {
      res.redirect('/cart');
    }
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).send('Error removing from cart');
  }
});

// Checkout cart - create loan request
router.post('/checkout', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const { returnDate } = req.body;
    
    if (cart.length === 0) {
      return res.redirect('/cart');
    }

    if (!returnDate) {
      return res.status(400).send('Return date is required');
    }
    
    // 1. Create Loan Record (Pending)
    // We use 'staff' pool here to allow reserving assets (updating asset status)
    // This is a system action triggered by user checkout.
    // l_checked_out_at is NULL until approved
    const loanResult = await query(
      `INSERT INTO loans (u_id, l_status, l_checked_out_at, l_due_at) VALUES (?, 'pending', NULL, ?)`,
      [req.session.user.u_id, returnDate],
      'staff' 
    );
    
    const loanId = loanResult.insertId;
    
    // 2. Process each item in cart
    for (const cartItem of cart) {
      const { itemId, quantity } = cartItem;
      
      // Find 'quantity' number of available assets for this item
      // Note: Interpolating LIMIT because prepared statements for LIMIT can be flaky in some drivers
      const limit = parseInt(quantity);
      const assets = await query(
        `SELECT a_id FROM assets WHERE it_id = ? AND a_status = 'available' LIMIT ${limit}`,
        [itemId],
        'staff'
      );
      
      if (assets.length < quantity) {
        // Rollback logic would go here in a real transaction
        // For now, we just fail or take what we can get
        console.warn(`Not enough assets for item ${itemId}. Requested: ${quantity}, Found: ${assets.length}`);
      }
      
      // 3. Reserve Assets and Link to Loan
      for (const asset of assets) {
        // Link to loan
        await query(
          `INSERT INTO loan_details (l_id, a_id) VALUES (?, ?)`,
          [loanId, asset.a_id],
          'staff'
        );
        
        // Mark asset as reserved (using 'loaned' status for simplicity, or add 'reserved' to enum)
        await query(
          `UPDATE assets SET a_status = 'loaned' WHERE a_id = ?`,
          [asset.a_id],
          'staff'
        );
      }
    }
    
    // 4. Clear Cart
    req.session.cart = [];
    req.session.save(err => {
      if (err) console.error('Error clearing cart:', err);
      res.redirect('/loans');
    });
    
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).send('Error during checkout');
  }
});

export default router;
