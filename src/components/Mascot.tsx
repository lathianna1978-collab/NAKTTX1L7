import React from 'react';

export type MascotMood = 'greeting' | 'thinking' | 'cheering' | 'encouraging' | 'victorious';

interface MascotProps {
  mood?: MascotMood;
  message?: string;
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'greeting',
  message,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3D-styled Cartoon Mascot Avatar */}
      <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl animate-float">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <defs>
            {/* Gradients */}
            <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffdfba" />
              <stop offset="85%" stopColor="#f3be96" />
              <stop offset="100%" stopColor="#e29f74" />
            </radialGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c3e50" />
              <stop offset="100%" stopColor="#1a252f" />
            </linearGradient>
            <linearGradient id="uniformGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="cheeksGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Glow Ring */}
          <circle cx="60" cy="60" r="54" fill="url(#goldGrad)" opacity="0.18" />
          <circle cx="60" cy="60" r="50" fill="#0f172a" stroke="url(#goldGrad)" strokeWidth="2.5" />

          {/* Body / School Uniform */}
          <path d="M 32 108 Q 30 84 60 84 Q 90 84 88 108 Z" fill="url(#uniformGrad)" />
          {/* White shirt collar */}
          <polygon points="60,86 50,96 55,108 60,98 65,108 70,96" fill="#f8fafc" />
          {/* Red necktie / badge */}
          <polygon points="60,95 56,104 60,112 64,104" fill="#dc2626" />

          {/* Head */}
          <circle cx="60" cy="54" r="28" fill="url(#faceGrad)" />

          {/* Hair back */}
          <path d="M 32 50 Q 28 30 60 26 Q 92 30 88 50 Q 75 32 60 32 Q 45 32 32 50 Z" fill="url(#hairGrad)" />

          {/* Ears */}
          <circle cx="31" cy="55" r="5" fill="#f3be96" />
          <circle cx="89" cy="55" r="5" fill="#f3be96" />

          {/* Cheeks */}
          <ellipse cx="44" cy="60" rx="4" ry="2.5" fill="#fb7185" opacity="0.6" />
          <ellipse cx="76" cy="60" rx="4" ry="2.5" fill="#fb7185" opacity="0.6" />

          {/* Eyes depending on mood */}
          {mood === 'cheering' || mood === 'victorious' ? (
            <>
              {/* Happy squint eyes ^ ^ */}
              <path d="M 44 51 Q 49 45 54 51" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 66 51 Q 71 45 76 51" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Big sparkly open eyes */}
              <ellipse cx="49" cy="52" rx="4" ry="5.5" fill="#0f172a" />
              <ellipse cx="71" cy="52" rx="4" ry="5.5" fill="#0f172a" />
              <circle cx="47.5" cy="50" r="1.8" fill="#ffffff" />
              <circle cx="69.5" cy="50" r="1.8" fill="#ffffff" />
              <circle cx="50.5" cy="54" r="0.8" fill="#ffffff" />
              <circle cx="72.5" cy="54" r="0.8" fill="#ffffff" />
            </>
          )}

          {/* Mouth */}
          {mood === 'cheering' || mood === 'victorious' ? (
            <path d="M 52 62 Q 60 74 68 62 Z" fill="#e11d48" stroke="#be123c" strokeWidth="1" />
          ) : mood === 'thinking' ? (
            <ellipse cx="60" cy="64" rx="3" ry="2" fill="#be123c" />
          ) : mood === 'encouraging' ? (
            <path d="M 54 62 Q 60 68 66 62" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M 52 61 Q 60 70 68 61" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* Eyebrows */}
          {mood === 'thinking' ? (
            <>
              <path d="M 44 44 Q 49 46 54 44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 66 41 Q 71 42 76 45" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <path d="M 44 43 Q 49 41 54 43" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 66 43 Q 71 41 76 43" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Academic Graduation / Student Beret */}
          <path d="M 28 32 L 60 20 L 92 32 L 60 38 Z" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M 42 34 L 42 42 Q 60 47 78 42 L 78 34" fill="#172554" />
          {/* Tassel */}
          <circle cx="60" cy="24" r="2.5" fill="#f59e0b" />
          <path d="M 60 24 Q 72 26 78 36" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <circle cx="78" cy="38" r="2.5" fill="#f59e0b" />

          {/* Accessory: Trophy or Star based on mood */}
          {mood === 'victorious' && (
            <g transform="translate(86, 70) scale(0.7)">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="url(#goldGrad)" filter="url(#glow)" />
            </g>
          )}
          {mood === 'thinking' && (
            <g transform="translate(85, 20) scale(0.65)">
              <circle cx="12" cy="12" r="8" fill="#fde047" opacity="0.9" filter="url(#glow)" />
              <rect x="9" y="18" width="6" height="4" rx="1" fill="#94a3b8" />
            </g>
          )}
        </svg>

        {/* Small badge */}
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-slate-900 rounded-full shadow-md">
          Bé Hải
        </span>
      </div>

      {/* Speech Bubble */}
      {message && (
        <div className="relative bg-white/95 border-2 border-blue-200 rounded-2xl px-4 py-3 shadow-md backdrop-blur-md max-w-md">
          {/* Bubble tail */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
