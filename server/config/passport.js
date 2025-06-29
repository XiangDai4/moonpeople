// server/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our database
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // User exists, return the user
        return done(null, user);
      } else {
        // Check if user exists with same email
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.isVerified = true; // Google accounts are pre-verified
          await existingUser.save();
          return done(null, existingUser);
        } else {
          // Create new user
          const newUser = new User({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true, // Google accounts are pre-verified
            role: 'user'
          });
          
          user = await newUser.save();
          return done(null, user);
        }
      }
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};