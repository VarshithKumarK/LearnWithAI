import axios from 'axios';

export const getCourses = async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/recommender/courses');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Fetch Courses Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Server error during fetching courses', details: error.response?.data || error.message });
  }
};

export const recommendCourses = async (req, res) => {
  try {
    const body = req.body;
    const response = await axios.post('http://localhost:8000/recommender/recommend', body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Course Recommendation Error:', error.response?.data || error.message);
    
    if (error.response?.status === 503) {
        return res.status(503).json({ message: 'Recommendation models not ready', details: error.response.data });
    }
    if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Course not found', details: error.response.data });
    }
    
    res.status(500).json({ message: 'Server error during recommendation', details: error.response?.data || error.message });
  }
};
