import os
import json
from openai import OpenAI

# DeepSeek is OpenAI compatible
def get_deepseek_client() -> OpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY environment variable is missing")
    return OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

def generate_feedback(student_answers: dict, correct_answers: dict) -> dict:
    """
    Calls the DeepSeek LLM to evaluate student answers against correct answers.
    Returns a dictionary containing a 'score' (0-10) and 'feedback_text' (encouraging Vietnamese text).
    """
    client = get_deepseek_client()
    
    prompt = f"""
    Bạn là một giáo viên dạy môn Sinh học thân thiện, nhiệt huyết.
    Dưới đây là đáp án học sinh đã điền và đáp án đúng.
    
    Đáp án học sinh:
    {json.dumps(student_answers, ensure_ascii=False, indent=2)}
    
    Đáp án chuẩn:
    {json.dumps(correct_answers, ensure_ascii=False, indent=2)}
    
    Nhiệm vụ của bạn:
    1. So sánh và chấm điểm trên thang điểm 10.
    2. Đưa ra một đoạn nhận xét ngắn gọn, khích lệ bằng tiếng Việt để đọc lên (giọng nói) cho học sinh nghe. Bắt đầu bằng việc khen ngợi, sau đó chỉ ra lỗi sai (nếu có) một cách nhẹ nhàng. Không cần liệt kê lại tất cả các câu, chỉ tập trung vào nhận xét tổng quan.
    
    Trả về ĐÚNG định dạng JSON sau (không chứa markdown nào khác):
    {{
        "score": <điểm số là một số float từ 0 đến 10>,
        "feedback_text": "<đoạn văn bản nhận xét>"
    }}
    """
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that outputs strictly in JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )
    
    try:
        content = response.choices[0].message.content
        result = json.loads(content)
        return {
            "score": float(result.get("score", 0.0)),
            "feedback_text": result.get("feedback_text", "Có lỗi xảy ra khi tạo nhận xét.")
        }
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        return {"score": 0.0, "feedback_text": "Hệ thống gặp sự cố khi tạo nhận xét."}
