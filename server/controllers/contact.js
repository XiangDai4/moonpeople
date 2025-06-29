// server/controllers/contact.js
const ContactMessage = require('../models/ContactMessage');
const { validationResult } = require('express-validator');

// Submit contact form message
const submitContactMessage = async (req, res) => {
  try {
    // Add debugging logs
    console.log('=== Contact Form Debug ===');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Log the extracted fields
    console.log('Extracted fields:', { name, email, subject, message });

    // Save to database
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will review it and get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again later.'
    });
  }
};

// Get user's own messages (user only)
const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated token
    const userEmail = req.user.email; // Get user email from authenticated token
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add debugging logs
    console.log('=== User Messages Debug ===');
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);

    // Get total count for pagination - search by both userId and email for backward compatibility
    const totalMessages = await ContactMessage.countDocuments({ 
      $or: [
        { userId: userId },
        { email: { $regex: new RegExp(`^${userEmail}$`, 'i') } }
      ]
    });

    // Get paginated messages - search by both userId and email for backward compatibility
    const messages = await ContactMessage.find({ 
      $or: [
        { userId: userId },
        { email: { $regex: new RegExp(`^${userEmail}$`, 'i') } }
      ]
    })
    .sort({ createdAt: -1 }) // Most recent first
    .skip(skip)
    .limit(limit)
    .select('name email subject message status reply createdAt repliedAt updatedAt userId');

    const totalPages = Math.ceil(totalMessages / limit);

    console.log('Found messages:', totalMessages);

    res.json({
      success: true,
      data: {
        messages,
        currentPage: page,
        totalPages,
        totalMessages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get all contact messages (admin only)
const getContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status && ['new', 'read', 'replied'].includes(status)) {
      filter.status = status;
    }

    // Get messages with pagination
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('repliedBy', 'name email');

    // Get total count for pagination
    const total = await ContactMessage.countDocuments(filter);

    res.json({
      success: true,
      data: {
        messages,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact messages'
    });
  }
};

// Get notification count (new messages)
const getNotificationCount = async (req, res) => {
  try {
    const newMessagesCount = await ContactMessage.countDocuments({ status: 'new' });
    
    res.json({
      success: true,
      data: {
        newMessages: newMessagesCount
      }
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification count'
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message status'
    });
  }
};

// Reply to message
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      {
        status: 'replied',
        reply: reply.trim(),
        repliedBy: userId,
        repliedAt: new Date()
      },
      { new: true }
    ).populate('repliedBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reply'
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};

module.exports = {
  submitContactMessage,
  getUserMessages, // Added this export
  getContactMessages,
  getNotificationCount,
  markAsRead,
  replyToMessage,
  deleteMessage
};