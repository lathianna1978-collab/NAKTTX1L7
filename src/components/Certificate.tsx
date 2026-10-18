import React, { useRef, useState } from 'react';
import { StudentSession } from '../types';
import { Download, Printer, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CertificateProps {
  session: StudentSession;
  onClose?: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ session, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formattedDate = session.submittedAt
    ? new Date(session.submittedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('vi-VN');

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Giay_Chung_Nhan_GDCD7_${session.fullName.replace(/\s+/g, '_')}_${session.studentClass}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating certificate image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Giấy chứng nhận điện tử THCS Tân Hải</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang xuất ảnh...' : 'Tải Giấy Chứng Nhận (PNG)'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>In</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      {/* The Printable Certificate Container */}
      <div
        ref={certificateRef}
        className="relative bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-8 border-double border-amber-600/70 overflow-hidden font-sans"
        style={{ minHeight: '560px' }}
      >
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-amber-600 pointer-events-none" />

        {/* Faint Background Emblem Pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-96 h-96 text-slate-950" />
        </div>

        {/* National Motto & School Header */}
        <div className="text-center mb-6 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-amber-600/30 pb-3 mb-4 gap-2">
            <div className="text-center sm:text-left">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
                ỦY BAN NHÂN DÂN THỊ XÃ LA GI
              </p>
              <h2 className="text-xs sm:text-sm font-black uppercase text-blue-950 tracking-wide">
                TRƯỜNG THCS TÂN HẢI
              </h2>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="text-[11px] sm:text-xs font-semibold italic text-slate-600">
                Độc lập – Tự do – Hạnh phúc
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>CHƯƠNG TRÌNH GIÁO DỤC PHỔ THÔNG 2018</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h1
            className="text-3xl sm:text-5xl font-black text-amber-600 tracking-wide uppercase drop-shadow"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            GIẤY CHỨNG NHẬN
          </h1>
          <p className="text-sm sm:text-base font-bold text-blue-950 tracking-wider uppercase mt-1">
            HOÀN THÀNH HÀNH TRÌNH TRI THỨC MÔN GIÁO DỤC CÔNG DÂN 7
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2 rounded-full" />
        </div>

        {/* Recipient Details */}
        <div className="text-center my-6 space-y-2 relative">
          <p className="text-xs sm:text-sm text-slate-600 italic">Chứng nhận em:</p>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-wide">
            {session.fullName.toUpperCase()}
          </h3>
          <p className="text-sm sm:text-base font-bold text-slate-700">
            Học sinh lớp: <span className="text-blue-900 font-black px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">{session.studentClass}</span>
          </p>
        </div>

        {/* Game & Achievement Box */}
        <div className="max-w-xl mx-auto my-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-300/80 text-center shadow-sm relative">
          <p className="text-xs text-slate-600 font-medium mb-1">
            Đã xuất sắc hoàn thành trò chơi kiểm tra:
          </p>
          <p className="text-sm sm:text-base font-black text-blue-950 uppercase mb-3">
            GIẢI MÃ TRI THỨC GDCD 7 – THCS TÂN HẢI
          </p>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-amber-200">
            <div>
              <span className="text-[11px] text-slate-500 block">Điểm số</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                {session.score !== undefined ? session.score.toFixed(1) : '10.0'}/10
              </span>
            </div>
            <div className="h-8 w-px bg-amber-300" />
            <div>
              <span className="text-[11px] text-slate-500 block">Danh hiệu đạt được</span>
              <span className="text-sm sm:text-base font-black text-blue-900 uppercase">
                {session.rankTitle || 'SIÊU SAO TRI THỨC'}
              </span>
            </div>
          </div>
        </div>

        {/* Encouragement Quote */}
        {session.rankMessage && (
          <div className="max-w-lg mx-auto text-center my-4 italic text-xs sm:text-sm text-slate-600 px-4">
            “{session.rankMessage}”
          </div>
        )}

        {/* Footer & Signature */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-4 items-end text-xs text-slate-700 relative">
          <div className="text-center sm:text-left pl-4">
            <p className="font-medium text-slate-500">Mã bài kiểm tra: <span className="font-mono font-bold text-slate-800">{session.examCode}</span></p>
            <p className="font-medium text-slate-500">Trạng thái: <span className="text-emerald-700 font-bold">Đã nộp bài hợp lệ</span></p>
            {/* Visual Gold Seal */}
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-amber-600" />
              <span>THCS TÂN HẢI VERIFIED</span>
            </div>
          </div>

          <div className="text-center pr-4">
            <p className="italic text-slate-600 mb-1">Tân Hải, ngày {formattedDate}</p>
            <p className="font-black uppercase text-blue-950 text-xs sm:text-sm">
              BAN TỔ CHỨC BỘ MÔN GDCD
            </p>
            <div className="h-12 flex items-center justify-center">
              <span className="font-serif italic text-amber-700 font-bold text-lg opacity-80">
                THCS Tân Hải
              </span>
            </div>
            <p className="font-bold text-slate-800 text-xs">Giáo viên GDCD Khối 7</p>
          </div>
        </div>

        {/* Required Disclaimer */}
        <div className="text-center mt-6 pt-3 border-t border-slate-200">
          <p className="text-[10px] text-slate-400 italic">
            * Lưu ý: Đây là giấy chứng nhận điện tử hoàn thành trò chơi học tập môn GDCD 7, không phải văn bằng hoặc chứng chỉ quốc gia chính thức.
          </p>
        </div>
      </div>
    </div>
  );
};
