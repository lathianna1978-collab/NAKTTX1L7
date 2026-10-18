import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StudentSession, StudentAnswer, StudentClass, StageNumber } from './types';
import { MASTER_QUESTIONS, getCustomShuffledQuestions } from './data/questions';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { StageHeader } from './components/StageHeader';
import { TimerBar } from './components/TimerBar';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import { Certificate } from './components/Certificate';
import { TeacherDashboard } from './components/TeacherDashboard';
import { soundManager } from './utils/sound';
import { api, getLocalActiveId } from './services/api';
import confetti from 'canvas-confetti';

export default function App() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [allTeacherSessions, setAllTeacherSessions] = useState<StudentSession[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);
  const [showCertificateOnly, setShowCertificateOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Question & Total Countdown Timers (seconds)
  const [questionSeconds, setQuestionSeconds] = useState<number>(60);
  const [totalSeconds, setTotalSeconds] = useState<number>(1200);
  const [isQuestionLocked, setIsQuestionLocked] = useState<boolean>(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial session on startup
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const activeId = getLocalActiveId();
      if (activeId) {
        const found = await api.checkSession(activeId);
        if (found) {
          setSession(found);
          // If in progress, sync time
          if (found.status === 'dang_lam') {
            const elapsed = Math.floor((Date.now() - found.startedAt) / 1000);
            const remaining = Math.max(0, found.totalTimeLimitSeconds - elapsed);
            setTotalSeconds(remaining);
            setQuestionSeconds(60);
          }
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  // Handle finalize test
  const handleFinalizeExam = useCallback(async () => {
    if (!session || session.status === 'da_nop') return;
    setIsQuestionLocked(true);
    try {
      const finalized = await api.finalizeSession(session.studentId);
      setSession(finalized);
    } catch (err) {
      console.error('Finalize error:', err);
    } finally {
      setIsQuestionLocked(false);
    }
  }, [session]);

  // Main Timer Effect during active exam
  useEffect(() => {
    if (!session || session.status !== 'dang_lam') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // Decrement total time
      setTotalSeconds((prevTotal) => {
        if (prevTotal <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinalizeExam();
          return 0;
        }
        return prevTotal - 1;
      });

      // Decrement question time
      setQuestionSeconds((prevQ) => {
        if (prevQ <= 6 && prevQ > 1) {
          soundManager.playTick();
        }
        if (prevQ <= 1) {
          // Time out for current question: advance automatically
          handleTimeoutAdvance();
          return 60;
        }
        return prevQ - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, handleFinalizeExam]);

  // Customized questions shuffled per session examCode
  const activeQuestions = useMemo(
    () => getCustomShuffledQuestions(session?.examCode || 'MÃ ĐỀ 701'),
    [session?.examCode]
  );

  // Handle question timeout: auto-skip/submit empty
  const handleTimeoutAdvance = async () => {
    if (!session || session.status !== 'dang_lam' || isQuestionLocked) return;
    const currentQ = activeQuestions[session.currentQuestionIndex];
    if (!currentQ) return;

    soundManager.playWrong();
    setFeedbackStatus('wrong');

    const nextIdx = session.currentQuestionIndex + 1;
    const timeoutAns: StudentAnswer = {
      questionId: currentQ.id,
      type: currentQ.type,
      isSkippedOrTimeout: true,
      timeSpentSeconds: 60,
    };

    await api.submitAnswer(session.studentId, timeoutAns, nextIdx);

    if (nextIdx >= activeQuestions.length) {
      await handleFinalizeExam();
    } else {
      setSession((prev) => (prev ? { ...prev, currentQuestionIndex: nextIdx } : null));
      setQuestionSeconds(60);
      setTimeout(() => setFeedbackStatus('idle'), 1500);
    }
  };

  // Student confirms answer manually
  const handleConfirmAnswer = async (answer: StudentAnswer) => {
    if (!session || session.status !== 'dang_lam' || isQuestionLocked) return;
    setIsQuestionLocked(true);

    const currentQ = activeQuestions[session.currentQuestionIndex];
    const timeSpent = 60 - questionSeconds;
    answer.timeSpentSeconds = timeSpent;

    // Check correctness for immediate audio/animation encouragement
    let isAnsCorrect = false;
    if (currentQ.type === 'multiple_choice' && answer.userMultipleChoice) {
      isAnsCorrect = answer.userMultipleChoice.toUpperCase() === currentQ.correctOption?.toUpperCase();
    } else if (currentQ.type === 'fill_in_blank' && answer.userFillBlank) {
      isAnsCorrect = currentQ.acceptedAnswers?.some(
        (a) => a.toLowerCase().trim() === answer.userFillBlank?.toLowerCase().trim()
      ) ?? false;
    } else if (currentQ.type === 'matching' && answer.userMatching && currentQ.correctMatching) {
      isAnsCorrect = Object.keys(currentQ.correctMatching).every(
        (k) => answer.userMatching?.[k] === currentQ.correctMatching?.[k]
      );
    } else if (currentQ.type === 'ordering' && answer.userOrder && currentQ.correctOrder) {
      isAnsCorrect = answer.userOrder.every((val, i) => val === currentQ.correctOrder?.[i]);
    }

    if (isAnsCorrect) {
      soundManager.playCorrect();
      setFeedbackStatus('correct');
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore confetti error
      }
    } else {
      soundManager.playWrong();
      setFeedbackStatus('wrong');
    }

    const nextIdx = session.currentQuestionIndex + 1;

    // Check if transitioning to next stage
    const nextQ = activeQuestions[nextIdx];
    if (nextQ && nextQ.stage !== currentQ.stage) {
      soundManager.playStageTransition();
    }

    await api.submitAnswer(session.studentId, answer, nextIdx);

    // If reached end of 20 questions
    if (nextIdx >= MASTER_QUESTIONS.length) {
      setTimeout(async () => {
        await handleFinalizeExam();
        setIsQuestionLocked(false);
      }, 700);
    } else {
      setTimeout(() => {
        setSession((prev) => (prev ? { ...prev, currentQuestionIndex: nextIdx } : null));
        setQuestionSeconds(60);
        setIsQuestionLocked(false);
        setFeedbackStatus('idle');
      }, 700);
    }
  };

  // Start new session
  const handleStartSession = async (fullName: string, studentClass: StudentClass, studentId: string) => {
    const res = await api.startSession(fullName, studentClass, studentId);
    if (res.success && res.session) {
      setSession(res.session);
      setTotalSeconds(res.session.totalTimeLimitSeconds);
      setQuestionSeconds(res.session.questionTimeLimitSeconds);
      soundManager.playStageTransition();
    }
    return res;
  };

  // Open Teacher Portal
  const handleOpenTeacher = async () => {
    const list = await api.getTeacherSubmissions();
    setAllTeacherSessions(list);
    setShowTeacherModal(true);
  };

  // Reset student attempt in teacher mode
  const handleResetStudentAttempt = async (targetId: string) => {
    const ok = await api.resetStudentAttempt(targetId);
    if (ok) {
      if (session?.studentId === targetId) {
        setSession(null);
      }
      const updated = await api.getTeacherSubmissions();
      setAllTeacherSessions(updated);
    }
    return ok;
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 text-slate-800 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white/90 p-8 rounded-3xl border-2 border-blue-200 shadow-2xl backdrop-blur-md max-w-sm">
          <div className="w-14 h-14 border-4 border-amber-400 border-t-blue-600 rounded-full animate-spin mx-auto shadow-md" />
          <div>
            <h3 className="text-base font-black text-blue-900 uppercase">THCS TÂN HẢI · GDCD 7</h3>
            <p className="text-xs font-bold text-slate-600 mt-1">Đang khởi tạo hệ thống thi trực tuyến...</p>
          </div>
        </div>
      </div>
    );
  }

  // Active question info based on activeQuestions
  const currentQIndex = session?.currentQuestionIndex ?? 0;
  const currentQuestion = activeQuestions[Math.min(currentQIndex, activeQuestions.length - 1)];
  const currentStage: StageNumber = currentQuestion.stage;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/80 via-blue-50/40 to-indigo-50/60 text-slate-900 selection:bg-amber-300 selection:text-slate-950 relative overflow-x-hidden">
      {/* Decorative ambient background lights for middle school vibrancy */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/4 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Universal Header */}
      <Header
        session={session}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenTeacher={handleOpenTeacher}
        onViewCertificate={session?.status === 'da_nop' ? () => setShowCertificateOnly(true) : undefined}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {showCertificateOnly && session && session.status === 'da_nop' ? (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setShowCertificateOnly(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                ← Quay lại
              </button>
            </div>
            <Certificate session={session} onClose={() => setShowCertificateOnly(false)} />
          </div>
        ) : !session ? (
          // LOGIN & INSTRUCTION VIEW
          <LoginModal
            onStartSession={handleStartSession}
            onViewCompleted={() => setShowCertificateOnly(true)}
          />
        ) : session.status === 'da_nop' ? (
          // COMPLETED RESULT VIEW
          <ResultScreen
            session={session}
            onGoHome={() => {
              setSession(null);
              setShowCertificateOnly(false);
            }}
            onOpenTeacher={handleOpenTeacher}
          />
        ) : (
          // ACTIVE EXAM VIEW (3 STAGES)
          <div className="space-y-4 sm:space-y-6">
            {/* Stage Progress Header */}
            <StageHeader
              stage={currentStage}
              currentQuestionIndex={currentQIndex}
              totalQuestions={activeQuestions.length}
              feedbackStatus={feedbackStatus}
            />

            {/* Dual Countdown Timers */}
            <TimerBar
              questionSecondsLeft={questionSeconds}
              questionTimeLimit={60}
              totalSecondsLeft={totalSeconds}
              totalTimeLimit={1200}
            />

            {/* Interactive Question Card */}
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQIndex + 1}
              totalQuestions={activeQuestions.length}
              onConfirmAnswer={handleConfirmAnswer}
              isLocked={isQuestionLocked}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/90 backdrop-blur-md border-t border-blue-200 py-4 px-4 text-center text-xs text-slate-600 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-blue-900 font-extrabold">TRƯỜNG THCS TÂN HẢI</strong> · <span className="text-blue-700 font-bold">MÔN GIÁO DỤC CÔNG DÂN 7</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Học mà chơi – Chơi mà học · Chương trình GDPT 2018 · Bộ sách Kết nối tri thức
          </div>
        </div>
      </footer>

      {/* Teacher Dashboard Modal */}
      {showTeacherModal && (
        <TeacherDashboard
          sessions={allTeacherSessions}
          onClose={() => setShowTeacherModal(false)}
          onResetStudentAttempt={handleResetStudentAttempt}
          onRefresh={async () => {
            const list = await api.getTeacherSubmissions();
            setAllTeacherSessions(list);
          }}
        />
      )}
    </div>
  );
}
