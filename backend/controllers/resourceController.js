import { getRecommendedResourcesWithAI } from '../services/mlService.js';
import Resource from '../models/Resource.js';
import { updateUserStreak } from '../services/streakService.js';

export const recommendResources = async (req, res) => {
  try {
    const { topic, history } = req.body;
    console.log('[NODE BACKEND -> recommendResources] Received request:', req.body);
    
    // Call AI Service
    const resources = await getRecommendedResourcesWithAI(topic, history);

    console.log('[NODE BACKEND -> recommendResources] Sending generated resources back to frontend:', resources);
    
    // Update streak (fire-and-forget)
    updateUserStreak(req.user._id).catch(() => {});
    
    res.json({ resources });
  } catch (error) {
    console.error('Recommend Resources Error:', error);
    res.status(500).json({ message: 'Server error fetching resources' });
  }
};

export const saveResource = async (req, res) => {
  try {
    const { title, url, rating, topic } = req.body;
    const resource = await Resource.create({
      userId: req.user._id,
      title,
      url,
      rating,
      topic
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error('Save Resource Error:', error);
    res.status(500).json({ message: 'Server error saving resource' });
  }
};

export const getSavedResources = async (req, res) => {
  try {
    const resources = await Resource.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error('Get Saved Resources Error:', error);
    res.status(500).json({ message: 'Server error fetching saved resources' });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const deletedResource = await Resource.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error('Delete Resource Error:', error);
    res.status(500).json({ message: 'Server error deleting resource' });
  }
};
