const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const router = express.Router();


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// In fileRoutes.js upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Store absolute path
    const absolutePath = path.resolve(req.file.path);
    
    const newFile = new File({
      filename: req.file.originalname,
      path: absolutePath, // Store absolute path
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// In fileRoutes.js
router.get('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found in database' });
    }

    const absolutePath = path.resolve(file.path);
    console.log('Attempting to serve file from:', absolutePath); // Debug log

    if (!fs.existsSync(absolutePath)) {
      console.error('File not found at path:', absolutePath);
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.sendFile(absolutePath, {
      headers: {
        'Content-Disposition': `inline; filename="${file.filename}"`
      }
    });
  } catch (err) {
    console.error('File retrieval error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;