const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newFile = new File({
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/files/:filename', (req, res) => {
  try {
    const safeFilename = req.params.filename.replace(/[^a-zA-Z0-9\-_.]/g, '');
    const filePath = path.join(__dirname, '../uploads', safeFilename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(filePath, {
      headers: {
        'Content-Disposition': `inline; filename="${safeFilename}"`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all files
router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;