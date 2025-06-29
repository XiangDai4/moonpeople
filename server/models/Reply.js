// server/models/Reply.js
const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
    default: null // null for top-level replies, ObjectId for nested replies
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    maxlength: [5000, 'Reply content cannot be more than 5000 characters']
  },
  depth: {
    type: Number,
    default: 0, // 0 for top-level, 1 for first nested, etc.
    max: 5 // Limit nesting depth to prevent UI issues
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for better query performance
ReplySchema.index({ post: 1, createdAt: 1 });
ReplySchema.index({ parentReply: 1 });
ReplySchema.index({ author: 1 });

// Pre-save hook to update parent post's lastActivity and replyCount
ReplySchema.post('save', async function() {
  try {
    const Post = mongoose.model('Post');
    
    // Update the parent post's lastActivity and increment replyCount
    await Post.findByIdAndUpdate(
      this.post,
      { 
        $inc: { replyCount: 1 },
        lastActivity: Date.now()
      }
    );
  } catch (error) {
    console.error('Error updating post after reply save:', error);
  }
});

// Pre-remove hook to decrement reply count when reply is deleted
ReplySchema.post('deleteOne', async function() {
  try {
    const Post = mongoose.model('Post');
    
    await Post.findByIdAndUpdate(
      this.post,
      { 
        $inc: { replyCount: -1 },
        lastActivity: Date.now()
      }
    );
  } catch (error) {
    console.error('Error updating post after reply deletion:', error);
  }
});

module.exports = mongoose.model('Reply', ReplySchema);