import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { StudentSession } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Connect to the specific firestoreDatabaseId if configured
export const db: Firestore = (firebaseConfigData as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfigData as any).firestoreDatabaseId)
  : getFirestore(app);

// Test connection on startup as recommended by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is running in offline cache mode.');
    }
  }
}

// Convert Firestore document data to clean StudentSession
function sanitizeSession(id: string, data: any): StudentSession {
  return {
    studentId: data.studentId || id,
    fullName: data.fullName || '',
    studentClass: data.studentClass || '7A10',
    examCode: data.examCode || 'MÃ ĐỀ 701',
    status: data.status || 'da_nop',
    startedAt: Number(data.startedAt) || Date.now(),
    submittedAt: Number(data.submittedAt) || Date.now(),
    score: typeof data.score === 'number' ? data.score : undefined,
    correctCount: typeof data.correctCount === 'number' ? data.correctCount : 0,
    wrongCount: typeof data.wrongCount === 'number' ? data.wrongCount : 0,
    blankCount: typeof data.blankCount === 'number' ? data.blankCount : 0,
    rankTitle: data.rankTitle || '',
    rankMessage: data.rankMessage || '',
    totalTimeLimitSeconds: data.totalTimeLimitSeconds || 1200,
    questionTimeLimitSeconds: data.questionTimeLimitSeconds || 60,
    currentQuestionIndex: data.currentQuestionIndex || 20,
    answers: data.answers || {},
  };
}

// Save or update student session in Firestore
export async function saveSubmissionToFirestore(session: StudentSession): Promise<boolean> {
  try {
    const docId = session.studentId || `TH-${session.studentClass}-${session.fullName.replace(/\s+/g, '_')}`;
    const docRef = doc(db, 'submissions', docId);

    // Prepare clean serializable data
    const payload = {
      studentId: docId,
      fullName: session.fullName,
      studentClass: session.studentClass,
      examCode: session.examCode,
      status: session.status,
      startedAt: session.startedAt,
      submittedAt: session.submittedAt || Date.now(),
      score: session.score ?? null,
      correctCount: session.correctCount ?? 0,
      wrongCount: session.wrongCount ?? 0,
      blankCount: session.blankCount ?? 0,
      rankTitle: session.rankTitle ?? '',
      rankMessage: session.rankMessage ?? '',
      totalTimeLimitSeconds: session.totalTimeLimitSeconds ?? 1200,
      questionTimeLimitSeconds: session.questionTimeLimitSeconds ?? 60,
      currentQuestionIndex: session.currentQuestionIndex ?? 0,
      answers: session.answers ?? {},
      updatedAt: Date.now(),
    };

    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore saveSubmission error:', err);
    return false;
  }
}

// Fetch all submissions from Firestore
export async function getAllSubmissionsFromFirestore(): Promise<StudentSession[]> {
  try {
    const collRef = collection(db, 'submissions');
    const snapshot = await getDocs(collRef);
    const results: StudentSession[] = [];
    snapshot.forEach((d) => {
      results.push(sanitizeSession(d.id, d.data()));
    });
    return results;
  } catch (err) {
    console.error('Firestore getAllSubmissions error:', err);
    return [];
  }
}

// Subscribe to real-time changes across all student devices & Netlify
export function subscribeToSubmissions(
  onUpdate: (sessions: StudentSession[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const collRef = collection(db, 'submissions');
    const q = query(collRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: StudentSession[] = [];
        snapshot.forEach((d) => {
          list.push(sanitizeSession(d.id, d.data()));
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore snapshot listener notice:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Firestore subscribe error:', err);
    return () => {};
  }
}
