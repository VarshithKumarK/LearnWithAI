import axios from 'axios';

export const predictCourseCompletion = async (req, res) => {
  try {
    const features = req.body;
    console.log('[NODE BACKEND -> predictCourseCompletion] Received request:', features);
    
    // Call FastAPI AI Service
    const response = await axios.post('http://localhost:8000/predict/course-completion', features);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Course Completion Prediction Error:', error.response?.data || error.message);
    
    // Check if the error is our 503 from the FastAPI service meaning the model isn't there
    if (error.response?.status === 503) {
        return res.status(503).json({ message: 'Prediction model not ready', details: error.response.data });
    }
    
    res.status(500).json({ message: 'Server error during prediction', details: error.response?.data || error.message });
  }
};
