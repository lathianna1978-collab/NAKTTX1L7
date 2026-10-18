export type StudentClass = '7A10' | '7A11' | '7A12' | '7A13' | '7A14';

export const VALID_CLASSES: StudentClass[] = ['7A10', '7A11', '7A12', '7A13', '7A14'];

export type QuestionType = 'multiple_choice' | 'fill_in_blank' | 'matching' | 'ordering';

export type StageNumber = 1 | 2 | 3;

export interface MultipleChoiceOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface MatchingPair {
  id: string; // '1', '2', '3', '4'
  text: string;
}

export interface MatchingTarget {
  id: string; // 'a', 'b', 'c', 'd'
  text: string;
}

export interface OrderItem {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: number;
  stage: StageNumber;
  type: QuestionType;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
  lesson: string;
  questionText: string;
  points: number; // 0.5
  // For multiple_choice
  options?: MultipleChoiceOption[];
  correctOption?: string; // e.g. 'B'
  // For fill_in_blank
  acceptedAnswers?: string[]; // e.g. ['văn hóa', 'van hoa']
  // For matching
  columnA?: MatchingPair[];
  columnB?: MatchingTarget[];
  correctMatching?: Record<string, string>; // e.g. {'1': 'c', '2': 'a', '3': 'b', '4': 'd'}
  // For ordering
  orderItems?: OrderItem[];
  correctOrder?: string[]; // e.g. ['B', 'A', 'C', 'D']
  explanation: string;
}

// Student response state
export interface StudentAnswer {
  questionId: number;
  type: QuestionType;
  userMultipleChoice?: string;
  userFillBlank?: string;
  userMatching?: Record<string, string>;
  userOrder?: string[];
  isCorrect?: boolean;
  pointsAwarded?: number;
  timeSpentSeconds?: number;
  isSkippedOrTimeout?: boolean;
}

export type ExamStatus = 'chua_lam' | 'dang_lam' | 'da_nop';

export interface StudentSession {
  studentId: string;
  fullName: string;
  studentClass: StudentClass;
  examCode: string; // e.g., 'MÃ ĐỀ 701'
  status: ExamStatus;
  startedAt: number; // timestamp in ms
  submittedAt?: number; // timestamp in ms
  currentQuestionIndex: number; // 0 to 19
  totalTimeLimitSeconds: number; // 1200 (20 minutes)
  questionTimeLimitSeconds: number; // 60 seconds
  answers: Record<number, StudentAnswer>;
  score?: number; // 0.0 to 10.0
  correctCount?: number;
  wrongCount?: number;
  blankCount?: number;
  rankTitle?: string;
  rankMessage?: string;
  clientIp?: string;
}

export interface RankInfo {
  tier: number;
  title: string;
  feedback: string;
  badgeColor: string;
  textColor: string;
  icon: string;
}
