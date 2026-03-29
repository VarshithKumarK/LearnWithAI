import Connection from '../models/Connection.js';
import User from '../models/User.js';

export const sendConnectionRequest = async (req, res) => {
  try {
    const { targetUserId, topic } = req.body;

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot connect to self' });
    }

    // Check both directions for existing connection
    const existingConnection = await Connection.findOne({
      $or: [
        { userId: req.user._id, targetUserId },
        { userId: targetUserId, targetUserId: req.user._id },
      ],
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
      $or: [{ userId: req.user._id }, { targetUserId: req.user._id }],
    }).populate('userId targetUserId', 'name email interests goals streak profilePic contactInfo');

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Only the target user (the one who received the request) can accept
    if (connection.targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: `Connection is already ${connection.status}` });
    }

    connection.status = 'accepted';
    await connection.save();

    const updated = await Connection.findById(connection._id)
      .populate('userId targetUserId', 'name email interests goals streak profilePic contactInfo');

    res.json(updated);
  } catch (error) {
    console.error('Accept Connection Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Only the target user can reject
    if (connection.targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: `Connection is already ${connection.status}` });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({ message: 'Connection rejected' });
  } catch (error) {
    console.error('Reject Connection Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
