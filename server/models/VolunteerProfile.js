const mongoose = require('mongoose');

// Updated time slot schema to match dashboard expectations
const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true // Format: "17:00"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Legacy day-based time slot schema for backward compatibility
const legacyTimeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true // Format: "17:00"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const volunteerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  // Old availability field - keeping for backward compatibility
  availability: {
    type: String,
    trim: true
  },
  // Legacy day-based availability - keeping for backward compatibility
  weeklyTimeSlots: [legacyTimeSlotSchema],
  // New date-based availability (matches dashboard usage)
  availableTimeSlots: [timeSlotSchema],
  // Services this volunteer can provide
  servicesOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  interests: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  motivation: {
    type: String,
    trim: true
  },
  previousVolunteerWork: {
    type: String,
    trim: true
  },
  timeCommitment: {
    type: String,
    enum: ['1-2 hours/week', '3-5 hours/week', '6-10 hours/week', '10+ hours/week', 'Flexible'],
    required: true
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'either'],
    default: 'email'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
volunteerProfileSchema.index({ isApproved: 1 });
volunteerProfileSchema.index({ servicesOffered: 1 });
volunteerProfileSchema.index({ 'availableTimeSlots.date': 1 });
volunteerProfileSchema.index({ 'availableTimeSlots.isActive': 1 });

// Virtual to get active future availability slots
volunteerProfileSchema.virtual('activeFutureSlots').get(function() {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  
  return this.availableTimeSlots.filter(slot => 
    slot.isActive && new Date(slot.date) >= now
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Method to clean up past availability slots
volunteerProfileSchema.methods.cleanupPastSlots = function() {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  
  this.availableTimeSlots = this.availableTimeSlots.filter(slot => 
    new Date(slot.date) >= now
  );
  
  return this.save();
};

// Method to add availability slot with validation
volunteerProfileSchema.methods.addAvailabilitySlot = function(date, startTime, endTime) {
  // Validate date is in the future
  const slotDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (slotDate < today) {
    throw new Error('Cannot add availability for past dates');
  }
  
  // Validate time format and logic
  if (startTime >= endTime) {
    throw new Error('Start time must be before end time');
  }
  
  // Check for overlapping slots on the same date
  const existingSlot = this.availableTimeSlots.find(slot => 
    slot.date.toDateString() === slotDate.toDateString() &&
    slot.isActive &&
    ((startTime >= slot.startTime && startTime < slot.endTime) ||
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
  
  if (existingSlot) {
    throw new Error('Time slot overlaps with existing availability');
  }
  
  this.availableTimeSlots.push({
    date: slotDate,
    startTime,
    endTime,
    isActive: true
  });
  
  return this.save();
};

// Method to update multiple availability slots
volunteerProfileSchema.methods.updateAvailabilitySlots = function(slots) {
  // Validate all slots before updating
  const validSlots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const slot of slots) {
    const slotDate = new Date(slot.date);
    
    // Skip past dates and invalid times
    if (slotDate >= today && slot.startTime < slot.endTime) {
      validSlots.push({
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive !== undefined ? slot.isActive : true
      });
    }
  }
  
  this.availableTimeSlots = validSlots;
  return this.save();
};

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);