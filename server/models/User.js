// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is only required if no Google ID (regular users)
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values but unique non-null values
  },
  city: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'volunteer', 'admin'],
    default: 'user'
  },
  // Email verification fields - Updated for 6-digit codes
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationCodeExpiry: {
    type: Date
  },
  // Keep old fields for backward compatibility (optional)
  verificationToken: {
    type: String
  },
  verificationTokenExpiry: {
    type: Date
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
   // Skip hashing if password is not modified or not provided
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
  return next();
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // Return false if no password set (OAuth users)
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate 6-digit verification code
UserSchema.methods.generateVerificationCode = function() {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set code and expiry (24 hours from now)
  this.verificationCode = code;
  this.verificationCodeExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return code;
};

// Method to verify 6-digit code
UserSchema.methods.verifyCode = function(code) {
  return this.verificationCode === code && 
         this.verificationCodeExpiry > Date.now();
};

// Method to clear verification code after successful verification
UserSchema.methods.clearVerificationCode = function() {
  this.verificationCode = undefined;
  this.verificationCodeExpiry = undefined;
  this.isVerified = true;
};

// LEGACY METHODS - Keep for backward compatibility
// Method to generate verification token (deprecated)
UserSchema.methods.generateVerificationToken = function() {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set token and expiry (24 hours from now)
  this.verificationToken = token;
  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to verify token (deprecated)
UserSchema.methods.verifyToken = function(token) {
  return this.verificationToken === token && 
         this.verificationTokenExpiry > Date.now();
};

module.exports = mongoose.model('User', UserSchema);