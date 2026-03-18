import os
import json
from openai import OpenAI

# DeepSeek tương thích với OpenAI SDK
def get_deepseek_client() -> OpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY environment variable is missing")
    
    return OpenAI(
        api_key=api_key, 
        base_url="https://api.deepseek.com",
    )

def generate_feedback(worksheet_context: str, correct_answers: dict, student_answers: dict) -> dict:
    """
    Gọi DeepSeek LLM để đối chiếu bài làm của học sinh với đáp án chuẩn.
    Trả về: score (0-10), feedback_text (TTS), và student_grades (chi tiết đúng/sai từng câu).
    """
    client = get_deepseek_client()
    
    prompt = f"""
    Bạn là một trợ giảng AI môn Sinh học thân thiện, nhiệt huyết.
    Dưới đây là Nội dung phiếu học tập (đề bài), Đáp án chuẩn của giáo viên, và Bài làm của nhóm học sinh.
    
    ### 1. NỘI DUNG ĐỀ BÀI:
    {worksheet_context}
    
    ### 2. ĐÁP ÁN CHUẨN CỦA GIÁO VIÊN:
    {json.dumps(correct_answers, ensure_ascii=False, indent=2)}
    
    ### 3. BÀI LÀM CỦA HỌC SINH:
    {json.dumps(student_answers, ensure_ascii=False, indent=2)}
    
    ### NHIỆM VỤ CỦA BẠN:
    1. Đánh giá chi tiết từng câu hỏi xem nhóm học sinh làm "Đúng" hay "Sai".
    2. Viết một đoạn nhận xét ngắn gọn bằng tiếng Việt. Bắt đầu bằng việc khen ngợi, sau đó chỉ ra các câu có lỗi sai và chỉnh sửa lỗi sai ngắn gọn. Không liệt kê lại từng câu.
    3. Không nhận xét lỗi chính tả và bỏ qua lỗi gõ phím. Chỉ tập trung vào nội dung kiến thức.

    ### LƯU Ý QUAN TRỌNG VỀ ĐỊNH DẠNG ÂM THANH (TTS):
    Đoạn `feedback_text` sẽ được dùng để chuyển thành giọng nói (Text-To-Speech). 
    Tuyệt đối KHÔNG sử dụng các ký tự định dạng Markdown như dấu hoa thị (*), dấu thăng (#), hay gạch dưới (_), dấu nháy đơn ('), dấu nháy kép ("). Hãy viết câu chữ tự nhiên như văn nói.
    
    Trả về ĐÚNG định dạng JSON sau:
    {{
        "feedback_text": "<đoạn văn bản nhận xét tự nhiên, không chứa markdown>",
        "student_grades": {{
            "1": "Đúng",
            "2": "Sai",
            ...
        }}
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful AI teaching assistant. You strictly output JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.4 
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Lấy kết quả đúng/sai từng câu lưu vào biến student_grades
        student_grades = result.get("student_grades", {})
        
        return {
            "feedback_text": result.get("feedback_text", "Có lỗi xảy ra khi tạo nhận xét."),
            "student_grades": student_grades
        }
        
    except json.JSONDecodeError as e:
        print(f"Lỗi parse JSON từ LLM: {e}")
        return {"feedback_text": "Hệ thống gặp sự cố khi đọc kết quả từ AI.", "student_grades": {}}
    except Exception as e:
        print(f"Lỗi khi gọi API DeepSeek: {e}")
        return {"feedback_text": "Đã xảy ra lỗi kết nối với trợ lý AI.", "student_grades": {}}