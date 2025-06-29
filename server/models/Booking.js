// server/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true // Format: "09:00"
    },
    endTime: {
      type: String,
      required: true // Format: "10:00"
    }
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
BookingSchema.index({ volunteer: 1, date: 1, status: 1 });
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ service: 1 });

// Prevent double booking
BookingSchema.index(
  { 
    volunteer: 1, 
    date: 1, 
    'timeSlot.startTime': 1,
    status: 1 
  }, 
  { 
    unique: true,
    partialFilterExpression: { status: 'confirmed' }
  }
);

module.exports = mongoose.model('Booking', BookingSchema);