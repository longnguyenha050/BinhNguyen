import csv
import io
import json
import zipfile
import asyncio
from typing import List, Dict
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from services.sheets import clean_csv_to_markdown
from services.llm import generate_feedback
from services.tts import generate_audio

router = APIRouter()

# Khởi tạo Semaphore để giới hạn số lượng request song song (ví dụ: 5 học sinh cùng lúc)
# Tránh treo máy chủ hoặc bị API khóa vì gọi quá nhanh
sem = asyncio.Semaphore(3)

class GradeResult(BaseModel):
    group_name: str
    feedback_text: str
    student_answers: Dict[str, str]
    student_grades: Dict[str, str] = None 
    audio_url: str = None 

class GradeResponse(BaseModel):
    results: List[GradeResult]

def parse_student_csv(csv_string: str) -> List[Dict]:
    if not csv_string.strip():
        return []
    reader = csv.DictReader(io.StringIO(csv_string.strip()))
    parsed_data = []
    if not reader.fieldnames:
        return []
    group_col = reader.fieldnames[1]
    answer_cols = reader.fieldnames[2:]
    for row in reader:
        group_name = row.get(group_col, "Unknown Group")
        answers = {col.split()[-1] if col and col.split() else col: row.get(col, "") for col in answer_cols}
        parsed_data.append({"Group Name": group_name, "Answers": answers})
    return parsed_data

def validate_csv_extension(file: UploadFile):
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail=f"File '{file.filename}' không hợp lệ.")

def validate_zip_extension(file: UploadFile):
    if not file.filename.lower().endswith('.zip'):
        raise HTTPException(status_code=400, detail=f"File '{file.filename}' không hợp lệ.")

@router.post("/grade", response_model=GradeResponse)
async def grade_sheet(
    sheet_csv: UploadFile = File(...),
    student_answers: UploadFile = File(...),
    correct_answers: str = Form(...) 
):
    validate_csv_extension(sheet_csv)
    validate_zip_extension(student_answers)

    try:
        sheet_content = (await sheet_csv.read()).decode("utf-8")
        # Giả sử hàm này xử lý nhanh, có thể chạy trực tiếp
        markdown_table = clean_csv_to_markdown(sheet_content)

        zip_bytes = await student_answers.read()
        
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            csv_filenames = [name for name in z.namelist() if name.lower().endswith('.csv')]
            if not csv_filenames:
                raise HTTPException(status_code=400, detail="Không tìm thấy file .csv trong zip.")
            with z.open(csv_filenames[0]) as f:
                student_content = f.read().decode("utf-8")
        
        student_data = parse_student_csv(student_content)
        correct_answers_dict = json.loads(correct_answers)

        # Hàm xử lý từng học sinh
        async def process_single_student(row):
            # Sử dụng Semaphore để bảo vệ tài nguyên
            async with sem:
                group_name = row.get("Group Name", "Unknown Group")
                student_answers_dict = row.get("Answers", {})
                
                # SỬA LỖI TẠI ĐÂY: Dùng asyncio.to_thread cho hàm đồng bộ
                llm_result = await asyncio.to_thread(
                    generate_feedback,
                    worksheet_context=markdown_table,
                    correct_answers=correct_answers_dict,
                    student_answers=student_answers_dict
                )

                feedback_text = llm_result.get("feedback_text", "")

                # Tiếp tục dùng to_thread cho phần tạo Audio
                audio_url = await asyncio.to_thread(
                    generate_audio, 
                    feedback_text, 
                    group_name
                )
                
                return GradeResult(
                    group_name=group_name,
                    feedback_text=feedback_text,
                    student_answers=student_answers_dict,
                    student_grades=llm_result.get("student_grades", {}),
                    audio_url=audio_url
                )

        # Tạo danh sách các task và chạy song song
        tasks = [process_single_student(row) for row in student_data]
        results = await asyncio.gather(*tasks)
        
        return GradeResponse(results=list(results))
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="correct_answers phải là JSON.")
    except Exception as e:
        # Log lỗi ra terminal để bạn dễ debug
        print(f"Lỗi hệ thống: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi: {str(e)}")