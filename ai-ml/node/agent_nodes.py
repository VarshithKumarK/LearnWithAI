import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# We specify temperature as 0.2 for semi-deterministic but creative enough curriculum generation
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)

def intake_node(state: dict) -> dict:
    """Initialize state from user input"""
    return {
        "goal": state.get("goal", ""),
        "level": state.get("level", "Beginner"),
        "roadmap": [],
        "prerequisites": [],
        "resources": [],
        "progress": state.get("progress", {}),
        "feedback": state.get("feedback", "")
    }

def prerequisite_mapper(state: dict) -> dict:
    """Identify prerequisite topics required for the goal"""
    goal = state.get("goal", "")
    level = state.get("level", "Beginner")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert curriculum designer. Given a learning goal and student level, provide a comma-separated list of prerequisite topics they should know before starting. If none, say 'None'. Output ONLY a comma-separated list, nothing else."),
        ("human", "Goal: {goal}\nLevel: {level}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"goal": goal, "level": level})
    prereqs = [p.strip() for p in response.content.split(",") if p.strip() and p.strip().lower() != 'none']
    
    return {"prerequisites": prereqs}

def path_builder(state: dict) -> dict:
    """Generate a structured roadmap. Output MUST be JSON list of milestones."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert AI curriculum designer. Generate a structured learning roadmap with exactly 3-5 milestones based on the user's goal, level, and prerequisites. If there's feedback or progress, adapt the difficulty. The output MUST be a valid JSON array of objects, where each object has 'title' and 'description' keys. Do NOT include markdown fences, just the raw JSON array."),
        ("human", "Goal: {goal}\nLevel: {level}\nPrerequisites: {prerequisites}\nProgress: {progress}\nFeedback: {feedback}\nProvide JSON roadmap:")
    ])
    
    chain = prompt | llm
    try:
        content = chain.invoke({
            "goal": state.get('goal', ''),
            "level": state.get('level', ''),
            "prerequisites": state.get('prerequisites', []),
            "progress": state.get('progress', {}),
            "feedback": state.get('feedback', '')
        }).content
        # attempt to clean markdown if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        roadmap = json.loads(content.strip())
    except Exception as e:
        print(f"Error parsing JSON from LLM: {e}")
        # Fallback roadmap if JSON parsing fails
        roadmap = [{"title": f"Basics of {state.get('goal')}", "description": "Introduction to the core concepts."}]
        
    return {"roadmap": roadmap}

def resource_fetcher(state: dict) -> dict:
    """Attach resources for each milestone. Simulating fetching relevant links."""
    roadmap = state.get("roadmap", [])
    resources_list = []
    
    for milestone in roadmap:
        title = milestone.get("title", "")
        # Mocking resource fetching
        resources_list.append({
            "title": f"Learn {title} Guide",
            "url": f"https://example.com/learn/{title.lower().replace(' ', '-')}"
        })
        
    return {"resources": resources_list}

def progress_evaluator(state: dict) -> dict:
    """Takes user progress updates and evaluates them."""
    return {"progress": state.get("progress", {})}

def adaptive_node(state: dict) -> dict:
    """Modify roadmap dynamically based on progress and feedback."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI tutor analyzing a student's progress and feedback. Your job is to output a single short sentence adjusting the student's level or goal based on their feedback, which will shape the new curriculum. Example: 'Simplify the concepts' or 'Introduce advanced topics'."),
        ("human", "Current Goal: {goal}\nLevel: {level}\nFeedback: {feedback}\nProgress: {progress}")
    ])
    
    chain = prompt | llm
    adaptation_notes = chain.invoke({
        "goal": state.get('goal', ''),
        "level": state.get('level', ''),
        "feedback": state.get('feedback', ''),
        "progress": state.get('progress', {})
    }).content
    
    new_feedback = f"User Feedback: {state.get('feedback', '')} | Tutor Note: {adaptation_notes}"
    return {"feedback": new_feedback}

def resource_agent_node(state: dict) -> dict:
    """Find and recommend resources based on topic and history."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI library assistant. The user wants to learn about a specific topic. Provide 3 highly relevant learning resources (docs, courses, or guides). Output MUST be a valid JSON array of objects, where each object has 'title' (string), 'url' (string, mock if necessary but realistic), and 'rating' (float between 4.0 and 5.0). Do NOT include markdown fences, just the raw JSON array."),
        ("human", "Topic: {topic}\nLearning History: {history}\nProvide JSON resources:")
    ])
    
    chain = prompt | llm
    try:
        content = chain.invoke({
            "topic": state.get("topic", ""),
            "history": state.get("history", [])
        }).content
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        resources = json.loads(content.strip())
    except Exception as e:
        print(f"Error parsing JSON from LLM: {e}")
        resources = [
            {"title": f"Ultimate Guide to {state.get('topic')}", "url": "https://example.com/guide", "rating": 4.8}
        ]
        
    return {"resources": resources}
