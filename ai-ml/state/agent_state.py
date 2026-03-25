from typing import TypedDict, List, Dict

class AgentState(TypedDict):
    """
    State for the LangGraph agent for generating and adapting learning paths.
    """
    goal: str
    level: str
    roadmap: List[Dict[str, str]]
    prerequisites: List[str]
    resources: List[Dict[str, str]]
    progress: dict
    feedback: str

class ResourceState(TypedDict):
    """
    State for the LangGraph agent for finding resources.
    """
    topic: str
    history: List[str]
    resources: List[Dict]
