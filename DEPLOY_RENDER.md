# Deploy lên Render (Backend + Frontend)

## 1) Chuẩn bị trước khi deploy

- Đảm bảo code đã được push lên GitHub.
- Kiểm tra file `render.yaml` đã có ở root project.
- Không commit file `.env` thật chứa API key.

## 2) Deploy bằng Blueprint

1. Vào Render → **New** → **Blueprint**.
2. Kết nối repo GitHub chứa project này.
3. Render sẽ đọc file `render.yaml` và tạo 2 service:
   - `binhnguyen-backend` (Python Web Service)
   - `binhnguyen-frontend` (Static Site)
4. Bấm **Apply** để bắt đầu build/deploy.

## 3) Cấu hình biến môi trường

Sau khi service được tạo, vào phần **Environment** của backend và set:

- `DEEPSEEK_API_KEY`
- `ELEVENLABS_API_KEY`

Frontend cần biến:

- `VITE_API_BASE_URL` = URL public của backend (ví dụ: `https://binhnguyen-backend.onrender.com`)

> Nếu URL backend thực tế khác trong `render.yaml`, hãy sửa `VITE_API_BASE_URL` trên Render và redeploy frontend.

## 4) Kiểm tra sau deploy

- Mở backend URL và kiểm tra endpoint `/` trả về JSON welcome.
- Mở frontend URL, upload file mẫu và thử gọi chấm điểm.
- Kiểm tra log backend nếu gặp lỗi 4xx/5xx.

## 5) Lệnh local tham chiếu

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 6) Lưu ý bảo mật

- Nếu API key từng bị lộ, hãy **rotate key** ngay trên nhà cung cấp.
- Dùng `.env.example` để chia sẻ cấu trúc biến môi trường, không chia sẻ secret thật.
