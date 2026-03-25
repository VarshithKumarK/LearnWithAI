from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from node.quiz_service import generate_quiz_securely, get_answer, get_all_answers

router = APIRouter()

class QuizGenerateRequest(BaseModel):
    topic: str
    difficulty: str = "beginner"
    num_questions: int = 5

class QuizRevealRequest(BaseModel):
    quiz_id: str
    question_id: int

class QuizRevealAllRequest(BaseModel):
    quiz_id: str

@router.post("/quiz/generate")
def generate_quiz(req: QuizGenerateRequest):
    print(f"[FASTAPI] Incoming /quiz/generate Request for topic: {req.topic}")
    result = generate_quiz_securely(req.topic, req.difficulty, req.num_questions)
    print(f"[FASTAPI] Outgoing /quiz/generate Response generated {len(result['questions'])} questions for quiz_id {result['quiz_id']}")
    return result

@router.post("/quiz/reveal")
def reveal_answer(req: QuizRevealRequest):
    print(f"[FASTAPI] Incoming /quiz/reveal Request for quiz_id: {req.quiz_id}, q_id: {req.question_id}")
    ans = get_answer(req.quiz_id, req.question_id)
    if ans is None:
        raise HTTPException(status_code=404, detail="Quiz or question not found.")
    return {"question_id": req.question_id, "answer": ans}

@router.post("/quiz/reveal-all")
def reveal_all_answers(req: QuizRevealAllRequest):
    print(f"[FASTAPI] Incoming /quiz/reveal-all Request for quiz_id: {req.quiz_id}")
    answers = get_all_answers(req.quiz_id)
    if answers is None:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    return {"answers": answers}
