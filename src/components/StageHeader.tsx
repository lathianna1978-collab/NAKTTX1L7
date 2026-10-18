import React from 'react';
import { StageNumber } from '../types';
import { Rocket, Zap, Trophy, Sparkles } from 'lucide-react';
import { Mascot, MascotMood } from './Mascot';

interface StageHeaderProps {
  stage: StageNumber;
  currentQuestionIndex: number; // 0-based: 0 to 19
  totalQuestions: number; // 20
  feedbackStatus?: 'idle' | 'correct' | 'wrong';
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  stage,
  currentQuestionIndex,
  totalQuestions,
  feedbackStatus = 'idle',
}) => {
  const currentNum = currentQuestionIndex + 1;

  // Stage configurations matching Section V with bright youthful palettes
  const stageConfig = {
    1: {
      name: 'CHẶNG 1: KHỞI ĐỘNG',
      subName: 'Khởi động tự tin',
      icon: Rocket,
      badge: '🚀 KHỞI ĐỘNG',
      gradient: 'from-blue-50 via-sky-100 to-amber-50',
      border: 'border-blue-300',
      activeTabColor: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 border-blue-600 scale-105',
      accentColor: 'text-blue-700',
      message: 'Khởi động thật tự tin! Mỗi câu trả lời là một bước tiến trên hành trình khám phá tri thức.',
      range: 'Câu 1 – 7',
    },
    2: {
      name: 'CHẶNG 2: TĂNG TỐC',
      subName: 'Bứt phá kiến thức',
      icon: Zap,
      badge: '⚡ TĂNG TỐC',
      gradient: 'from-purple-50 via-pink-50 to-emerald-50',
      border: 'border-purple-300',
      activeTabColor: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/30 border-purple-600 scale-105',
      accentColor: 'text-purple-700',
      message: 'Em đang tiến bộ! Hãy bình tĩnh suy nghĩ, đọc kỹ câu hỏi và lựa chọn bằng kiến thức của mình.',
      range: 'Câu 8 – 14',
    },
    3: {
      name: 'CHẶNG 3: VỀ ĐÍCH',
      subName: 'Chạm tay vào cúp vàng',
      icon: Trophy,
      badge: '🏆 VỀ ĐÍCH',
      gradient: 'from-amber-50 via-yellow-100 to-blue-50',
      border: 'border-amber-300',
      activeTabColor: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/40 border-amber-500 scale-105',
      accentColor: 'text-amber-800',
      message: 'Chặng cuối đã đến! Hãy tập trung, phát huy kiến thức và hoàn thành hành trình của em.',
      range: 'Câu 15 – 20',
    },
  }[stage];

  const StageIcon = stageConfig.icon;

  let mascotMood: MascotMood = 'thinking';
  let dynamicMessage = stageConfig.message;

  if (feedbackStatus === 'correct') {
    mascotMood = 'cheering';
    const compliments = ['Chính xác! Tuyệt vời lắm em!', 'Rất xuất sắc! Tiếp tục phát huy nhé!', 'Em làm rất tốt! Tiến thêm một bước!'];
    dynamicMessage = compliments[currentNum % compliments.length];
  } else if (feedbackStatus === 'wrong') {
    mascotMood = 'encouraging';
    dynamicMessage = 'Chưa chính xác. Hãy bình tĩnh và tiếp tục thử thách tiếp theo!';
  }

  return (
    <div className={`w-full rounded-3xl bg-gradient-to-r ${stageConfig.gradient} border-2 ${stageConfig.border} p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300`}>
      {/* Top row: 3 Stages Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* 3 Stages Banner */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-white/80 px-3 py-1 rounded-xl border border-blue-200 shadow-sm">
            3 Chặng Chinh Phục:
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {([1, 2, 3] as StageNumber[]).map((s) => {
              const isCurrent = stage === s;
              const isPassed = stage > s;
              const labels = {
                1: '1. KHỞI ĐỘNG 🚀',
                2: '2. TĂNG TỐC ⚡',
                3: '3. VỀ ĐÍCH 🏆',
              };
              return (
                <div
                  key={s}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border-2 cursor-default ${
                    isCurrent
                      ? stageConfig.activeTabColor
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white/80 text-slate-500 border-slate-200'
                  }`}
                >
                  <span>{labels[s]}</span>
                  {isPassed && <span className="text-emerald-700 font-black">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Counter */}
        <div className="flex items-center gap-2 bg-white border-2 border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-800 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Câu hỏi:</span>
          <span className="text-blue-700 font-black text-base">{currentNum}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">{totalQuestions}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/90 rounded-full h-3 mb-4 overflow-hidden p-0.5 border-2 border-blue-200 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${(currentNum / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Stage Title and Mascot dialogue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <StageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{stageConfig.name}</span>
              <span className="text-xs font-bold text-blue-700 font-mono">({stageConfig.range})</span>
            </h2>
            <p className="text-xs font-bold text-slate-500">{stageConfig.subName}</p>
          </div>
        </div>

        {/* Mascot Guide with bright bubble */}
        <div className="sm:max-w-md w-full">
          <Mascot mood={mascotMood} message={dynamicMessage} />
        </div>
      </div>
    </div>
  );
};
