const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

function normalizeTags(tagsStr) {
  if (!tagsStr) return [];
  const tags = tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
  return tags.slice(0, 5); // limit to 5
}

// POST /api/images - Upload image with metadata
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const { title, description, tags } = req.body;
    if (!title || title.trim() === '') {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Title is required.' });
    }

    const newImage = new Image({
      imageUrl: `/uploads/${req.file.filename}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      tags: normalizeTags(tags),
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: 'Error uploading image.', error: error.message });
  }
});

// GET /api/images - Get images with search, filter, and sort
router.get('/', async (req, res) => {
  try {
    const { search, favorite, sort } = req.query;
    
    let query = {};
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    let sortOption = { createdAt: -1 }; // Recent first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const images = await Image.find(query).sort(sortOption);
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images.', error: error.message });
  }
});

// PATCH /api/images/:id - Edit metadata
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    let updateData = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (tags !== undefined) {
      let tagsArr = tags;
      if(typeof tags === 'string') {
        tagsArr = normalizeTags(tags);
      } else if (Array.isArray(tags)) {
         tagsArr = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag).slice(0,5);
      }
      updateData.tags = tagsArr;
    }

    const updatedImage = await Image.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found.' });
    }
    res.json(updatedImage);
  } catch (error) {
    res.status(400).json({ message: 'Error updating metadata.', error: error.message });
  }
});

// PATCH /api/images/:id/favorite - Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { isFavorite } = req.body;
    if (isFavorite === undefined) {
       return res.status(400).json({ message: 'isFavorite boolean is required' });
    }

    const updatedImage = await Image.findByIdAndUpdate(req.params.id, { isFavorite }, { new: true, runValidators: true });
    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found.' });
    }
    res.json(updatedImage);
  } catch (error) {
    res.status(400).json({ message: 'Error updating favorite state.', error: error.message });
  }
});

// DELETE /api/images/:id - Delete image
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Delete file
    const filename = path.basename(image.imageUrl);
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image.', error: error.message });
  }
});

module.exports = router;
