import csv
import io
import json
import zipfile
from typing import List, Dict
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

# Giả định các module này đã được bạn định nghĩa trong project
from services.sheets import clean_csv_to_markdown
from services.llm import generate_feedback
from services.tts import generate_audio

router = APIRouter()

# 1. BẮT BUỘC MỞ COMMENT CÁC MODEL NÀY
class GradeResult(BaseModel):
    group_name: str
    feedback_text: str
    student_answers: Dict[str, str]
    student_grades: Dict[str, str] = None 
    audio_url: str = None # Có thể mở ra sau khi bạn làm xong phần 

class GradeResponse(BaseModel):
    results: List[GradeResult]

def parse_student_csv(csv_string: str) -> List[Dict]:
    """
    Chuyển đổi chuỗi CSV bài làm của học sinh thành list các dictionary.
    Tên cột đáp án sẽ được rút gọn chỉ lấy phần tử cuối cùng (ví dụ "1").
    """
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
        
        # Tạo dictionary answers với key được rút gọn
        answers = {}
        for col in answer_cols:
            # col.split()[-1] sẽ lấy từ cuối cùng của chuỗi. 
            # Dùng thêm điều kiện if else để tránh lỗi nếu cột bị rỗng (không có chữ nào)
            short_key = col.split()[-1] if col and col.split() else col
            
            answers[short_key] = row.get(col, "")
        
        parsed_data.append({
            "Group Name": group_name,
            "Answers": answers
        })
        
    return parsed_data

# 2. HÀM KIỂM TRA ĐỊNH DẠNG FILE
def validate_csv_extension(file: UploadFile):
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail=f"File '{file.filename}' không hợp lệ. Vui lòng chỉ tải lên file .csv")

def validate_zip_extension(file: UploadFile):
    if not file.filename.lower().endswith('.zip'):
        raise HTTPException(status_code=400, detail=f"File '{file.filename}' không hợp lệ. Vui lòng chỉ tải lên file .zip")

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
        markdown_table = clean_csv_to_markdown(sheet_content)

        zip_bytes = await student_answers.read() # Đọc file zip dưới dạng bytes
        
        student_content = ""
        
        # Mở file zip từ memory (io.BytesIO)
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            # Tìm danh sách tất cả các file trong zip có đuôi là .csv
            csv_filenames = [name for name in z.namelist() if name.lower().endswith('.csv')]
            
            if not csv_filenames:
                raise HTTPException(status_code=400, detail="Không tìm thấy file .csv nào bên trong file .zip")
            
            # Lấy file csv đầu tiên tìm thấy
            target_csv_name = csv_filenames[0]
            
            # Đọc nội dung file csv đó
            with z.open(target_csv_name) as f:
                student_content = f.read().decode("utf-8")
        student_data = parse_student_csv(student_content)

        try:
            correct_answers_dict = json.loads(correct_answers)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="correct_answers phải là JSON hợp lệ.")

        results = []
        for row in student_data:
            group_name = row.get("Group Name", "Unknown Group")
            student_answers_dict = row.get("Answers", {})
            
            # Gọi LLM chấm điểm
            llm_result = generate_feedback(
                worksheet_context=markdown_table,
                correct_answers=correct_answers_dict,
                student_answers=student_answers_dict
            )

            audio_url = generate_audio(llm_result["feedback_text"], group_name)
            
            # 2. Đóng gói thêm student_answers_dict vào kết quả trả về
            results.append(GradeResult(
                group_name=group_name,
                feedback_text=llm_result["feedback_text"],
                student_answers=student_answers_dict,  # <--- Trả về data gốc của học sinh
                student_grades=llm_result.get("student_grades", {}), # <--- Thêm chi tiết đúng/sai từng câu nếu có
                audio_url=audio_url
            ))
            
        return GradeResponse(results=results)
    
    except HTTPException as he:
        raise he 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi: {str(e)}")