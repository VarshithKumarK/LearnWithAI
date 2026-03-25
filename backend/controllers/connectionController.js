import Connection from '../models/Connection.js';
import User from '../models/User.js';

export const sendConnectionRequest = async (req, res) => {
  try {
    const { targetUserId, topic } = req.body;

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot connect to self' });
    }

    const existingConnection = await Connection.findOne({
      userId: req.user._id,
      targetUserId,
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = await Connection.create({
      userId: req.user._id,
      targetUserId,
      topic,
    });

    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ userId: req.user._id }, { targetUserId: req.user._id }]
    }).populate('userId targetUserId', 'email interests streak');

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
