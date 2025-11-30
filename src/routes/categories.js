// src/routes/categories.js
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

// Helper function to flatten tree for indented display
function flattenTree(tree, depth = 0) {
  let flat = [];
  tree.forEach(node => {
    flat.push({ ...node, depth });
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenTree(node.children, depth + 1));
    }
  });
  return flat;
}

// Get all descendant category IDs (for cascade delete)
function getAllDescendantIds(categoryId, allCategories) {
  const descendants = [];
  
  function findChildren(parentId) {
    allCategories.forEach(cat => {
      if (cat.cat_parent_id === parentId) {
        descendants.push(cat.cat_id);
        findChildren(cat.cat_id);
      }
    });
  }
  
  findChildren(categoryId);
  return descendants;
}

// List all categories
router.get('/', checkStaff, async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY cat_name ASC', [], 'staff');
    const categoryTree = buildCategoryTree(categories);
    const flatCategories = flattenTree(categoryTree);
    
    res.render('admin/categories', {
      title: 'Manage Categories',
      categories: flatCategories
    });
  } catch (err) {
    console.error('Error loading categories:', err);
    res.status(500).send('Error loading categories');
  }
});

// Show add category form
router.get('/add', checkStaff, async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY cat_name ASC', [], 'staff');
    const categoryTree = buildCategoryTree(categories);
    
    res.render('admin/categoryForm', {
      title: 'Add Category',
      categories: categoryTree
    });
  } catch (err) {
    console.error('Error loading add form:', err);
    res.status(500).send('Error loading form');
  }
});

// Process add category
router.post('/add', checkStaff, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const parent = parentId && parentId !== '' ? parseInt(parentId) : null;
    
    // Set current user ID for audit trigger
    await query(
      'SET @current_user_id = ?',
      [req.session.user.u_id],
      'staff'
    );
    
    // Insert into categories table
    const result = await query(
      'INSERT INTO categories (cat_name, cat_parent_id) VALUES (?, ?)',
      [name, parent],
      'staff'
    );
    
    const newCatId = result.insertId;
    
    // Update categories_children table if it has a parent
    if (parent) {
      await query(
        'INSERT INTO categories_children (cat_id, cat_child_id) VALUES (?, ?)',
        [parent, newCatId],
        'staff'
      );
    }
    
    res.redirect('/categories');
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).send('Error adding category');
  }
});

// Show edit category form
router.get('/:id/edit', checkStaff, async (req, res) => {
  try {
    const [category] = await query('SELECT * FROM categories WHERE cat_id = ?', [req.params.id], 'staff');
    if (!category) return res.status(404).send('Category not found');
    
    const categories = await query('SELECT * FROM categories WHERE cat_id != ? ORDER BY cat_name ASC', [req.params.id], 'staff');
    const categoryTree = buildCategoryTree(categories);
    
    res.render('admin/categoryForm', {
      title: 'Edit Category',
      category,
      categories: categoryTree
    });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Error loading form');
  }
});

// Process edit category
router.post('/:id/edit', checkStaff, async (req, res) => {
  try {
    const catId = parseInt(req.params.id);
    const { name, parentId } = req.body;
    const parent = parentId && parentId !== '' ? parseInt(parentId) : null;
    
    // Update category
    await query(
      'UPDATE categories SET cat_name = ?, cat_parent_id = ? WHERE cat_id = ?',
      [name, parent, catId],
      'staff'
    );
    
    // Update categories_children table
    // First delete existing entry
    await query(
      'DELETE FROM categories_children WHERE cat_child_id = ?',
      [catId],
      'staff'
    );
    
    // Then add new entry if it has a parent
    if (parent) {
      await query(
        'INSERT INTO categories_children (cat_id, cat_child_id) VALUES (?, ?)',
        [parent, catId],
        'staff'
      );
    }
    
    res.redirect('/categories');
  } catch (err) {
    console.error('Error editing category:', err);
    res.status(500).send('Error editing category');
  }
});

// Delete category
router.post('/:id/delete', checkStaff, async (req, res) => {
  try {
    const catId = parseInt(req.params.id);
    
    // Get category details
    const [category] = await query('SELECT * FROM categories WHERE cat_id = ?', [catId], 'staff');
    if (!category) return res.status(404).send('Category not found');
    
    // Get all categories to find descendants
    const allCategories = await query('SELECT cat_id, cat_parent_id FROM categories', [], 'staff');
    const descendantIds = getAllDescendantIds(catId, allCategories);
    descendantIds.push(catId); // Include the category itself
    
    // Reassign items from deleted categories to parent (or NULL if no parent)
    const placeholders = descendantIds.map(() => '?').join(',');
    await query(
      `UPDATE items SET cat_id = ? WHERE cat_id IN (${placeholders})`,
      [category.cat_parent_id, ...descendantIds],
      'staff'
    );
    
    // Delete from categories_children table
    await query(
      `DELETE FROM categories_children WHERE cat_id IN (${placeholders}) OR cat_child_id IN (${placeholders})`,
      [...descendantIds, ...descendantIds],
      'staff'
    );
    
    // Delete categories (cascade delete children)
    await query(
      `DELETE FROM categories WHERE cat_id IN (${placeholders})`,
      descendantIds,
      'staff'
    );
    
    res.redirect('/categories');
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).send('Error deleting category');
  }
});

export default router;
