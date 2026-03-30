from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

router = APIRouter(prefix="/predict", tags=["prediction"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "completion_model.pkl")

# Load the model gracefully
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("Course completion model loaded successfully.")
    else:
        print("Model file not found. Ensure train_model.py has been executed.")
except Exception as e:
    print(f"Error loading model: {e}")

class StudentFeatures(BaseModel):
    Age: float
    Education_Level: str
    Employment_Status: str
    Time_Spent_Hours: float
    Progress_Percentage: float
    Quiz_Score_Avg: float
    App_Usage_Percentage: float

@router.post("/course-completion")
async def predict_course_completion(features: StudentFeatures):
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Please train the model first by running train_model.py."
        )
    
    try:
        # Convert pydantic model to DataFrame for the scikit-learn pipeline
        input_data = pd.DataFrame([features.model_dump()])
        
        # Predict probability
        proba = model.predict_proba(input_data)[0]
        
        # Determine likely outcome (class 1 is 'Completed')
        completion_prob = float(proba[1])
        prediction = "Completed" if completion_prob >= 0.5 else "Not Completed"
        
        return {
            "prediction": prediction,
            "completion_probability": completion_prob,
            "dropout_probability": float(proba[0])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
