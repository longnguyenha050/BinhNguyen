import re
import csv
import requests
import io

def clean_csv_to_markdown(raw_csv_string: str) -> str:
    """
    Nhận vào chuỗi CSV thô (có chứa title và dòng rỗng), 
    dọn dẹp và xuất ra bảng Markdown chuẩn.
    """
    if not raw_csv_string.strip():
        return "Không có dữ liệu."

    # Sử dụng io.StringIO để đọc trực tiếp từ chuỗi văn bản
    reader = csv.reader(io.StringIO(raw_csv_string.strip()))
    rows = list(reader)

    # 1. Trích xuất Tiêu đề (Nằm ở ô đầu tiên của dòng đầu tiên)
    # Xóa các dấu phẩy thừa phía sau nếu có
    title_row = rows[0]
    title = title_row[0].strip() if title_row else "PHIẾU HỌC TẬP"
    
    markdown_lines = [f"### {title}\n"]

    headers = []
    data_rows = []
    header_found = False

    # 2. Xử lý các dòng còn lại (bỏ qua dòng title ở index 0)
    for row in rows[1:]:
        # Dọn dẹp khoảng trắng thừa ở mỗi ô
        clean_row = [cell.strip() for cell in row]
        
        # Bỏ qua các dòng rỗng hoàn toàn (ví dụ: dòng chỉ toàn dấu phẩy ',,')
        if all(cell == "" for cell in clean_row):
            continue
            
        if not header_found:
            # Dòng có dữ liệu đầu tiên sau title sẽ là Header
            headers = clean_row
            header_found = True
        else:
            # Đảm bảo số cột của dòng dữ liệu khớp với header
            # Nếu dòng bị thiếu cột, tự động chèn thêm chuỗi rỗng
            while len(clean_row) < len(headers):
                clean_row.append("")
                
            # Chỉ lấy đúng số cột của header, cắt bỏ các cột thừa (nếu có)
            data_rows.append(clean_row[:len(headers)])

    # 3. Lắp ráp bảng Markdown
    if headers:
        header_str = "| " + " | ".join(headers) + " |"
        separator_str = "|" + "|".join(["---"] * len(headers)) + "|"
        
        markdown_lines.extend([header_str, separator_str])
        
        for row in data_rows:
            # An toàn: Tránh ký tự | làm vỡ format bảng
            safe_row = [cell.replace("|", "\\|").replace("\n", " ") for cell in row]
            markdown_lines.append("| " + " | ".join(safe_row) + " |")

    return "\n".join(markdown_lines)

# --- CHẠY THỬ VỚI MẪU CỦA BẠN ---
if __name__ == "__main__":
    sample_csv = """PHIẾU HỌC TẬP: TÌM HIỂU CON ĐƯỜNG THU NHẬN VÀ TIÊU HÓA THỨC ĂN Ở NGƯỜI ,,
Hoạt động,Các cơ quan tham gia ,Chức năng
………(1),Miệng,Đưa thức ăn vào cơ thể và vận chuyển thức ăn xuống dạ dày nhờ ......................... (2)
,,
Biến đổi thức ăn,................. (3), Nghiền nhỏ và nhào trộn thức ăn với nước bọt
,Dạ dày,Tiêu hóa ........................ (4) thức ăn nhờ sự co bóp và các enzyme tiêu hóa.
,................ (5), Tiêu hóa hoàn toàn thức ăn thành các chất dinh dưỡng đơn giản nhờ các enzyme tiết ra từ các tuyến tiêu hóa
………(6),Ruột non,Hấp thụ chất dinh dưỡng vào ……..........(7) và cung cấp cho các cơ quan
,,
,,
,...............(8),Chủ yếu hấp thụ lại nước
Thải các chất cặn bả,Ruột già,Tạo phân và .......................... (9)
,..............(10),Thải phân và các chất khí ra ngoài"""

    result = clean_csv_to_markdown(sample_csv)
    print(result)