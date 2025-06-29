// server/controllers/bookings.js
const Booking = require('../models/Booking');
const VolunteerProfile = require('../models/VolunteerProfile');
const User = require('../models/User');
const Service = require('../models/Service');

// Get available volunteers for a service
const getAvailableVolunteers = async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    
    if (!serviceId || !date) {
      return res.status(400).json({
        message: 'Service ID and date are required'
      });
    }

    // Validate date format
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    // Set up date range for the requested day
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find volunteers who offer this service and have availability on the requested date
    const volunteers = await VolunteerProfile.find({
      isApproved: true,
      servicesOffered: serviceId,
      availableTimeSlots: {
        $elemMatch: {
          date: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          isActive: true
        }
      }
    }).populate('user', 'fullName email');

    // Get existing bookings for this date
    const existingBookings = await Booking.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending'] }
    });

    const availableVolunteers = [];

    for (const volunteer of volunteers) {
      // Get volunteer's availability for the requested date
      const daySlots = volunteer.availableTimeSlots.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= startOfDay && 
               slotDate <= endOfDay && 
               slot.isActive;
      });

      if (daySlots.length === 0) continue;

      // Get volunteer's existing bookings for this date
      const volunteerBookings = existingBookings.filter(booking => 
        booking.volunteer.toString() === volunteer.user._id.toString()
      );

      // Filter out booked time slots
      const availableSlots = [];
      
      for (const slot of daySlots) {
        const isSlotBooked = volunteerBookings.some(booking => {
          // Check if there's any overlap with existing bookings
          // Updated to work with new booking structure
          const bookingStart = booking.startTime || booking.timeSlot?.startTime;
          const bookingEnd = booking.endTime || booking.timeSlot?.endTime;
          
          return (
            (slot.startTime >= bookingStart && slot.startTime < bookingEnd) ||
            (slot.endTime > bookingStart && slot.endTime <= bookingEnd) ||
            (slot.startTime <= bookingStart && slot.endTime >= bookingEnd)
          );
        });

        if (!isSlotBooked) {
          availableSlots.push({
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }
      }

      // Only include volunteers who have available slots
      if (availableSlots.length > 0) {
        availableVolunteers.push({
          volunteerId: volunteer.user._id,
          volunteerName: volunteer.user.fullName,
          availableSlots: availableSlots
        });
      }
    }

    res.json(availableVolunteers);
  } catch (error) {
    console.error('Error getting available volunteers:', error);
    res.status(500).json({
      message: 'Error getting available volunteers',
      error: error.message
    });
  }
};

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { serviceId, volunteerId, date, startTime, endTime, notes } = req.body;

    // Validate input
    if (!serviceId || !volunteerId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: 'All booking fields are required'
      });
    }

    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    // Set up date range for the booking day
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if volunteer has availability for this date and time
    const volunteerProfile = await VolunteerProfile.findOne({ 
      user: volunteerId,
      isApproved: true 
    });

    if (!volunteerProfile) {
      return res.status(404).json({
        message: 'Volunteer not found or not approved'
      });
    }

    // Check if volunteer has this time slot available
    const hasAvailability = volunteerProfile.availableTimeSlots.some(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= startOfDay && 
             slotDate <= endOfDay && 
             slot.isActive &&
             slot.startTime === startTime &&
             slot.endTime === endTime;
    });

    if (!hasAvailability) {
      return res.status(400).json({
        message: 'Volunteer is not available at this time'
      });
    }

    // Check for existing bookings that would conflict
    const existingBooking = await Booking.findOne({
      volunteer: volunteerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        // Check against new structure
        { startTime: startTime, endTime: endTime },
        // Check against old structure for backward compatibility
        { 'timeSlot.startTime': startTime, 'timeSlot.endTime': endTime }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'This time slot is no longer available'
      });
    }

    // Create booking with new structure
    const booking = new Booking({
      user: req.user.id,
      volunteer: volunteerId,
      service: serviceId,
      date: bookingDate,
      startTime: startTime,
      endTime: endTime,
      // Keep old structure for backward compatibility
      timeSlot: { startTime, endTime },
      notes: notes || '',
      status: 'confirmed'
    });

    await booking.save();

    // Populate for response
    await booking.populate([
      { path: 'user', select: 'fullName email' },
      { path: 'volunteer', select: 'fullName email' },
      { path: 'service', select: 'name description' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    let filter = { user: req.user.id };
    if (status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('volunteer', 'fullName email')
      .populate('service', 'name description')
      .sort({ date: 1, 'timeSlot.startTime': 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      message: 'Error getting bookings',
      error: error.message
    });
  }
};

// Get volunteer's bookings
const getVolunteerBookings = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    let filter = { volunteer: req.user.id };
    if (status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'fullName email')
      .populate('service', 'name description')
      .sort({ date: 1, 'timeSlot.startTime': 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error getting volunteer bookings:', error);
    res.status(500).json({
      message: 'Error getting bookings',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can cancel (either the booker or the volunteer)
    if (booking.user.toString() !== req.user.id && 
        booking.volunteer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledBy = req.user.id;
    booking.cancellationReason = reason || 'No reason provided';
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// Mark booking as completed (volunteer only)
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only volunteer can mark as completed
    if (booking.volunteer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the volunteer can mark booking as completed' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({
      message: 'Booking marked as completed',
      booking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({
      message: 'Error completing booking',
      error: error.message
    });
  }
};

// Admin: Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'fullName email')
      .populate('volunteer', 'fullName email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({
      message: 'Error getting bookings',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableVolunteers,
  createBooking,
  getUserBookings,
  getVolunteerBookings,
  cancelBooking,
  completeBooking,
  getAllBookings
};