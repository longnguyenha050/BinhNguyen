import os
import json
from openai import OpenAI

def get_deepseek_client():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY environment variable is missing")
    
    # DeepSeek sử dụng base_url riêng nhưng dùng chung thư viện OpenAI
    client = OpenAI(
        api_key=api_key, 
        base_url="https://api.deepseek.com"
    )
    return client

def generate_feedback(worksheet_context: str, correct_answers: dict, student_answers: dict) -> dict:
    client = get_deepseek_client()
    
    prompt = f"""
    Bạn là một trợ giảng AI môn Sinh học thân thiện. Bạn chỉ trả về định dạng JSON.
    
    ### 1. NỘI DUNG ĐỀ BÀI:
    {worksheet_context}
    
    ### 2. ĐÁP ÁN CHUẨN:
    {json.dumps(correct_answers, ensure_ascii=False, indent=2)}
    
    ### 3. BÀI LÀM CỦA HỌC SINH:
    {json.dumps(student_answers, ensure_ascii=False, indent=2)}
    
    ### QUY TẮC CHẤM ĐIỂM:
    - Nếu nội dung bài làm GIỐNG HỆT với đáp án chuẩn, bạn PHẢI đánh giá là "Đúng".
    - Tuyệt đối không bắt lỗi viết hoa, viết thường.
    - Ví dụ: "biến đổi thức ăn" và "biến đổi thức ăn" là ĐÚNG 100%.
    - Chỉ ra các câu sai và giải thích ngắn gọn, ngoại trừ các câu trả lời sai chính tả.

    ### NHIỆM VỤ:
    1. So sánh từng câu và kết luận Đúng/Sai.
    2. Viết đoạn nhận xét (feedback_text) tự nhiên, không dùng ký tự Markdown (*, #, _, ', ").

    Trả về JSON duy nhất theo cấu trúc:
    {{
        "feedback_text": "...",
        "student_grades": {{ "1": "Đúng", "2": "Sai" }}
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek-chat", # Hoặc "deepseek-reasoner" nếu muốn suy luận mạnh hơn
            messages=[
                {"role": "system", "content": "You are a helpful AI teaching assistant. You strictly output JSON."},
                {"role": "user", "content": prompt},
            ],
            # DeepSeek hỗ trợ ép kiểu JSON bằng cách chỉ định response_format
            response_format={'type': 'json_object'},
            temperature=0.4, # Để mức thấp để tránh chấm sai các từ giống hệt nhau
        )
        
        # Lấy nội dung phản hồi
        content = response.choices[0].message.content
        result = json.loads(content)
        
        return {
            "feedback_text": result.get("feedback_text", "Có lỗi khi tạo nhận xét."),
            "student_grades": result.get("student_grades", {})
        }
        
    except Exception as e:
        print(f"Lỗi khi gọi DeepSeek: {e}")
        return {"feedback_text": "Đã xảy ra lỗi kết nối với DeepSeek AI.", "student_grades": {}}