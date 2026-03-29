import User from '../models/User.js';
import Connection from '../models/Connection.js';
import bcrypt from 'bcrypt';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const { updateUserStreak } = await import('../services/streakService.js');
    await updateUserStreak(req.user._id);
    
    const user = await User.findById(req.user._id);
    res.json({ streak: user.streak, lastActive: user.lastActive });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.contactInfo !== undefined) {
        user.contactInfo = req.body.contactInfo;
      }

      // Update interests if provided
      if (req.body.interests !== undefined) {
        user.interests = req.body.interests;
      }

      // Update goals if provided
      if (req.body.goals !== undefined) {
        user.goals = req.body.goals;
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        contactInfo: updatedUser.contactInfo,
        streak: updatedUser.streak,
        interests: updatedUser.interests,
        goals: updatedUser.goals,
        profilePic: updatedUser.profilePic,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePic = req.file.path;
    await user.save();

    res.json({ profilePic: user.profilePic, message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// --- Social Discovery ---

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: sanitized, $options: 'i' } },
        { interests: { $regex: sanitized, $options: 'i' } },
        { goals: { $regex: sanitized, $options: 'i' } },
      ],
    }).select('name interests goals profilePic streak lastActive');

    res.json(users);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    // Base fields to return
    let selectFields = 'name interests goals streak lastActive profilePic';

    // Check if there is an accepted connection between the requesting user and the target user
    const acceptedConnection = await Connection.findOne({
      status: 'accepted',
      $or: [
        { userId: req.user._id, targetUserId: req.params.id },
        { userId: req.params.id, targetUserId: req.user._id },
      ],
    });

    // If they are connected, also return contactInfo
    if (acceptedConnection) {
      selectFields += ' contactInfo';
    }

    const user = await User.findById(req.params.id).select(selectFields);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add a flag so frontend knows whether contact info is available
    const userData = user.toObject();
    userData.isConnected = !!acceptedConnection;

    res.json(userData);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
