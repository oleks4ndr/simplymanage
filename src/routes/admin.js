// src/routes/admin.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { query } from '../db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
const router = express.Router();

// 计算当前文件的真实路径（Windows 友好）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 目标目录：.../simplymanage/src/public/uploads
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// 如果目录不存在就递归创建
fs.mkdirSync(uploadDir, { recursive: true });
// Multer setup for file uploads 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const itemId = req.params.id;
    const ext = path.extname(file.originalname); // .jpg / .png ...
    cb(null, `item_${itemId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});
// Update item details 
router.post('/items/:id/update', upload.single('imageFile'), async (req, res) => {
  try {
    const itemId = req.params.id;

    // 1. 先读出旧值
    const rows = await query(
      `SELECT it_name, it_description, it_sku, it_max_time_out, it_renewable, it_image_url
       FROM items 
       WHERE it_id = ?`,
      [itemId]
    );

    if (rows.length === 0) {
      return res.status(404).send('Item not found');
    }

    const oldItem = rows[0];

    // 2. 表单里传来的新值
    let {
      it_name,
      it_description,
      it_sku,
      it_max_time_out,
      it_renewable,
      current_image_url
    } = req.body;

    // 3. 如果没传，就用旧值兜底
    it_name         = it_name         ?? oldItem.it_name;
    it_description  = it_description  ?? oldItem.it_description;
    it_sku          = it_sku          ?? oldItem.it_sku;
    it_max_time_out = it_max_time_out ?? oldItem.it_max_time_out;

    // 4. 处理 it_renewable → 0/1
    if (it_renewable === undefined) {
      it_renewable = oldItem.it_renewable;
    } else {
      const v = String(it_renewable).toLowerCase();
      it_renewable =
        v === '1' || v === 'true' || v === 'yes' || v === 'on'
          ? 1
          : 0;
    }

    // 5. 处理图片：如果上传了新文件，用新路径，否则用 current_image_url/旧值
    let imageUrl = current_image_url || oldItem.it_image_url || null;

    if (req.file) {
      // multer 已经把文件存到 public/uploads 里
      imageUrl = `/uploads/${req.file.filename}`;
    }

    console.log('Admin updating item with image', itemId, {
      it_name,
      it_description,
      it_sku,
      it_max_time_out,
      it_renewable,
      imageUrl
    });

    // 6. UPDATE 到数据库
    await query(
      `
      UPDATE items
      SET 
        it_name = ?,
        it_description = ?,
        it_sku = ?,
        it_max_time_out = ?,
        it_renewable = ?,
        it_image_url = ?
      WHERE it_id = ?
      `,
      [
        it_name,
        it_description,
        it_sku,
        it_max_time_out,
        it_renewable,
        imageUrl,
        itemId
      ]
    );

    res.redirect(`/items/${itemId}`);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).send('Error updating item');
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
    // TODO: Show all users with view/edit/deactivate options
    res.send('Admin: Manage users - Coming soon');
  } catch (err) {
    console.error('Error loading users:', err);
    res.status(500).send('Error loading users');
  }
});

export default router;
