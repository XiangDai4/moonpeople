const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: [true, 'Category is required']
  },
  type: {
    type: String,
    enum: ['article', 'link'],
    required: [true, 'Resource type is required']
  },
  content: {
    text: {
      type: String,
      required: function() {
        return this.type === 'article';
      }
    },
    externalLink: {
      type: String,
      required: function() {
        return this.type === 'link';
      }
    }
  },
  languages: {
    type: [String],
    default: ['English']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the 'updatedAt' field before saving
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resource', ResourceSchema);