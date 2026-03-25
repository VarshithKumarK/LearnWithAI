from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List
from graph.agent_graph import agent_app
from graph.resource_graph import resource_app

router = APIRouter()

class RoadmapRequest(BaseModel):
    goal: str
    skillLevel: str
    timeAvailability: str

class UpdateRequest(BaseModel):
    goal: str
    level: str
    progress: Dict = {}
    feedback: str = ""

class RecommendRequest(BaseModel):
    history: List[str]
    topic: str

@router.post("/agent/generate")
def generate_roadmap(req: RoadmapRequest):
    print("[FASTAPI] Incoming /agent/generate Request:", req.dict())
    state_input = {
        "goal": req.goal,
        "level": req.skillLevel,
        "progress": {},
        "feedback": ""
    }
    final_state = agent_app.invoke(state_input)
    print("[FASTAPI] Outgoing /agent/generate Response Roadmap size:", len(final_state.get("roadmap", [])))
    return {"roadmap": final_state.get("roadmap", [])}

@router.post("/agent/update")
def update_roadmap(req: UpdateRequest):
    print("[FASTAPI] Incoming /agent/update Request:", req.dict())
    state_input = {
        "goal": req.goal,
        "level": req.level,
        "progress": req.progress,
        "feedback": req.feedback,
    }
    final_state = agent_app.invoke(state_input)
    print("[FASTAPI] Outgoing /agent/update Response Roadmap size:", len(final_state.get("roadmap", [])))
    return {"updated_roadmap": final_state.get("roadmap", [])}

@router.post("/agent/recommend")
def recommend_resources(req: RecommendRequest):
    print("[FASTAPI] Incoming /agent/recommend Request:", req.dict())
    state_input = {
        "topic": req.topic,
        "history": req.history
    }
    final_state = resource_app.invoke(state_input)
    print("[FASTAPI] Outgoing /agent/recommend Response Resources size:", len(final_state.get("resources", [])))
    return {"resources": final_state.get("resources", [])}
