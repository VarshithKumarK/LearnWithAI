import json
import uuid
from typing import Dict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)

# In-memory storage for quiz answers
# Structure: { "quiz_id": { 1: "A", 2: "B", ... } }
answer_store: Dict[str, Dict[int, str]] = {}

def generate_quiz_securely(topic: str, difficulty: str = "beginner", num_questions: int = 5) -> dict:
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are an expert AI tutor. Generate exactly {num_questions} multiple-choice questions on the topic provided. The difficulty should be {difficulty}. Output MUST be a valid JSON array of objects. Each object must have keys: 'id' (integer starting from 1), 'question' (string), 'options' (array of exactly 4 strings), and 'answer' (the exact string of the correct option). Do NOT include markdown fences or any other text, just the raw JSON array."),
        ("human", "Topic: {topic}\nProvide JSON quiz:")
    ])
    
    chain = prompt | llm
    
    try:
        content = chain.invoke({"topic": topic}).content
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        raw_questions = json.loads(content.strip())
        
        quiz_id = str(uuid.uuid4())
        answer_store[quiz_id] = {}
        
        secure_questions = []
        for q in raw_questions:
            q_id = q.get('id')
            answer = q.get('answer')
            
            # Save the answer securely
            answer_store[quiz_id][q_id] = answer
            
            # Build safe question payload
            safe_q = {
                "id": q_id,
                "question": q.get('question'),
                "options": q.get('options')
            }
            secure_questions.append(safe_q)
            
        return {
            "quiz_id": quiz_id,
            "questions": secure_questions
        }
        
    except Exception as e:
        print(f"Error generating quiz: {e}")
        # Minimal fallback
        quiz_id = str(uuid.uuid4())
        answer_store[quiz_id] = {1: "B"}
        return {
            "quiz_id": quiz_id,
            "questions": [
                {
                    "id": 1,
                    "question": f"What is {topic}?",
                    "options": ["A tool", "A concept regarding " + topic, "A brand", "A food"]
                }
            ]
        }

def get_answer(quiz_id: str, question_id: int):
    quiz = answer_store.get(quiz_id)
    if not quiz:
        return None
    return quiz.get(question_id)

def get_all_answers(quiz_id: str):
    return answer_store.get(quiz_id)
