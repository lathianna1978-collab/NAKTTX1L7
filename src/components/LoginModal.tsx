import React, { useState } from 'react';
import { VALID_CLASSES, StudentClass, StudentSession } from '../types';
import { Mascot } from './Mascot';
import { User, School, ArrowRight, ShieldAlert, Award, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface LoginModalProps {
  onStartSession: (fullName: string, studentClass: StudentClass, studentId: string) => Promise<{ success: boolean; session?: StudentSession; message?: string }>;
  existingCompletedSession?: StudentSession | null;
  onViewCompleted: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onStartSession,
  existingCompletedSession,
  onViewCompleted,
}) => {
  const [fullName, setFullName] = useState('');
  const [studentClass, setStudentClass] = useState<StudentClass>('7A10');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedStudent, setCompletedStudent] = useState<StudentSession | null>(existingCompletedSession || null);

  // If student already completed the test on this browser or ID
  if (completedStudent && completedStudent.status === 'da_nop') {
    return (
      <div className="w-full max-w-xl mx-auto my-8 bg-white/95 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          BÀI LÀM ĐÃ ĐƯỢC GHI NHẬN
        </h2>
        <p className="text-sm text-slate-600 mb-6 font-medium">
          Học sinh <strong className="text-blue-900 font-bold">{completedStudent.fullName}</strong> (Lớp{' '}
          <strong className="text-blue-700 font-bold">{completedStudent.studentClass}</strong>) đã hoàn thành bài kiểm tra và nộp bài thành công vào lúc{' '}
          <span className="text-slate-500 font-bold">
            {completedStudent.submittedAt ? new Date(completedStudent.submittedAt).toLocaleTimeString('vi-VN') : ''}
          </span>.
        </p>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-300 mb-6 max-w-sm mx-auto shadow-sm">
          <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Điểm số chính thức</div>
          <div className="text-4xl font-black text-amber-600 mb-1 font-mono">
            {completedStudent.score !== undefined ? completedStudent.score.toFixed(1) : '10.0'}/10
          </div>
          <div className="text-xs font-black text-blue-900 uppercase tracking-wide">
            {completedStudent.rankTitle || 'HOÀN THÀNH XUẤT SẮC'}
          </div>
        </div>

        <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 mb-6 font-semibold">
          🔒 Quy định: Mỗi học sinh chỉ được làm bài 01 lần duy nhất để tránh chỉnh sửa điểm. Em không thể làm lại bài kiểm tra này.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onViewCompleted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>XEM GIẤY CHỨNG NHẬN ĐIỆN TỬ</span>
          </button>

          <button
            onClick={() => {
              setCompletedStudent(null);
              setFullName('');
              setStep('input');
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
          >
            Học sinh khác đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const handleValidateInput = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setErrorMsg('Vui lòng nhập đầy đủ Họ và tên học sinh (tối thiểu 3 ký tự).');
      return;
    }

    // Check if this student already completed the test in database
    setIsSubmitting(true);
    try {
      const existing = await api.checkSession(undefined, trimmedName, studentClass);
      if (existing && existing.status === 'da_nop') {
        setCompletedStudent(existing);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Proceed if check blips
    } finally {
      setIsSubmitting(false);
    }

    setStep('confirm');
  };

  const handleStartExam = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Generate internal student identifier from class and name
      const cleanName = fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      const generatedId = `TH-${studentClass}-${cleanName}`;

      const res = await onStartSession(fullName.trim(), studentClass, generatedId);
      if (!res.success) {
        if (res.session && res.session.status === 'da_nop') {
          setCompletedStudent(res.session);
          return;
        }
        setErrorMsg(res.message || 'Không thể bắt đầu phiên làm bài. Vui lòng thử lại.');
        setStep('input');
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền mạng.');
      setStep('input');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 sm:my-10 px-4">
      <div className="bg-white/95 border-2 border-blue-200 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle Decorative top light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mascot Banner */}
        <div className="mb-6 flex justify-center">
          <Mascot
            mood={step === 'input' ? 'greeting' : 'cheering'}
            message={
              step === 'input'
                ? 'Chào mừng bạn đến với Giải Mã Tri Thức GDCD 7! Hãy điền đúng họ tên và lớp của mình để bắt đầu nhé!'
                : `Chào ${fullName}! Em đã sẵn sàng khám phá 20 câu hỏi tri thức chưa nào?`
            }
          />
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'input' ? (
          <form onSubmit={handleValidateInput} className="space-y-6">
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                THCS Tân Hải · Năm Học 2026 - 2027
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                ĐĂNG NHẬP LÀM BÀI KIỂM TRA
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Bài kiểm tra cá nhân môn Giáo dục công dân 7 – Bộ sách Kết nối tri thức
              </p>
            </div>

            {/* 1. Họ và tên */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>1. Họ và tên học sinh <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-blue-50/40 border-2 border-blue-200 focus:border-blue-600 focus:bg-white text-slate-900 placeholder-slate-400 text-base font-bold outline-none transition-all shadow-inner"
              />
            </div>

            {/* 2. Lớp chọn từ danh sách 7A10 -> 7A14 */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-600" />
                <span>2. Lớp <span className="text-rose-500">*</span></span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {VALID_CLASSES.map((cls) => {
                  const isSelected = studentClass === cls;
                  return (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => setStudentClass(cls)}
                      className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-black border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/30 scale-105'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                * Áp dụng riêng cho học sinh khối 7: các lớp 7A10, 7A11, 7A12, 7A13, 7A14 Trường THCS Tân Hải.
              </p>
            </div>

            {/* Nút XÁC NHẬN THÔNG TIN */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.99] shadow-xl shadow-amber-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'ĐANG KIỂM TRA...' : 'XÁC NHẬN THÔNG TIN'}</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Thông tin hợp lệ</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Chào em, <span className="text-blue-700">{fullName}</span>!
              </h2>
              <p className="text-sm text-indigo-700 font-extrabold mt-1">
                Học sinh lớp: {studentClass} · Trường THCS Tân Hải
              </p>
            </div>

            {/* Thông báo bắt buộc theo quy định III */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-700 space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>QUY ĐỊNH LÀM BÀI KIỂM TRA</span>
              </div>
              <p className="leading-relaxed text-slate-800 font-medium">
                “Em sẽ thực hiện bài kiểm tra cá nhân gồm <strong className="text-blue-800 font-bold">20 câu hỏi</strong> trong thời gian tối đa <strong className="text-blue-800 font-bold">20 phút</strong>. Mỗi câu có <strong className="text-blue-800 font-bold">60 giây</strong>. Hãy đọc kỹ câu hỏi, lựa chọn đáp án và hoàn thành bài bằng chính khả năng của mình. Khi hết giờ, hệ thống sẽ tự động nộp bài.”
              </p>
              <div className="border-t border-blue-200 pt-3 text-[11px] text-slate-600 space-y-1">
                <p>• <strong>3 Chặng thi:</strong> Chặng 1 (Khởi động: 7 câu) ➔ Chặng 2 (Tăng tốc: 7 câu) ➔ Chặng 3 (Về đích: 6 câu).</p>
                <p>• <strong>Bảo mật:</strong> Mỗi học sinh chỉ được làm bài 01 lần duy nhất để tránh sửa điểm. Không quay lại câu trước sau khi chuyển tiếp.</p>
                <p>• Đồng hồ sẽ bắt đầu đếm ngược ngay khi em nhấn nút <strong>“BẮT ĐẦU HÀNH TRÌNH”</strong>.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={isSubmitting}
                className="w-full sm:w-1/3 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Chỉnh sửa thông tin
              </button>
              <button
                type="button"
                onClick={handleStartExam}
                disabled={isSubmitting}
                className="w-full sm:w-2/3 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-400/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>ĐANG KHỞI TẠO ĐỀ THI...</span>
                ) : (
                  <>
                    <span>BẮT ĐẦU HÀNH TRÌNH</span>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
