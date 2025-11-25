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
    
    res.render('cart', {
      title: 'Cart',
      cartItems
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
    
    if (cart.length === 0) {
      return res.redirect('/cart');
    }
    
    // TODO: Create loan request with status 'pending'
    // TODO: Clear cart after successful checkout
    
    res.send('Checkout - Coming soon');
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).send('Error during checkout');
  }
});

export default router;
