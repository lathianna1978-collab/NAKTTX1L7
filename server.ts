import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MASTER_QUESTIONS, isFillBlankCorrect, isMatchingCorrect, isOrderingCorrect, getRankInfo, getCustomShuffledQuestions } from './src/data/questions.ts';
import { StudentSession, StudentAnswer, StudentClass, Question } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'submissions.json');

// Ensure data folder and file exists
function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readSessions(): StudentSession[] {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as StudentSession[];
  } catch (err) {
    console.error('Error reading submissions DB:', err);
    return [];
  }
}

function writeSessions(sessions: StudentSession[]) {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

// Generate sanitized questions for student (hide correct options/keys during test)
function getSanitizedQuestions(seed: number = 701): Question[] {
  return MASTER_QUESTIONS.map((q) => {
    // Clone without correctOption, correctMatching, correctOrder, acceptedAnswers
    const sanitized: Question = {
      id: q.id,
      stage: q.stage,
      type: q.type,
      level: q.level,
      lesson: q.lesson,
      questionText: q.questionText,
      points: q.points,
      explanation: '', // Hidden until completed
    };

    if (q.type === 'multiple_choice' && q.options) {
      sanitized.options = [...q.options];
    } else if (q.type === 'matching') {
      sanitized.columnA = q.columnA ? [...q.columnA] : [];
      sanitized.columnB = q.columnB ? [...q.columnB] : [];
    } else if (q.type === 'ordering' && q.orderItems) {
      const shuffled = [...q.orderItems];
      if (seed % 2 === 0) {
        shuffled.reverse();
      }
      sanitized.orderItems = shuffled;
    }
    return sanitized;
  });
}

// Grade session strictly on server according to the student's exam code
function gradeSession(session: StudentSession): StudentSession {
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

  // Round score to 1 decimal place
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

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Check existing session
  app.get('/api/session/check', (req, res) => {
    const { studentId, fullName, studentClass } = req.query as {
      studentId?: string;
      fullName?: string;
      studentClass?: string;
    };

    const sessions = readSessions();
    const existing = sessions.find(
      (s) =>
        (studentId && s.studentId === studentId) ||
        (fullName && studentClass && s.fullName.toLowerCase() === fullName.toLowerCase() && s.studentClass === studentClass)
    );

    if (existing) {
      // Check if expired while 'dang_lam'
      if (existing.status === 'dang_lam') {
        const elapsed = (Date.now() - existing.startedAt) / 1000;
        if (elapsed > existing.totalTimeLimitSeconds) {
          // Auto finalize
          const finalized = gradeSession(existing);
          const idx = sessions.findIndex((s) => s.studentId === existing.studentId);
          if (idx !== -1) sessions[idx] = finalized;
          writeSessions(sessions);
          return res.json({ session: finalized });
        }
      }
      return res.json({ session: existing });
    }

    res.json({ session: null });
  });

  // Start new session
  app.post('/api/session/start', (req, res) => {
    const { fullName, studentClass, studentId } = req.body as {
      fullName: string;
      studentClass: StudentClass;
      studentId: string;
    };

    if (!fullName || !studentClass || !studentId) {
      return res.status(400).json({ error: 'Thiếu thông tin học sinh' });
    }

    const sessions = readSessions();
    const existing = sessions.find(
      (s) =>
        s.studentId === studentId ||
        (s.fullName.toLowerCase() === fullName.toLowerCase() && s.studentClass === studentClass)
    );

    // ANTI-RETAKE: If already submitted, permanently lock!
    if (existing && existing.status === 'da_nop') {
      return res.status(403).json({
        error: 'BÀI LÀM ĐÃ ĐƯỢC GHI NHẬN. Em đã hoàn thành bài kiểm tra và không thể làm lại.',
        session: existing,
      });
    }

    // If currently in-progress, resume
    if (existing && existing.status === 'dang_lam') {
      const elapsed = (Date.now() - existing.startedAt) / 1000;
      if (elapsed > existing.totalTimeLimitSeconds) {
        const finalized = gradeSession(existing);
        const idx = sessions.findIndex((s) => s.studentId === existing.studentId);
        if (idx !== -1) sessions[idx] = finalized;
        writeSessions(sessions);
        return res.json({ session: finalized });
      }
      return res.json({ session: existing });
    }

    // Generate random exam code: MÃ ĐỀ 701 to 708
    const examCodes = ['MÃ ĐỀ 701', 'MÃ ĐỀ 702', 'MÃ ĐỀ 703', 'MÃ ĐỀ 704', 'MÃ ĐỀ 705'];
    const chosenCode = examCodes[Math.floor(Math.random() * examCodes.length)];

    const newSession: StudentSession = {
      studentId,
      fullName,
      studentClass,
      examCode: chosenCode,
      status: 'dang_lam',
      startedAt: Date.now(),
      currentQuestionIndex: 0,
      totalTimeLimitSeconds: 1200, // 20 minutes
      questionTimeLimitSeconds: 60, // 60 seconds
      answers: {},
    };

    sessions.push(newSession);
    writeSessions(sessions);

    res.json({ session: newSession });
  });

  // Submit single answer
  app.post('/api/session/submit-answer', (req, res) => {
    const { studentId, answer, nextIndex } = req.body as {
      studentId: string;
      answer: StudentAnswer;
      nextIndex: number;
    };

    const sessions = readSessions();
    const session = sessions.find((s) => s.studentId === studentId);

    if (!session) {
      return res.status(404).json({ error: 'Không tìm thấy phiên làm bài' });
    }

    if (session.status === 'da_nop') {
      return res.status(403).json({ error: 'Bài làm đã bị khóa và nộp' });
    }

    // Record answer
    session.answers[answer.questionId] = answer;
    session.currentQuestionIndex = nextIndex;

    writeSessions(sessions);
    res.json({ success: true, currentQuestionIndex: session.currentQuestionIndex });
  });

  // Finalize & submit test
  app.post('/api/session/finalize', (req, res) => {
    const { studentId } = req.body as { studentId: string };

    const sessions = readSessions();
    const idx = sessions.findIndex((s) => s.studentId === studentId);

    if (idx === -1) {
      return res.status(404).json({ error: 'Không tìm thấy phiên làm bài' });
    }

    const session = sessions[idx];
    if (session.status === 'da_nop') {
      return res.json({ session });
    }

    const finalized = gradeSession(session);
    sessions[idx] = finalized;
    writeSessions(sessions);

    res.json({ session: finalized });
  });

  // Teacher API: Get all submissions
  app.get('/api/teacher/submissions', (_req, res) => {
    const sessions = readSessions();
    res.json({ sessions });
  });

  // Teacher API: Reset student attempt
  app.post('/api/teacher/reset-student', (req, res) => {
    const { studentId } = req.body as { studentId: string };
    let sessions = readSessions();
    const target = sessions.find((s) => s.studentId === studentId);

    if (!target) {
      return res.status(404).json({ error: 'Không tìm thấy học sinh' });
    }

    sessions = sessions.filter((s) => s.studentId !== studentId);
    writeSessions(sessions);

    res.json({ success: true, message: `Đã hủy lượt làm bài cho học sinh ${target.fullName}` });
  });

  // In production, serve static dist; in dev, use Vite middleware
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProd && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
