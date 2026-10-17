const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  description: { type: String, maxlength: 240, default: '' },
  tags: { 
    type: [String], 
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
    default: []
  },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model('Image', imageSchema);
