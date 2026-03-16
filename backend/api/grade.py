from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

from services.sheets import fetch_sheet_data
from services.llm import generate_feedback
from services.tts import generate_audio

router = APIRouter()

class GradeRequest(BaseModel):
    sheet_url: str
    correct_answers: Dict[str, str] # e.g., {"1": "Miệng", "2": "Thực quản", ...}

class GradeResult(BaseModel):
    group_name: str
    score: float
    feedback_text: str
    audio_url: str

class GradeResponse(BaseModel):
    results: List[GradeResult]

@router.post("/grade", response_model=GradeResponse)
async def grade_sheet(request: GradeRequest):
    try:
        # 1. Fetch data from Google Sheet
        sheet_data = fetch_sheet_data(request.sheet_url)
        
        results = []
        for row in sheet_data:
            group_name = row.get("Group Name", "Unknown Group")
            student_answers = row.get("Answers", {})
            
            # 2. Grade and generate feedback using LLM
            llm_result = generate_feedback(student_answers, request.correct_answers)
            
            # 3. Generate Audio using TTS
            audio_url = generate_audio(llm_result["feedback_text"], group_name)
            
            results.append(GradeResult(
                group_name=group_name,
                score=llm_result["score"],
                feedback_text=llm_result["feedback_text"],
                audio_url=audio_url
            ))
            
        return GradeResponse(results=results)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
