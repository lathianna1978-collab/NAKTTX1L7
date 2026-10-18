import React from 'react';
import { Volume2, VolumeX, ShieldCheck, GraduationCap, Award } from 'lucide-react';
import { StudentSession } from '../types';

interface HeaderProps {
  session: StudentSession | null;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenTeacher: () => void;
  onViewCertificate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  isMuted,
  onToggleSound,
  onOpenTeacher,
  onViewCertificate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      {/* Top Banner Ribbon: 3 slogans on the SAME LINE with large, ultra-vibrant typography */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 px-2 sm:px-4 py-2.5 text-center shadow-lg border-b-2 border-amber-400 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 md:gap-6 whitespace-nowrap text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-wide">
          <span className="text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-amber-400 text-base sm:text-lg">🏛️</span>
            <span>TRƯỜNG THCS TÂN HẢI</span>
          </span>
          <span className="text-amber-400 font-black text-xs sm:text-sm opacity-90">✦</span>
          <span className="text-sky-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-sky-300 text-base sm:text-lg">📚</span>
            <span>MÔN GIÁO DỤC CÔNG DÂN 7</span>
          </span>
          <span className="text-amber-400 font-black text-xs sm:text-sm opacity-90">✦</span>
          <span className="text-slate-950 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3.5 sm:px-4 py-1 rounded-full shadow-lg shadow-amber-500/30 font-black tracking-wider border-2 border-amber-200 flex items-center gap-1.5">
            <span className="text-base sm:text-lg">🎯</span>
            <span>HỌC MÀ CHƠI – CHƠI MÀ HỌC</span>
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-blue-600 rounded-[14px] flex items-center justify-center text-amber-300">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>GIẢI MÃ TRI THỨC GDCD 7</span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 rounded-full">
                THCS TÂN HẢI
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold hidden md:block">
              Hệ thống kiểm tra trực tuyến cá nhân theo định hướng GDPT 2018
            </p>
          </div>
        </div>

        {/* Right Actions & Student Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Student Info Chip */}
          {session && (
            <div className="hidden lg:flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-900">{session.fullName}</span>
              <span className="text-slate-400">·</span>
              <span className="font-extrabold text-blue-700">Lớp {session.studentClass}</span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-700 font-bold font-mono text-[11px]">{session.examCode}</span>
            </div>
          )}

          {/* View Certificate button if submitted */}
          {session?.status === 'da_nop' && onViewCertificate && (
            <button
              onClick={onViewCertificate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Chứng nhận</span>
            </button>
          )}

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Teacher Portal Button */}
          <button
            onClick={onOpenTeacher}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Giáo viên</span>
          </button>
        </div>
      </div>
    </header>
  );
};
