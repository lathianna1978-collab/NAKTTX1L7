import { StudentSession, StudentAnswer, StudentClass, Question } from '../types';
import { MASTER_QUESTIONS, getRankInfo, isFillBlankCorrect, isMatchingCorrect, isOrderingCorrect, getCustomShuffledQuestions } from '../data/questions';

const LOCAL_STORAGE_KEY = 'tanhai_gdcd7_sessions';
const ACTIVE_SESSION_ID_KEY = 'tanhai_gdcd7_active_id';
const CLOUD_WEBHOOK_KEY = 'tanhai_cloud_webhook_url';

export function getCloudWebhookUrl(): string {
  try {
    return localStorage.getItem(CLOUD_WEBHOOK_KEY) || (import.meta as any).env?.VITE_SYNC_WEBHOOK_URL || '';
  } catch {
    return '';
  }
}

export function setCloudWebhookUrl(url: string) {
  try {
    if (url) localStorage.setItem(CLOUD_WEBHOOK_KEY, url);
    else localStorage.removeItem(CLOUD_WEBHOOK_KEY);
  } catch (err) {
    console.error('Save webhook error:', err);
  }
}

// Push to Google Sheets / Cloud Webhook asynchronously
export async function pushToCloudWebhook(session: StudentSession) {
  const url = getCloudWebhookUrl();
  if (!url) return;
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      studentName: session.fullName,
      studentClass: session.studentClass,
      examCode: session.examCode,
      score: session.score,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
      blankCount: session.blankCount,
      rankTitle: session.rankTitle,
      startedAt: session.startedAt ? new Date(session.startedAt).toLocaleString('vi-VN') : '',
      submittedAt: session.submittedAt ? new Date(session.submittedAt).toLocaleString('vi-VN') : '',
      durationMinutes: session.submittedAt && session.startedAt ? ((session.submittedAt - session.startedAt) / 60000).toFixed(1) : '20.0',
    };
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors', // Essential for Google Apps Script Web Apps
    });
  } catch (err) {
    console.warn('Webhook transmission notice:', err);
  }
}

// Read all sessions from localStorage
export function getLocalSessions(): StudentSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save all sessions to localStorage
export function saveLocalSessions(sessions: StudentSession[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Get active session ID stored locally
export function getLocalActiveId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
}

export function setLocalActiveId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
  }
}

// Client-side fallback grading (identical to server)
export function localGradeSession(session: StudentSession): StudentSession {
  let totalScore = 0.0;
  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  const gradedAnswers: Record<number, StudentAnswer> = {};
  const examQuestions = getCustomShuffledQuestions(session.examCode || 'MÃ ĐỀ 701');

  for (const q of examQuestions) {
    const userAns = session.answers[q.id];

    if (!userAns) {
      blankCount++;
      gradedAnswers[q.id] = {
        questionId: q.id,
        type: q.type,
        isCorrect: false,
        pointsAwarded: 0,
        isSkippedOrTimeout: true,
      };
      continue;
    }

    let isCorrect = false;

    if (q.type === 'multiple_choice') {
      if (!userAns.userMultipleChoice) {
        blankCount++;
      } else if (userAns.userMultipleChoice.toUpperCase() === q.correctOption?.toUpperCase()) {
        isCorrect = true;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'fill_in_blank') {
      if (!userAns.userFillBlank || !userAns.userFillBlank.trim()) {
        blankCount++;
      } else if (isFillBlankCorrect(userAns.userFillBlank, q.acceptedAnswers)) {
        isCorrect = true;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'matching') {
      if (!userAns.userMatching || Object.keys(userAns.userMatching).length === 0) {
        blankCount++;
      } else if (isMatchingCorrect(userAns.userMatching, q.correctMatching)) {
        isCorrect = true;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'ordering') {
      if (!userAns.userOrder || userAns.userOrder.length === 0) {
        blankCount++;
      } else if (isOrderingCorrect(userAns.userOrder, q.correctOrder)) {
        isCorrect = true;
      } else {
        wrongCount++;
      }
    }

    if (isCorrect) {
      correctCount++;
      totalScore += q.points;
    }

    gradedAnswers[q.id] = {
      ...userAns,
      isCorrect,
      pointsAwarded: isCorrect ? q.points : 0,
    };
  }

  totalScore = Math.round(totalScore * 10) / 10;
  const rank = getRankInfo(totalScore);

  return {
    ...session,
    answers: gradedAnswers,
    score: totalScore,
    correctCount,
    wrongCount,
    blankCount,
    rankTitle: rank.title,
    rankMessage: rank.feedback,
    status: 'da_nop',
    submittedAt: Date.now(),
  };
}

// API Service
export const api = {
  // Check student session
  async checkSession(studentId?: string, fullName?: string, studentClass?: string): Promise<StudentSession | null> {
    try {
      const q = new URLSearchParams();
      if (studentId) q.set('studentId', studentId);
      if (fullName) q.set('fullName', fullName);
      if (studentClass) q.set('studentClass', studentClass);

      const res = await fetch(`/api/session/check?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          // Sync with local
          const localList = getLocalSessions();
          const idx = localList.findIndex((s) => s.studentId === data.session.studentId);
          if (idx !== -1) localList[idx] = data.session;
          else localList.push(data.session);
          saveLocalSessions(localList);
          return data.session;
        }
      }
    } catch {
      // Offline fallback
    }

    // Fallback to local
    const local = getLocalSessions();
    return (
      local.find(
        (s) =>
          (studentId && s.studentId === studentId) ||
          (fullName && studentClass && s.fullName.toLowerCase() === fullName.toLowerCase() && s.studentClass === studentClass)
      ) || null
    );
  },

  // Start new session
  async startSession(fullName: string, studentClass: StudentClass, studentId: string): Promise<{ success: boolean; session?: StudentSession; message?: string }> {
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, studentClass, studentId }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, session: err.session, message: err.error };
      }

      const data = await res.json();
      setLocalActiveId(data.session.studentId);

      const localList = getLocalSessions();
      const idx = localList.findIndex((s) => s.studentId === data.session.studentId);
      if (idx !== -1) localList[idx] = data.session;
      else localList.push(data.session);
      saveLocalSessions(localList);

      return { success: true, session: data.session };
    } catch {
      // Local fallback
      const local = getLocalSessions();
      const existing = local.find(
        (s) =>
          s.studentId === studentId ||
          (s.fullName.toLowerCase() === fullName.toLowerCase() && s.studentClass === studentClass)
      );

      if (existing && existing.status === 'da_nop') {
        return {
          success: false,
          session: existing,
          message: 'BÀI LÀM ĐÃ ĐƯỢC GHI NHẬN. Em đã hoàn thành bài kiểm tra và không thể làm lại.',
        };
      }

      if (existing && existing.status === 'dang_lam') {
        return { success: true, session: existing };
      }

      const examCodes = ['MÃ ĐỀ 701', 'MÃ ĐỀ 702', 'MÃ ĐỀ 703', 'MÃ ĐỀ 704'];
      const chosenCode = examCodes[Math.floor(Math.random() * examCodes.length)];

      const newSess: StudentSession = {
        studentId,
        fullName,
        studentClass,
        examCode: chosenCode,
        status: 'dang_lam',
        startedAt: Date.now(),
        currentQuestionIndex: 0,
        totalTimeLimitSeconds: 1200,
        questionTimeLimitSeconds: 60,
        answers: {},
      };

      local.push(newSess);
      saveLocalSessions(local);
      setLocalActiveId(newSess.studentId);
      return { success: true, session: newSess };
    }
  },

  // Submit answer
  async submitAnswer(studentId: string, answer: StudentAnswer, nextIndex: number): Promise<boolean> {
    // Update local immediately
    const local = getLocalSessions();
    const sess = local.find((s) => s.studentId === studentId);
    if (sess) {
      sess.answers[answer.questionId] = answer;
      sess.currentQuestionIndex = nextIndex;
      saveLocalSessions(local);
    }

    try {
      await fetch('/api/session/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, answer, nextIndex }),
      });
      return true;
    } catch {
      return true;
    }
  },

  // Finalize session
  async finalizeSession(studentId: string): Promise<StudentSession> {
    try {
      const res = await fetch('/api/session/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        const data = await res.json();
        const local = getLocalSessions();
        const idx = local.findIndex((s) => s.studentId === studentId);
        if (idx !== -1) local[idx] = data.session;
        else local.push(data.session);
        saveLocalSessions(local);
        // Automatically sync to cloud webhook if configured
        pushToCloudWebhook(data.session);
        return data.session;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalSessions();
    const idx = local.findIndex((s) => s.studentId === studentId);
    if (idx !== -1) {
      const graded = localGradeSession(local[idx]);
      local[idx] = graded;
      saveLocalSessions(local);
      // Automatically sync to cloud webhook if configured
      pushToCloudWebhook(graded);
      return graded;
    }

    throw new Error('Session not found');
  },

  // Get all submissions for teacher
  async getTeacherSubmissions(): Promise<StudentSession[]> {
    try {
      const res = await fetch('/api/teacher/submissions');
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && data.sessions.length > 0) {
          saveLocalSessions(data.sessions);
          return data.sessions;
        }
      }
    } catch {
      // Fallback to local
    }
    return getLocalSessions();
  },

  // Reset student attempt
  async resetStudentAttempt(studentId: string): Promise<boolean> {
    try {
      await fetch('/api/teacher/reset-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
    } catch {
      // Fallback
    }

    let local = getLocalSessions();
    local = local.filter((s) => s.studentId !== studentId);
    saveLocalSessions(local);
    if (getLocalActiveId() === studentId) {
      setLocalActiveId(null);
    }
    return true;
  },
};
