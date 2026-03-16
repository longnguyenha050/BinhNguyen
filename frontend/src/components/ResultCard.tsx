
interface ResultCardProps {
  groupName: string;
  score: number;
  feedbackText: string;
  audioUrl: string;
}

export function ResultCard({ groupName, score, feedbackText, audioUrl }: ResultCardProps) {
  return (
    <div className="result-card">
      <div className="result-header">
        <h3 className="result-title">{groupName}</h3>
        <span className="score-badge">{score} / 10</span>
      </div>
      
      <p className="feedback-text">{feedbackText}</p>
      
      {audioUrl && (
        <div className="audio-player-container">
          <audio controls src={audioUrl}>
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        </div>
      )}
    </div>
  );
}
