const admin = require('../config/firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
// Google OAuth login
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log('Received ID token:', idToken.substring(0, 10) + '...');
    
    if (!idToken) {
      console.error('No ID token provided');
      return res.status(400).json({ message: 'No ID token provided' });
    }

    // Verify Firebase ID token
    try {
      console.log('Firebase Admin SDK initialized:', !!admin.apps.length);
      console.log('Service account details:', {
        projectId: process.env.FIREBASE_PROJECT_ID,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL
      });

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Decoded token:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        iss: decodedToken.iss,
        aud: decodedToken.aud
      });
      const { email, name, picture, uid } = decodedToken;

      // Find or create user
      let user = await User.findOne({ firebaseUid: uid });
      if (!user) {
        console.log('Creating new user for:', email);
        user = await User.create({
          email,
          name,
          profilePicture: picture,
          firebaseUid: uid
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture
        }
      });
    } catch (firebaseError) {
      console.error('Firebase token verification error:', {
        code: firebaseError.code,
        message: firebaseError.message,
        stack: firebaseError.stack,
        name: firebaseError.name
      });
      return res.status(401).json({ 
        message: 'Invalid Firebase token',
        error: firebaseError.message 
      });
    }
  } catch (error) {
    console.error('Google login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, profilePicture },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 