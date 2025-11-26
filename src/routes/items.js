// src/routes/items.js
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

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
    
    res.render('items', {
      title: 'Catalog',
      items,
      categories: categoryTree,
      search: search || '',
      selectedCategory: category || '',
      showOnlyAvailable: showOnlyAvailable === 'true'
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
