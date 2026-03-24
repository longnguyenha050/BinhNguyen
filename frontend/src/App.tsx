import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GradeForm } from "./components/GradeForm";
import { ResultCard } from "./components/ResultCard";
import { VirtualTeacher } from "./components/VirtualTeacher";
import { ReportSummary } from "./components/ReportSummary";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

interface GradeResult {
  group_name: string;
  score?: number;
  feedback_text: string;
  student_answers: Record<string, string>;
  student_grades: Record<string, string>;
  audio_url?: string;
}

function App() {
  const [step, setStep] = useState<"idle" | "grading" | "result" | "report">(
    "idle",
  );
  const [results, setResults] = useState<GradeResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  const handleGradeSubmit = async (
    sheetFile: File,
    studentFile: File,
    correctAnswers: Record<string, string>,
  ) => {
    setStep("grading");
    setError(null);
    setCurrentIndex(0);

    try {
      const formData = new FormData();
      formData.append("sheet_csv", sheetFile);
      formData.append("student_answers", studentFile);
      formData.append("correct_answers", JSON.stringify(correctAnswers));

      const response = await fetch(`${apiBaseUrl}/api/grade`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Lỗi xử lý bài làm.");
      }

      const data = await response.json();

      // Tạo hiệu ứng chờ để cô giáo ảo "làm việc"
      setTimeout(() => {
        setResults(data.results);
        setStep("result");
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi kết nối.");
      setStep("idle");
    }
  };

  const handleNextGroup = () => {
    setTimeout(() => {
      if (currentIndex < results.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setStep("report");
      }
    }, 1200);
  };

  const resetApp = () => {
    setStep("idle");
    // setResults([]);
    // setCurrentIndex(0);
  };

  return (
    <div
      className="app-container"
      style={{ maxWidth: "1100px", margin: "0 auto", display: 'flex', flexDirection: 'column', minHeight: '100vh', }}
    >
      <Header onReset={resetApp} />
      {/* 1. TRẠNG THÁI CHỜ (IDLE) */}
      {step === "idle" && (
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s" }}>
          {/* <div style={{ marginBottom: '20px' }}>
            <Bot size={64} color="#4f46e5" strokeWidth={1.5} />
          </div> */}
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px"}}>
            Trợ Lý AI Chấm Điểm
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "30px" }}>
            Tải lên các file cần thiết để bắt đầu chấm bài tự động
          </p>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <GradeForm onSubmit={handleGradeSubmit} isLoading={false} />
        </div>
      )}

      {/* 2. TRẠNG THÁI ĐANG CHẤM HOẶC HIỂN THỊ KẾT QUẢ */}
      {(step === "grading" || step === "result") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* CỘT TRÁI: CÔ GIÁO ẢO */}
          <div style={{ position: "sticky", top: "60px", textAlign: "center" }}>
            <VirtualTeacher
              status={step}
              message={
                step === "grading"
                  ? "Cô đã nhận được phần trình bày của tất cả các nhóm. Bây giờ Cô sẽ kiểm tra lại đáp án và chấm điểm nhận xét từng nhóm, đợi cô một chút nhé..."
                  : `Đang xem nhận xét nhóm: ${results[currentIndex]?.group_name}`
              }
            />
            {step === "result" && (
              <button
                onClick={resetApp}
                style={{
                  marginTop: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#6b7280",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  margin: "24px auto",
                }}
              >
                <RefreshCw size={16} /> Chấm lượt mới
              </button>
            )}
          </div>

          {/* CỘT PHẢI: KẾT QUẢ CHI TIẾT */}
          <div>
            {step === "grading" ? (
              <div
                style={{
                  position: "relative" /* Thêm relative để chứa SVG absolute */,
                  padding: "160px 40px",
                  textAlign: "center",
                  background: "#f9fafb",
                  borderRadius: "20px",
                  // Bỏ border CSS mặc định đi vì ta sẽ dùng SVG làm border
                }}
              >
                {/* Lớp SVG tạo viền đứt nét chuyển động */}
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="19" /* Bo góc tương đương với borderRadius 20px của thẻ div */
                    fill="none"
                    stroke="#4f46e5" /* Màu viền khi loading */
                    strokeWidth="2"
                    strokeDasharray="12, 12" /* Chiều dài nét đứt và khoảng trống */
                    style={{ animation: "borderDash 1s linear infinite" }}
                  />
                </svg>

                {/* Nội dung bên trong */}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    className="loader"
                    style={{
                      margin: "0 auto 20px auto",
                      width: "40px",
                      height: "40px",
                      border: "4px solid #e5e7eb",
                      borderTop: "4px solid #4f46e5",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <h3 style={{ color: "#4b5563", margin: 0 }}>
                    Hệ thống đang chấm điểm...
                  </h3>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {results[currentIndex] && (
                  <>
                    {/* QUAN TRỌNG: key={currentIndex} giúp component Render lại hoàn toàn để autoPlay hoạt động */}
                    <ResultCard
                      key={currentIndex}
                      groupName={results[currentIndex].group_name}
                      feedbackText={results[currentIndex].feedback_text}
                      studentAnswers={results[currentIndex].student_answers}
                      studentGrades={results[currentIndex].student_grades}
                      audioUrl={results[currentIndex].audio_url || ""}
                      autoPlay={true}
                      onEnded={handleNextGroup}
                    />

                    {/* THANH TIẾN TRÌNH */}
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          marginBottom: "8px",
                        }}
                      >
                        Tiến độ: Nhóm {currentIndex + 1} / {results.length}
                      </p>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#e5e7eb",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${((currentIndex + 1) / results.length) * 100}%`,
                            height: "100%",
                            background: "#4f46e5",
                            transition: "width 0.4s ease-out",
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {step === "report" && (
        <ReportSummary results={results} onReset={resetApp} />
      )}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes borderDash { to { stroke-dashoffset: -24; } }
      `}</style>
      <Footer />
    </div>
  );
}

export default App;
