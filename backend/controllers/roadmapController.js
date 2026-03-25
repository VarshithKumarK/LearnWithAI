import LearningPath from '../models/LearningPath.js';
import { generateRoadmapFromAI, updateRoadmapWithAI } from '../services/mlService.js';

export const generateRoadmap = async (req, res) => {
  try {
    const { goal, skillLevel, timeAvailability } = req.body;
    console.log('[NODE BACKEND -> generateRoadmap] Received request body:', req.body);
    
    // Call AI Service
    const milestones = await generateRoadmapFromAI(goal, skillLevel, timeAvailability);

    // Save to DB
    const learningPath = await LearningPath.create({
      userId: req.user._id,
      goal,
      milestones,
      progress: 0
    });

    console.log('[NODE BACKEND -> generateRoadmap] Sending generated roadmap back to frontend:', learningPath);
    res.status(201).json(learningPath);
  } catch (error) {
    console.error('Generate Roadmap Error:', error);
    res.status(500).json({ message: 'Server error generating roadmap' });
  }
};

export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await LearningPath.find({ userId: req.user._id });
    res.json(roadmaps);
  } catch (error) {
    console.error('Get Roadmaps Error:', error);
    res.status(500).json({ message: 'Server error fetching roadmaps' });
  }
};

export const updateRoadmapProgress = async (req, res) => {
  try {
    const { progress, feedback, goal, level } = req.body;
    const roadmapId = req.params.id;
    
    console.log(`[NODE BACKEND -> updateRoadmapProgress] Received update for roadmap ${roadmapId}`, req.body);

    // Call AI to adjust roadmap based on progress and feedback
    const updatedMilestones = await updateRoadmapWithAI(goal, level, progress, feedback);

    const roadmapToUpdate = await LearningPath.findById(roadmapId);
    if (!roadmapToUpdate) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (updatedMilestones && updatedMilestones.length > 0) {
      roadmapToUpdate.milestones = updatedMilestones;
    }
    
    // Update progress explicitly if passed
    if (progress && progress.completionPercentage !== undefined) {
      roadmapToUpdate.progress = progress.completionPercentage;
    }

    await roadmapToUpdate.save();

    console.log('[NODE BACKEND -> updateRoadmapProgress] Sending updated roadmap back to frontend:', roadmapToUpdate);
    res.json(roadmapToUpdate);
  } catch (error) {
    console.error('Update Roadmap Error:', error);
    res.status(500).json({ message: 'Server error updating roadmap' });
  }
};
