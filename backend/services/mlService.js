import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export const generateRoadmapFromAI = async (goal, skillLevel, timeAvailability) => {
  try {
    console.log('[ML SERVICE] Sending POST to /agent/generate:', { goal, skillLevel, timeAvailability });
    const response = await axios.post(`${FASTAPI_URL}/agent/generate`, {
      goal,
      skillLevel,
      timeAvailability,
    });
    console.log('[ML SERVICE] Response from /agent/generate:', response.data);
    return response.data.roadmap || [];
  } catch (error) {
    console.error('Error contacting AI Service /agent/generate:', error.message);
    // Fallback if AI service is not running
    return [
      { title: `Basics of ${goal}`, description: 'Learn the fundamentals' },
      { title: `Intermediate ${goal}`, description: 'Deep dive into advanced topics' },
      { title: `Mastering ${goal}`, description: 'Build a project' }
    ];
  }
};

export const updateRoadmapWithAI = async (goal, level, progress, feedback) => {
  try {
    console.log('[ML SERVICE] Sending POST to /agent/update:', { goal, level, progress, feedback });
    const response = await axios.post(`${FASTAPI_URL}/agent/update`, {
      goal,
      level,
      progress,
      feedback
    });
    console.log('[ML SERVICE] Response from /agent/update:', response.data);
    return response.data.updated_roadmap || [];
  } catch (error) {
    console.error('Error contacting AI Service /agent/update:', error.message);
    return null;
  }
};

export const getRecommendedResourcesWithAI = async (topic, history) => {
  try {
    console.log('[ML SERVICE] Sending POST to /agent/recommend:', { topic, history });
    const response = await axios.post(`${FASTAPI_URL}/agent/recommend`, {
      topic,
      history,
    });
    console.log('[ML SERVICE] Response from /agent/recommend:', response.data);
    return response.data.resources || [];
  } catch (error) {
    console.error('Error contacting AI Service /agent/recommend:', error.message);
    return [];
  }
};

export const getRecommendedResources = async (history, topic) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/recommend`, {
      history,
      topic
    });
    return response.data.resources || [];
  } catch (error) {
    console.error('Error contacting AI Service /recommend:', error.message);
    return [];
  }
};

export const generateQuizFromAI = async (topic, difficulty = 'beginner', num_questions = 5) => {
  try {
    console.log('[ML SERVICE] Sending POST to /quiz/generate:', { topic, difficulty, num_questions });
    const response = await axios.post(`${FASTAPI_URL}/quiz/generate`, {
      topic,
      difficulty,
      num_questions
    });
    return response.data;
  } catch (error) {
    console.error('Error contacting AI Service /quiz/generate:', error.message);
    throw error;
  }
};

export const revealQuizAnswer = async (quiz_id, question_id) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/quiz/reveal`, {
      quiz_id,
      question_id
    });
    return response.data;
  } catch (error) {
    console.error('Error contacting AI Service /quiz/reveal:', error.message);
    throw error;
  }
};

export const revealAllQuizAnswers = async (quiz_id) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/quiz/reveal-all`, {
      quiz_id
    });
    return response.data;
  } catch (error) {
    console.error('Error contacting AI Service /quiz/reveal-all:', error.message);
    throw error;
  }
};

export const getDropoutRisk = async (stats) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/dropout`, stats);
    return response.data.riskScore || 0;
  } catch (error) {
    console.error('Error contacting AI Service /dropout:', error.message);
    return 0;
  }
};

export const generateMCQ = async (topic) => {
  try {
    const response = await axios.post(`${FASTAPI_URL}/mcq`, { topic });
    return response.data.questions || [];
  } catch (error) {
    console.error('Error contacting AI Service /mcq:', error.message);
    return [];
  }
};
