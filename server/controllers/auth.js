// server/controllers/auth.js
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail } = require('../utils/emailService');

// @desc    Register a new user with email verification
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, city, role } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user with role if provided
    const userData = {
      fullName,
      email,
      password,
      city,
      isVerified: false // Email not verified yet
    };
    
    // Only add role if provided and valid
    if (role && ['user', 'volunteer', 'admin'].includes(role)) {
      userData.role = role;
    }
    
    const user = await User.create(userData);
    
    if (user) {
      // Generate 6-digit verification code
      const verificationCode = user.generateVerificationCode();
      await user.save();
      
      // Send verification email with code
      try {
        await sendVerificationEmail(user.email, user.fullName, verificationCode);
        
        res.status(201).json({
          message: 'Registration successful! Please check your email for a 6-digit verification code.',
          email: user.email
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        res.status(201).json({
          message: 'Registration successful! However, we could not send the verification email. Please contact support.',
          email: user.email
        });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email with 6-digit code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Verify the code
    if (!user.verifyCode(code)) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Mark user as verified and clear verification fields
    user.clearVerificationCode();
    await user.save();
    
    res.json({
      message: 'Email verified successfully! You can now log in.',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email with token (Legacy support)
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with matching verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Mark user as verified and clear verification fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    res.json({
      message: 'Email verified successfully! You can now log in.',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Check if email is verified
      if (!user.isVerified) {
        return res.status(401).json({ 
          message: 'Please verify your email before logging in. Check your inbox for the verification code.' 
        });
      }
      
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        city: user.city,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth callback
// @route   GET /auth/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    // User is authenticated via passport, generate JWT token
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.city = req.body.city || user.city;
      
      // Only update email if provided and different
      if (req.body.email && req.body.email !== user.email) {
        // Check if email is already taken
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
        // Reset verification status if email changes
        user.isVerified = false;
        const verificationCode = user.generateVerificationCode();
        await user.save();
        await sendVerificationEmail(user.email, user.fullName, verificationCode);
      }
      
      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        city: updatedUser.city,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();
    
    // Send verification email with new code
    await sendVerificationEmail(user.email, user.fullName, verificationCode);
    
    res.json({ message: 'New verification code sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: 'Logged out successfully' });
    });
  });
};

// Get current user (for Google OAuth callback)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        city: user.city,
        role: user.role,
        isVerified: user.isVerified
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};