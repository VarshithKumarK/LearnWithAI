import { getRecommendedResourcesWithAI } from '../services/mlService.js';

export const recommendResources = async (req, res) => {
  try {
    const { topic, history } = req.body;
    console.log('[NODE BACKEND -> recommendResources] Received request:', req.body);
    
    // Call AI Service
    const resources = await getRecommendedResourcesWithAI(topic, history);

    console.log('[NODE BACKEND -> recommendResources] Sending generated resources back to frontend:', resources);
    res.json({ resources });
  } catch (error) {
    console.error('Recommend Resources Error:', error);
    res.status(500).json({ message: 'Server error fetching resources' });
  }
};
