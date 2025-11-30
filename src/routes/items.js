// src/routes/items.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Helper middleware to check staff role
function checkStaff(req, res, next) {
  if (req.session.user && (req.session.user.u_role === 'staff' || req.session.user.u_role === 'admin')) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

// Show Add Item Form
router.get('/add', checkStaff, async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY cat_name ASC');
    const categoryTree = buildCategoryTree(categories);
    
    res.render('itemForm', {
      title: 'Add New Item',
      categories: categoryTree
    });
  } catch (err) {
    console.error('Error loading add item form:', err);
    res.status(500).send('Error loading form');
  }
});

// Process Add Item
router.post('/add', checkStaff, async (req, res) => {
  try {
    const { name, sku, categoryId, description, imageUrl, maxTimeOut, renewable, active } = req.body;
    
    // Set current user ID for audit trigger
    await query(
      'SET @current_user_id = ?',
      [req.session.user.u_id],
      'staff'
    );
    
    await query(
      `INSERT INTO items (it_name, it_sku, cat_id, it_description, it_image_url, it_max_time_out, it_renewable, it_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sku, categoryId, description, imageUrl, maxTimeOut, renewable === 'true', active === 'true'],
      'staff'
    );
    
    res.redirect('/items');
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).render('itemForm', { error: 'Error creating item' });
  }
});

// Show Edit Item Form
router.get('/:id/edit', checkStaff, async (req, res) => {
  try {
    const [item] = await query('SELECT * FROM items WHERE it_id = ?', [req.params.id]);
    if (!item) return res.status(404).send('Item not found');

    const categories = await query('SELECT * FROM categories ORDER BY cat_name ASC');
    const categoryTree = buildCategoryTree(categories);

    res.render('itemForm', {
      title: 'Edit Item',
      item,
      categories: categoryTree
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Error loading form');
  }
});

// Process Edit Item
router.post('/:id/edit', checkStaff, async (req, res) => {
  try {
    const { name, sku, categoryId, description, imageUrl, maxTimeOut, renewable, active } = req.body;
    
    await query(
      `UPDATE items SET 
        it_name = ?, it_sku = ?, cat_id = ?, it_description = ?, 
        it_image_url = ?, it_max_time_out = ?, it_renewable = ?, it_active = ?
       WHERE it_id = ?`,
      [name, sku, categoryId, description, imageUrl, maxTimeOut, renewable === 'true', active === 'true', req.params.id],
      'staff'
    );
    
    res.redirect(`/items/${req.params.id}`);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).send('Error updating item');
  }
});

// Add Asset to Item
router.post('/:id/assets/add', checkStaff, async (req, res) => {
  try {
    // Simple asset creation - defaults to 'available' and 'good' condition
    // In a real app, you'd have a form for this too.
    await query(
      `INSERT INTO assets (it_id, a_status, a_condition, loc_id) VALUES (?, 'available', 'good', 1)`,
      [req.params.id],
      'staff'
    );
    res.redirect(`/items/${req.params.id}`);
  } catch (err) {
    console.error('Error adding asset:', err);
    res.status(500).send('Error adding asset');
  }
});

// Get all items with availability count
router.get('/', async (req, res) => {
  try {
    const { search, category, showOnlyAvailable } = req.query;
    
    // Build query with filters
    let sql = `
      SELECT 
        i.it_id,
        i.it_name,
        i.it_sku,
        i.it_description,
        i.it_image_url,
        i.it_max_time_out,
        i.it_active,
        i.it_renewable,
        i.cat_id,
        c.cat_name,
        COUNT(CASE WHEN a.a_status = 'available' THEN 1 END) as available_count,
        COUNT(a.a_id) as total_count
      FROM items i
      LEFT JOIN categories c ON i.cat_id = c.cat_id
      LEFT JOIN assets a ON i.it_id = a.it_id
      WHERE i.it_active = 1
    `;
    
    const params = [];
    
    if (search) {
      sql += ` AND (i.it_name LIKE ? OR i.it_description LIKE ? OR i.it_sku LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      // Get all categories (for finding children)
      const allCategories = await query(`SELECT cat_id, cat_parent_id FROM categories`);
      
      // Get all descendant category IDs
      const categoryIds = getAllDescendantIds(parseInt(category), allCategories);
      categoryIds.push(parseInt(category)); // Include parent itself
      
      const placeholders = categoryIds.map(() => '?').join(',');
      sql += ` AND i.cat_id IN (${placeholders})`;
      params.push(...categoryIds);
    }
    
    sql += ` GROUP BY i.it_id, i.it_name, i.it_sku, i.it_description, i.it_image_url, i.it_max_time_out, i.it_active, i.it_renewable, i.cat_id, c.cat_name`;
    
    if (showOnlyAvailable === 'true') {
      sql += ` HAVING available_count > 0`;
    }
    
    sql += ` ORDER BY i.it_name ASC`;
    
    const items = await query(sql, params);
    
    // Get all categories for the filter
    const categories = await query(`
      SELECT cat_id, cat_name, cat_parent_id 
      FROM categories 
      ORDER BY cat_name ASC
    `);
    
    // Build category tree
    const categoryTree = buildCategoryTree(categories);
    
    // Build breadcrumb path if category is selected
    let breadcrumb = [];
    if (category) {
      const catId = parseInt(category);
      const selectedCat = categories.find(c => c.cat_id === catId);
      if (selectedCat) {
        // Build path from root to selected category
        breadcrumb = buildCategoryPath(catId, categories);
      }
    }
    
    res.render('items', {
      title: 'Catalog',
      items,
      categories: categoryTree,
      search: search || '',
      selectedCategory: category || '',
      showOnlyAvailable: showOnlyAvailable === 'true',
      breadcrumb
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Error loading catalog');
  }
});

// Get single item details
router.get('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const items = await query(`
      SELECT 
        i.*,
        c.cat_name,
        COUNT(CASE WHEN a.a_status = 'available' THEN 1 END) as available_count,
        COUNT(a.a_id) as total_count
      FROM items i
      LEFT JOIN categories c ON i.cat_id = c.cat_id
      LEFT JOIN assets a ON i.it_id = a.it_id
      WHERE i.it_id = ? AND i.it_active = 1
      GROUP BY i.it_id
    `, [itemId]);
    
    if (items.length === 0) {
      return res.status(404).send('Item not found');
    }
    
    console.log(items[0]);
    res.render('itemDetail', {
      title: items[0].it_name,
      item: items[0]
    });
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).send('Error loading item');
  }
});

// Helper function to get all descendant category IDs
function getAllDescendantIds(categoryId, allCategories) {
  const descendants = [];
  
  function findChildren(parentId) {
    allCategories.forEach(cat => {
      if (cat.cat_parent_id === parentId) {
        descendants.push(cat.cat_id);
        findChildren(cat.cat_id); // Recursively find children
      }
    });
  }
  
  findChildren(categoryId);
  return descendants;
}

// Helper function to build category breadcrumb path
function buildCategoryPath(categoryId, allCategories) {
  const path = [];
  let currentId = categoryId;
  
  while (currentId) {
    const cat = allCategories.find(c => c.cat_id === currentId);
    if (cat) {
      path.unshift({ cat_id: cat.cat_id, cat_name: cat.cat_name });
      currentId = cat.cat_parent_id;
    } else {
      break;
    }
  }
  
  return path;
}

// Helper function to build category tree
function buildCategoryTree(categories) {
  const categoryMap = {};
  const tree = [];
  
  // Create a map of categories
  categories.forEach(cat => {
    categoryMap[cat.cat_id] = { ...cat, children: [] };
  });
  
  // Build the tree structure
  categories.forEach(cat => {
    if (cat.cat_parent_id === null) {
      tree.push(categoryMap[cat.cat_id]);
    } else if (categoryMap[cat.cat_parent_id]) {
      categoryMap[cat.cat_parent_id].children.push(categoryMap[cat.cat_id]);
    }
  });
  
  return tree;
}

export default router;
