import React, { useState, useEffect } from 'react';
import { Question, StudentAnswer } from '../types';
import { CheckCircle2, ArrowRight, MoveUp, MoveDown, HelpCircle, BookOpen } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onConfirmAnswer: (answer: StudentAnswer) => void;
  isLocked: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onConfirmAnswer,
  isLocked,
}) => {
  // Local state for answers
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [fillValue, setFillValue] = useState<string>('');
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>({});
  const [activeColA, setActiveColA] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);

  // Initialize or reset when question changes
  useEffect(() => {
    setSelectedOption('');
    setFillValue('');
    setMatchingPairs({});
    setActiveColA(null);

    if (question.type === 'ordering' && question.orderItems) {
      setCurrentOrder(question.orderItems.map((item) => item.id));
    }
  }, [question.id]);

  // Handle re-ordering items
  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    if (isLocked) return;
    const newOrder = [...currentOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setCurrentOrder(newOrder);
  };

  // Handle matching click
  const handleColAClick = (idA: string) => {
    if (isLocked) return;
    setActiveColA(idA === activeColA ? null : idA);
  };

  const handleColBClick = (idB: string) => {
    if (isLocked || !activeColA) return;
    setMatchingPairs((prev) => ({
      ...prev,
      [activeColA]: idB,
    }));
    setActiveColA(null);
  };

  const removeMatchingPair = (idA: string) => {
    if (isLocked) return;
    setMatchingPairs((prev) => {
      const next = { ...prev };
      delete next[idA];
      return next;
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLocked) return;

    const ans: StudentAnswer = {
      questionId: question.id,
      type: question.type,
    };

    if (question.type === 'multiple_choice') {
      ans.userMultipleChoice = selectedOption || undefined;
    } else if (question.type === 'fill_in_blank') {
      ans.userFillBlank = fillValue.trim() || undefined;
    } else if (question.type === 'matching') {
      ans.userMatching = matchingPairs;
    } else if (question.type === 'ordering') {
      ans.userOrder = currentOrder;
    }

    onConfirmAnswer(ans);
  };

  // Determine if student has selected an answer
  const hasAnswered = () => {
    if (question.type === 'multiple_choice') return !!selectedOption;
    if (question.type === 'fill_in_blank') return !!fillValue.trim();
    if (question.type === 'matching') {
      const totalPairs = question.columnA?.length || 4;
      return Object.keys(matchingPairs).length === totalPairs;
    }
    if (question.type === 'ordering') return currentOrder.length > 0;
    return false;
  };

  return (
    <div className="w-full bg-white/95 border-2 border-blue-200 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
      {/* Top Question Tag Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-blue-600 text-white shadow-sm">
            Câu {questionNumber} / {totalQuestions}
          </span>
          <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {question.level} · {question.points} điểm
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="truncate max-w-xs">{question.lesson}</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-base sm:text-xl font-black text-slate-900 leading-relaxed">
          {question.questionText}
        </h3>
      </div>

      {/* Answer Form per Type */}
      <form onSubmit={handleSubmit}>
        {/* TYPE 1: MULTIPLE CHOICE */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="grid grid-cols-1 gap-3 mb-6">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  disabled={isLocked}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-300/40 text-slate-950 font-bold shadow-md scale-[1.01]'
                      : 'bg-slate-50/80 hover:bg-blue-50 border-slate-200 text-slate-800 hover:border-blue-300'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl font-black text-sm shrink-0 flex items-center justify-center transition-colors shadow-sm ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-white border-2 border-slate-300 text-slate-700'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm sm:text-base font-semibold pt-1 leading-snug">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TYPE 2: FILL IN THE BLANK */}
        {question.type === 'fill_in_blank' && (
          <div className="mb-6 space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 text-xs sm:text-sm text-blue-950 font-medium">
              <span className="font-bold text-amber-700">💡 Hướng dẫn làm bài:</span> Em hãy nhập từ hoặc cụm từ thích hợp nhất để điền vào dấu ba chấm (...). Hệ thống chấp nhận chữ hoa, chữ thường và không dấu nếu đúng nghĩa.
            </div>

            <div className="relative">
              <input
                type="text"
                disabled={isLocked}
                placeholder="Nhập câu trả lời của em tại đây..."
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-blue-50/30 border-2 border-blue-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/20 text-slate-900 text-base sm:text-xl font-black placeholder-slate-400 outline-none transition-all shadow-inner"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* TYPE 3: MATCHING COLUMNS */}
        {question.type === 'matching' && question.columnA && question.columnB && (
          <div className="mb-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-xs text-amber-950 flex items-center gap-2 font-medium">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Cách nối:</strong> Nhấp vào 1 mục ở Cột A, sau đó nhấp vào mục tương ứng ở Cột B để kết nối chúng.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column A */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">
                  CỘT A (HÀNH VI / BIỂU HIỆN)
                </div>
                {question.columnA.map((item) => {
                  const matchedTargetId = matchingPairs[item.id];
                  const isActive = activeColA === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      disabled={isLocked}
                      onClick={() => handleColAClick(item.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2.5 ${
                        isActive
                          ? 'bg-amber-100 border-amber-500 ring-4 ring-amber-300/40 text-slate-950 font-bold'
                          : matchedTargetId
                          ? 'bg-blue-50 border-blue-400 text-slate-900 font-semibold'
                          : 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs shrink-0 flex items-center justify-center shadow-sm">
                        {item.id}
                      </span>
                      <span className="flex-1">{item.text}</span>
                      {matchedTargetId && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase shrink-0 shadow-sm">
                          ➔ {matchedTargetId}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Column B */}
              <div className="space-y-2.5">
                <div className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-1">
                  CỘT B (Ý NGHĨA / PHÂN LOẠI)
                </div>
                {question.columnB.map((item) => {
                  const linkedFrom = Object.entries(matchingPairs).find(([, targetId]) => targetId === item.id)?.[0];
                  return (
                    <button
                      type="button"
                      key={item.id}
                      disabled={isLocked || !activeColA}
                      onClick={() => handleColBClick(item.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-2.5 ${
                        activeColA
                          ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-400 shadow-sm'
                          : linkedFrom
                          ? 'bg-blue-50 border-blue-400 text-slate-900 font-semibold'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs shrink-0 flex items-center justify-center uppercase shadow-sm">
                        {item.id}
                      </span>
                      <span className="flex-1">{item.text}</span>
                      {linkedFrom && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-sm">
                          Nối với {linkedFrom}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Matching Pairs summary bar */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border-2 border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-600 font-bold">Các cặp đã nối:</span>
              <div className="flex flex-wrap items-center gap-2">
                {question.columnA.map((item) => {
                  const target = matchingPairs[item.id];
                  return (
                    <span
                      key={item.id}
                      onClick={() => target && removeMatchingPair(item.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-black border-2 transition-colors ${
                        target
                          ? 'bg-blue-100 text-blue-900 border-blue-300 cursor-pointer hover:bg-rose-100 hover:border-rose-400 hover:text-rose-700 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                      title={target ? 'Bấm để hủy nối cặp này' : undefined}
                    >
                      {item.id} - {target ? target.toUpperCase() : '...'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TYPE 4: ORDERING / SEQUENCE */}
        {question.type === 'ordering' && question.orderItems && (
          <div className="mb-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-xs text-amber-950 flex items-center gap-2 font-medium">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Cách sắp xếp:</strong> Dùng nút mũi tên Lên/Xuống để đưa các bước về đúng trình tự từ bước 1 đến bước 4.
              </span>
            </div>

            <div className="space-y-2.5">
              {currentOrder.map((itemId, index) => {
                const item = question.orderItems?.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <div
                    key={itemId}
                    className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-3 shadow-sm hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-black text-xs shrink-0 flex items-center justify-center">
                        B{index + 1}
                      </span>
                      <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center justify-center">
                        {item.id}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {item.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={isLocked || index === 0}
                        onClick={() => moveOrderItem(index, 'up')}
                        className="p-2.5 rounded-xl bg-white hover:bg-blue-100 border border-slate-200 disabled:opacity-30 text-blue-700 transition-colors cursor-pointer shadow-sm"
                        title="Di chuyển lên"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLocked || index === currentOrder.length - 1}
                        onClick={() => moveOrderItem(index, 'down')}
                        className="p-2.5 rounded-xl bg-white hover:bg-blue-100 border border-slate-200 disabled:opacity-30 text-blue-700 transition-colors cursor-pointer shadow-sm"
                        title="Di chuyển xuống"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sequence preview banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">Trình tự em chọn:</span>
              <span className="font-black text-blue-800 tracking-wider text-sm">
                {currentOrder.map((id) => `(${id})`).join(' ➔ ')}
              </span>
            </div>
          </div>
        )}

        {/* Action Button: XÁC NHẬN CÂU TRẢ LỜI */}
        <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-semibold">
            * Lưu ý: Sau khi xác nhận, em sẽ không thể quay lại câu hỏi này.
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              hasAnswered()
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-400/30 active:scale-[0.98]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            <span>{hasAnswered() ? 'XÁC NHẬN CÂU TRẢ LỜI' : 'BỎ QUA / CHUYỂN TIẾP'}</span>
            {hasAnswered() ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};
