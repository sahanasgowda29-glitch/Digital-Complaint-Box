// backend/routes/complaints.js
const express = require('express');
const Complaint = require('../models/Complaint');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage for photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// POST /api/complaints  -> create a new complaint (with optional photo)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { category, text, location, reporterName } = req.body;

    if (!category || !text || !location) {
      return res
        .status(400)
        .json({ message: 'Category, text and location are required.' });
    }

    const complaint = new Complaint({
      category,
      text,
      location,
      reporterName: reporterName || 'Anonymous',
      photoPath: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    await complaint.save();

    return res.status(201).json({
      message: 'Complaint created successfully',
      complaint,
    });
  } catch (err) {
    console.error('Error creating complaint:', err);
    return res
      .status(500)
      .json({ message: 'Server error while creating complaint' });
  }
});

// GET /api/complaints -> list all complaints (for admin + users)
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res
      .status(500)
      .json({ message: 'Server error while fetching complaints' });
  }
});

// PATCH /api/complaints/:id/status -> update complaint status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Status updated successfully',
      complaint: updated,
    });
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res
      .status(500)
      .json({ message: 'Server error while updating status' });
  }
});

module.exports = router;
