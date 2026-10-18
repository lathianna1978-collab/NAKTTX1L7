import React, { useEffect, useState } from 'react';
import { StudentSession } from '../types';
import { getRankInfo } from '../data/questions';
import { Mascot } from './Mascot';
import { Certificate } from './Certificate';
import { soundManager } from '../utils/sound';
import { Award, CheckCircle, XCircle, MinusCircle, Clock, ShieldCheck, Sparkles, Home, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultScreenProps {
  session: StudentSession;
  onGoHome: () => void;
  onOpenTeacher?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ session, onGoHome, onOpenTeacher }) => {
  const [showCertificate, setShowCertificate] = useState(false);
  const score = session.score ?? 0;
  const rankInfo = getRankInfo(score);

  // Trigger celebration on mount
  useEffect(() => {
    soundManager.playVictory();

    // Trigger confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);
    } catch (e) {
      console.log('Confetti effect:', e);
    }
  }, []);

  // Calculate completion time in mm:ss
  const completionTimeFormatted = () => {
    if (!session.submittedAt || !session.startedAt) return '20:00';
    const elapsedSeconds = Math.max(1, Math.round((session.submittedAt - session.startedAt) / 1000));
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m} phút ${s.toString().padStart(2, '0')} giây`;
  };

  if (showCertificate) {
    return (
      <div>
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <button
            onClick={() => setShowCertificate(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            ← Quay lại Bảng tổng kết
          </button>
        </div>
        <Certificate session={session} onClose={() => setShowCertificate(false)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-6 sm:my-10 px-4">
      <div className="bg-white/95 border-2 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
        {/* Lock Notification Ribbon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-800 text-xs font-black mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>BÀI LÀM ĐÃ ĐƯỢC GHI NHẬN THÀNH CÔNG – HỆ THỐNG ĐÃ KHÓA BÀI THI</span>
        </div>

        {/* Mascot Congratulating */}
        <div className="flex justify-center mb-6">
          <Mascot mood="victorious" message={rankInfo.feedback} />
        </div>

        {/* Recipient Details */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {session.fullName.toUpperCase()}
          </h2>
          <p className="text-sm font-extrabold text-blue-700 mt-1">
            Lớp {session.studentClass} · {session.examCode}
          </p>
        </div>

        {/* Big Score Card */}
        <div className="max-w-md mx-auto bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-3xl p-6 shadow-md mb-8 relative">
          <div className="text-xs uppercase font-black tracking-widest text-slate-500 mb-1">
            TỔNG ĐIỂM KIỂM TRA
          </div>
          <div className="text-5xl sm:text-6xl font-black text-amber-600 font-mono tracking-tight my-2">
            {score.toFixed(1)}
            <span className="text-2xl sm:text-3xl text-slate-400 font-sans font-medium">/10</span>
          </div>

          {/* Rank Title Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-white border-2 border-amber-400 text-amber-800 font-black text-xs sm:text-sm uppercase tracking-wider mt-2 shadow-sm">
            <span>{rankInfo.icon}</span>
            <span>{rankInfo.title}</span>
            <span>{rankInfo.icon}</span>
          </div>
        </div>

        {/* 4 Detailed Statistics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8">
          {/* Correct */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center shadow-sm">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {session.correctCount ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Số câu đúng</div>
          </div>

          {/* Wrong */}
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-center shadow-sm">
            <XCircle className="w-6 h-6 text-rose-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-rose-700 font-mono">
              {session.wrongCount ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Số câu sai</div>
          </div>

          {/* Blank */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center shadow-sm">
            <MinusCircle className="w-6 h-6 text-slate-500 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-700 font-mono">
              {session.blankCount ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Bỏ trống</div>
          </div>

          {/* Time */}
          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-center shadow-sm">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-xs font-black text-blue-800 mt-2 truncate">
              {completionTimeFormatted()}
            </div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">Thời gian</div>
          </div>
        </div>

        {/* Motivational Feedback Quote */}
        <div className="max-w-lg mx-auto bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 mb-8 text-xs sm:text-sm text-slate-700 leading-relaxed italic font-medium">
          “{rankInfo.feedback}”
        </div>

        {/* Primary Action Buttons: View Certificate & Go Home */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowCertificate(true)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-400/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>NHẬN GIẤY CHỨNG NHẬN ĐIỆN TỬ</span>
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span>QUAY VỀ TRANG CHỦ</span>
          </button>

          {onOpenTeacher && (
            <button
              onClick={onOpenTeacher}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xem Bảng Tổng Kết Lớp</span>
            </button>
          )}
        </div>

        {/* Security and anti-copy lock banner */}
        <div className="mt-8 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center max-w-lg mx-auto shadow-sm">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-900">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>HỆ THỐNG ĐÃ KHÓA BÀI THI CHÍNH THỨC</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            Học sinh không được phép làm lại để tránh chỉnh sửa điểm. Mọi câu hỏi đã được bảo mật để đảm bảo công bằng cho toàn khối 7 Trường THCS Tân Hải.
          </p>
        </div>
      </div>
    </div>
  );
};
