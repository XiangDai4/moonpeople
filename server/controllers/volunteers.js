const VolunteerProfile = require('../models/VolunteerProfile');
const User = require('../models/User');

// Create volunteer profile
const createVolunteerProfile = async (req, res) => {
  try {
    const {
      skills,
      availability,
      interests,
      experience,
      motivation,
      previousVolunteerWork,
      timeCommitment,
      preferredContactMethod
    } = req.body;

    // Check if user already has a volunteer profile
    const existingProfile = await VolunteerProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        message: 'You already have a volunteer profile'
      });
    }

    // Create new volunteer profile
    const volunteerProfile = new VolunteerProfile({
      user: req.user.id,
      skills: skills || [],
      availability,
      interests: interests || [],
      experience,
      motivation,
      previousVolunteerWork,
      timeCommitment,
      preferredContactMethod,
      availableTimeSlots: [],
      servicesOffered: []
    });

    await volunteerProfile.save();

    // Populate user data for response
    await volunteerProfile.populate('user', 'fullName email city');

    res.status(201).json({
      message: 'Volunteer profile created successfully. Awaiting approval.',
      profile: volunteerProfile
    });
  } catch (error) {
    console.error('Error creating volunteer profile:', error);
    res.status(500).json({
      message: 'Error creating volunteer profile',
      error: error.message
    });
  }
};

// Get current user's volunteer profile
const getMyVolunteerProfile = async (req, res) => {
  try {
    const profile = await VolunteerProfile.findOne({ user: req.user.id })
      .populate('user', 'fullName email city')
      .populate('servicesOffered', 'name description');

    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    res.status(500).json({
      message: 'Error fetching volunteer profile',
      error: error.message
    });
  }
};

// Update volunteer profile
const updateVolunteerProfile = async (req, res) => {
  try {
    const {
      skills,
      availability,
      interests,
      experience,
      motivation,
      previousVolunteerWork,
      timeCommitment,
      preferredContactMethod
    } = req.body;

    const profile = await VolunteerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    // Update fields
    if (skills !== undefined) profile.skills = skills;
    if (availability !== undefined) profile.availability = availability;
    if (interests !== undefined) profile.interests = interests;
    if (experience !== undefined) profile.experience = experience;
    if (motivation !== undefined) profile.motivation = motivation;
    if (previousVolunteerWork !== undefined) profile.previousVolunteerWork = previousVolunteerWork;
    if (timeCommitment !== undefined) profile.timeCommitment = timeCommitment;
    if (preferredContactMethod !== undefined) profile.preferredContactMethod = preferredContactMethod;

    await profile.save();
    await profile.populate('user', 'fullName email city');

    res.json({
      message: 'Volunteer profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating volunteer profile:', error);
    res.status(500).json({
      message: 'Error updating volunteer profile',
      error: error.message
    });
  }
};

// Update volunteer availability
const updateVolunteerAvailability = async (req, res) => {
  try {
    const { availableTimeSlots } = req.body;

    const profile = await VolunteerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    if (!profile.isApproved) {
      return res.status(403).json({
        message: 'Volunteer profile must be approved first'
      });
    }

    // Validate time slots format for DATE-BASED availability
    if (availableTimeSlots && Array.isArray(availableTimeSlots)) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const slot of availableTimeSlots) {
        // Validate required fields
        if (!slot.date || !slot.startTime || !slot.endTime) {
          return res.status(400).json({
            message: 'Invalid time slot format - missing required fields (date, startTime, endTime)'
          });
        }

        // Validate date format
        const slotDate = new Date(slot.date);
        if (isNaN(slotDate.getTime())) {
          return res.status(400).json({
            message: 'Invalid time slot format - invalid date'
          });
        }

        // Validate date is not in the past
        if (slotDate < today) {
          return res.status(400).json({
            message: 'Invalid time slot format - cannot set availability for past dates'
          });
        }

        // Validate time format (HH:MM)
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return res.status(400).json({
            message: 'Invalid time slot format - time must be in HH:MM format'
          });
        }

        // Validate time logic
        if (slot.startTime >= slot.endTime) {
          return res.status(400).json({
            message: 'Invalid time slot format - start time must be before end time'
          });
        }
      }
      
      // Use the model method to update availability slots
      try {
        await profile.updateAvailabilitySlots(availableTimeSlots);
      } catch (modelError) {
        return res.status(400).json({
          message: 'Invalid time slot format',
          error: modelError.message
        });
      }
    } else if (availableTimeSlots !== undefined) {
      // If availableTimeSlots is provided but not an array
      return res.status(400).json({
        message: 'Invalid time slot format - availableTimeSlots must be an array'
      });
    }

    // Reload the profile to get the updated data
    const updatedProfile = await VolunteerProfile.findOne({ user: req.user.id })
      .populate('servicesOffered', 'name description');

    res.json({
      message: 'Availability updated successfully',
      availableTimeSlots: updatedProfile.availableTimeSlots
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      message: 'Error updating availability',
      error: error.message
    });
  }
};

// Apply to offer a service
const applyToOfferService = async (req, res) => {
  try {
    const { serviceId } = req.body;

    const profile = await VolunteerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    if (!profile.isApproved) {
      return res.status(403).json({
        message: 'Volunteer profile must be approved first'
      });
    }

    // Check if already offering this service
    if (profile.servicesOffered.includes(serviceId)) {
      return res.status(400).json({
        message: 'You are already offering this service'
      });
    }

    // Add service to offered services
    profile.servicesOffered.push(serviceId);
    await profile.save();

    await profile.populate('servicesOffered', 'name description');

    res.json({
      message: 'Successfully applied to offer this service',
      servicesOffered: profile.servicesOffered
    });
  } catch (error) {
    console.error('Error applying to offer service:', error);
    res.status(500).json({
      message: 'Error applying to offer service',
      error: error.message
    });
  }
};

// Remove service from offered services
const removeOfferedService = async (req, res) => {
  try {
    const { serviceId } = req.body;

    const profile = await VolunteerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    // Remove service from offered services
    profile.servicesOffered = profile.servicesOffered.filter(
      id => id.toString() !== serviceId
    );
    await profile.save();

    await profile.populate('servicesOffered', 'name description');

    res.json({
      message: 'Service removed from your offered services',
      servicesOffered: profile.servicesOffered
    });
  } catch (error) {
    console.error('Error removing offered service:', error);
    res.status(500).json({
      message: 'Error removing offered service',
      error: error.message
    });
  }
};

// Admin: Get all volunteer profiles
const getAllVolunteerProfiles = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status === 'pending') {
      filter.isApproved = false;
      filter.rejectionReason = { $exists: false };
    } else if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'rejected') {
      filter.rejectionReason = { $exists: true };
    }

    const profiles = await VolunteerProfile.find(filter)
      .populate('user', 'fullName email city')
      .populate('servicesOffered', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VolunteerProfile.countDocuments(filter);

    res.json({
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer profiles:', error);
    res.status(500).json({
      message: 'Error fetching volunteer profiles',
      error: error.message
    });
  }
};

// Admin: Approve volunteer
const approveVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await VolunteerProfile.findById(id);
    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    // Update volunteer profile
    profile.isApproved = true;
    profile.approvedAt = new Date();
    profile.approvedBy = req.user.id;
    profile.rejectionReason = undefined;

    await profile.save();

    // CRITICAL: Update user role to 'volunteer'
    await User.findByIdAndUpdate(
      profile.user,
      { role: 'volunteer' }
    );

    await profile.populate('user', 'fullName email city');

    res.json({
      message: 'Volunteer approved successfully',
      profile
    });
  } catch (error) {
    console.error('Error approving volunteer:', error);
    res.status(500).json({
      message: 'Error approving volunteer',
      error: error.message
    });
  }
};

// Admin: Reject volunteer
const rejectVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const profile = await VolunteerProfile.findById(id);
    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    // Update volunteer profile
    profile.isApproved = false;
    profile.rejectionReason = reason || 'Application rejected';
    profile.approvedAt = undefined;
    profile.approvedBy = undefined;

    await profile.save();

    // IMPORTANT: Keep user role as 'user' when rejected
    await User.findByIdAndUpdate(
      profile.user,
      { role: 'user' }
    );

    await profile.populate('user', 'fullName email city');

    res.json({
      message: 'Volunteer rejected',
      profile
    });
  } catch (error) {
    console.error('Error rejecting volunteer:', error);
    res.status(500).json({
      message: 'Error rejecting volunteer',
      error: error.message
    });
  }
};

// Get volunteer profile by ID (for admin)
const getVolunteerProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await VolunteerProfile.findById(id)
      .populate('user', 'fullName email city')
      .populate('approvedBy', 'fullName')
      .populate('servicesOffered', 'name description');

    if (!profile) {
      return res.status(404).json({
        message: 'Volunteer profile not found'
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    res.status(500).json({
      message: 'Error fetching volunteer profile',
      error: error.message
    });
  }
};

module.exports = {
  createVolunteerProfile,
  getMyVolunteerProfile,
  updateVolunteerProfile,
  updateVolunteerAvailability,
  applyToOfferService,
  removeOfferedService,
  getAllVolunteerProfiles,
  approveVolunteer,
  rejectVolunteer,
  getVolunteerProfileById
};