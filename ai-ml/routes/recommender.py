from fastapi import APIRouter, HTTPException
import pickle
from pydantic import BaseModel
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/recommender",
    tags=["recommendations"]
)

# Global variables to hold the loaded models
similarity = None
courses_df = None
course_list_dicts = None
course_names = []

def load_models():
    global similarity, courses_df, course_list_dicts, course_names
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, 'models')
    
    similarity_path = os.path.join(models_dir, 'similarity.pkl')
    courses_path = os.path.join(models_dir, 'courses.pkl')
    course_list_path = os.path.join(models_dir, 'course_list.pkl')
    
    if not (os.path.exists(similarity_path) and os.path.exists(courses_path) and os.path.exists(course_list_path)):
        logger.warning("Recommendation models not found. Please run generate_models.py to create them.")
        return False
        
    try:
        with open(similarity_path, 'rb') as f:
            similarity = pickle.load(f)
        with open(courses_path, 'rb') as f:
            courses_df = pickle.load(f)
        with open(course_list_path, 'rb') as f:
            course_list_dicts = pickle.load(f)
            
        course_names = courses_df['course_name'].values.tolist()
        return True
    except Exception as e:
        logger.error(f"Error loading recommendation models: {e}")
        return False

# Load models on startup if they exist
load_models()

class RecommendationRequest(BaseModel):
    course_name: str

@router.get("/courses")
async def get_all_courses():
    """Returns a list of all available courses for the search autocomplete."""
    if not course_names:
        # Try loading again in case the user generated them while the server was running
        if not load_models():
            return {"courses": []}
    return {"courses": course_names}

@router.post("/recommend")
async def recommend_courses(request: RecommendationRequest):
    """Returns recommendations for a given course name."""
    if not course_names:
        if not load_models():
            raise HTTPException(status_code=503, detail="Recommendation models are missing")
            
    course_name = request.course_name
    
    if course_name not in courses_df['course_name'].values:
        raise HTTPException(status_code=404, detail="Course not found")

    try:
        index = courses_df[courses_df['course_name'] == course_name].index[0]
        distances = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])
        
        recommended_courses = []
        for i in distances[1:7]:
            recommended_name = courses_df.iloc[i[0]].course_name
            recommended_url = courses_df.iloc[i[0]].course_url
            recommended_courses.append({
                'name': recommended_name, 
                'url': recommended_url
            })
            
        return {"recommendations": recommended_courses}
    except Exception as e:
        logger.error(f"Error during recommendation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while generating recommendations")
