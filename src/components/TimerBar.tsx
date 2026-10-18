import React from 'react';
import { Clock, AlertTriangle, Hourglass } from 'lucide-react';

interface TimerBarProps {
  questionSecondsLeft: number; // 60 -> 0
  questionTimeLimit: number; // 60
  totalSecondsLeft: number; // 1200 -> 0
  totalTimeLimit: number; // 1200
}

export const TimerBar: React.FC<TimerBarProps> = ({
  questionSecondsLeft,
  questionTimeLimit = 60,
  totalSecondsLeft,
  totalTimeLimit = 1200,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isQuestionUrgent = questionSecondsLeft <= 10;
  const isTotalUrgent = totalSecondsLeft <= 120; // 2 minutes

  const questionPct = Math.max(0, Math.min(100, (questionSecondsLeft / questionTimeLimit) * 100));
  const totalPct = Math.max(0, Math.min(100, (totalSecondsLeft / totalTimeLimit) * 100));

  return (
    <div className="w-full bg-white/95 border-2 border-blue-200 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 items-center">
        {/* Timer 1: Question Timer (60s) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Hourglass className={`w-4 h-4 ${isQuestionUrgent ? 'text-rose-600 animate-spin' : 'text-amber-500'}`} />
              <span>Thời gian câu hỏi này:</span>
            </span>
            <span
              className={`font-mono text-sm font-black px-2.5 py-0.5 rounded-lg border-2 ${
                isQuestionUrgent
                  ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {questionSecondsLeft}s
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isQuestionUrgent
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400'
              }`}
              style={{ width: `${questionPct}%` }}
            />
          </div>
        </div>

        {/* Timer 2: Total Exam Timer (20 mins) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Clock className={`w-4 h-4 ${isTotalUrgent ? 'text-rose-600' : 'text-blue-600'}`} />
              <span>Tổng thời gian bài thi:</span>
            </span>
            <span
              className={`font-mono text-sm font-black px-2.5 py-0.5 rounded-lg border-2 ${
                isTotalUrgent
                  ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
              }`}
            >
              {formatTime(totalSecondsLeft)}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isTotalUrgent
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </div>
      </div>

      {isQuestionUrgent && (
        <div className="mt-2 text-center text-xs font-black text-rose-600 flex items-center justify-center gap-1.5 animate-pulse bg-rose-50 py-1 rounded-lg border border-rose-200">
          <AlertTriangle className="w-4 h-4" />
          <span>Sắp hết thời gian câu này! Hãy chọn đáp án và bấm Xác nhận ngay.</span>
        </div>
      )}
    </div>
  );
};
