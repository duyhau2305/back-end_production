const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Cấu hình Multer để lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Lưu file vào thư mục 'uploads'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Tên file được lưu với timestamp
  },
});

const upload = multer({ storage: storage });

// Route để upload file
router.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ filePath: `uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'Không có file nào được upload' });
  }
});

// Route để phục vụ các file đã được upload
router.get('/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  res.sendFile(filePath);
});

module.exports = router;
