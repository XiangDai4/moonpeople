// server/controllers/forum.js
const Post = require('../models/Post');
const Reply = require('../models/Reply');

// @desc    Get all posts for forum listing
// @route   GET /api/forum/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const posts = await Post.find(query)
      .populate('author', 'fullName')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post with replies
// @route   GET /api/forum/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName');
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    // Get all replies for this post with nested structure
    const replies = await Reply.find({ post: req.params.id, isActive: true })
      .populate('author', 'fullName')
      .sort({ createdAt: 1 });
    
    // Organize replies into nested structure
    const repliesMap = {};
    const topLevelReplies = [];
    
    // First, create a map of all replies
    replies.forEach(reply => {
      repliesMap[reply._id] = {
        ...reply.toObject(),
        children: []
      };
    });
    
    // Then, organize them into nested structure
    replies.forEach(reply => {
      if (reply.parentReply) {
        // This is a nested reply
        if (repliesMap[reply.parentReply]) {
          repliesMap[reply.parentReply].children.push(repliesMap[reply._id]);
        }
      } else {
        // This is a top-level reply
        topLevelReplies.push(repliesMap[reply._id]);
      }
    });
    
    res.json({
      post: {
        ...post.toObject(),
        viewCount: post.viewCount + 1 // Return updated view count
      },
      replies: topLevelReplies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new post
// @route   POST /api/forum/posts
// @access  Private (authenticated users)
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const post = await Post.create({
      title,
      content,
      author: req.user.id
    });
    
    // Populate author info for response
    const populatedPost = await Post.findById(post._id).populate('author', 'fullName');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create reply to post or another reply
// @route   POST /api/forum/posts/:id/reply
// @access  Private (authenticated users)
exports.createReply = async (req, res) => {
  try {
    const { content, parentReplyId } = req.body;
    const postId = req.params.id;
    
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    // Check if post exists and is not locked
    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.isLocked) {
      return res.status(403).json({ message: 'This post is locked and cannot receive new replies' });
    }
    
    let depth = 0;
    let parentReply = null;
    
    // If this is a reply to another reply, check parent exists and calculate depth
    if (parentReplyId) {
      parentReply = await Reply.findById(parentReplyId);
      if (!parentReply || parentReply.post.toString() !== postId) {
        return res.status(400).json({ message: 'Invalid parent reply' });
      }
      depth = Math.min(parentReply.depth + 1, 5); // Max depth of 5
    }
    
    const reply = await Reply.create({
      post: postId,
      parentReply: parentReplyId || null,
      author: req.user.id,
      content,
      depth
    });
    
    // Populate author info for response
    const populatedReply = await Reply.findById(reply._id).populate('author', 'fullName');
    
    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite status for a post
// @route   POST /api/forum/posts/:id/favorite
// @access  Private (authenticated users)
exports.toggleFavorite = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const isFavorited = post.favorites.includes(userId);
    
    if (isFavorited) {
      // Remove from favorites
      await Post.findByIdAndUpdate(postId, { $pull: { favorites: userId } });
    } else {
      // Add to favorites
      await Post.findByIdAndUpdate(postId, { $addToSet: { favorites: userId } });
    }
    
    res.json({ 
      favorited: !isFavorited,
      favoriteCount: isFavorited ? post.favorites.length - 1 : post.favorites.length + 1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's favorite posts
// @route   GET /api/forum/favorites
// @access  Private (authenticated users)
exports.getUserFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ 
      favorites: req.user.id,
      isActive: true 
    })
      .populate('author', 'fullName')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments({ 
      favorites: req.user.id,
      isActive: true 
    });
    
    res.json({
      posts,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin functions

// @desc    Lock/unlock a post (admin only)
// @route   PUT /api/forum/posts/:id/lock
// @access  Private/Admin
exports.toggleLockPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.isLocked = !post.isLocked;
    await post.save();
    
    res.json({ 
      message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
      isLocked: post.isLocked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post (admin only)
// @route   DELETE /api/forum/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Soft delete - set isActive to false
    post.isActive = false;
    await post.save();
    
    // Also soft delete all replies
    await Reply.updateMany(
      { post: req.params.id },
      { isActive: false }
    );
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reply (admin only)
// @route   DELETE /api/forum/replies/:id
// @access  Private/Admin
exports.deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Soft delete - set isActive to false
    reply.isActive = false;
    await reply.save();
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get direct replies to user's posts and comments
// @route   GET /api/forum/users/replies
// @access  Private (authenticated users)
exports.getUserDirectReplies = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get all posts by the user
    const userPosts = await Post.find({ 
      author: userId, 
      isActive: true 
    }).select('_id');
    const userPostIds = userPosts.map(post => post._id);
    
    // Get all replies by the user to find their comment IDs
    const userReplies = await Reply.find({ 
      author: userId, 
      isActive: true 
    }).select('_id');
    const userReplyIds = userReplies.map(reply => reply._id);
    
    // Build the query for direct replies
    const query = {
      $or: [
        // Direct replies to user's posts (no parentReply)
        { 
          parentReply: null,
          post: { $in: userPostIds },
          isActive: true
        },
        // Direct replies to user's comments
        {
          parentReply: { $in: userReplyIds },
          isActive: true
        }
      ],
      // Exclude the user's own replies
      author: { $ne: userId }
    };
    
    // Get the replies with pagination
    const directReplies = await Reply.find(query)
      .populate('author', 'fullName')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Reply.countDocuments(query);
    
    // Add context to each reply (what they're replying to)
    const repliesWithContext = await Promise.all(
      directReplies.map(async (reply) => {
        const replyObj = reply.toObject();
        
        if (reply.parentReply) {
          // This is a reply to a comment
          const parentReply = await Reply.findById(reply.parentReply)
            .select('content')
            .populate('author', 'fullName');
          
          replyObj.replyingTo = {
            type: 'comment',
            content: parentReply ? parentReply.content.substring(0, 100) + '...' : '',
            author: parentReply ? parentReply.author.fullName : 'Unknown'
          };
        } else {
          // This is a reply to a post
          replyObj.replyingTo = {
            type: 'post',
            content: reply.post.title
          };
        }
        
        return replyObj;
      })
    );
    
    res.json({
      success: true,
      data: {
        replies: repliesWithContext,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};