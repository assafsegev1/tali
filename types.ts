
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  OPEN_ENDED = 'OPEN_ENDED'
}

export interface BaseQuestion {
  id: string;
  year: number;
  questionText: string;
  type: QuestionType;
  topic: string; // e.g., "תא", "אקולוגיה", "גוף האדם"
  relatedConcepts: string[]; // List of key concepts for summary
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface OpenEndedQuestion extends BaseQuestion {
  type: QuestionType.OPEN_ENDED;
  officialAnswer: string; // The rubric answer
  subQuestions?: string[]; // Sometimes open questions have parts
}

export type Question = MultipleChoiceQuestion | OpenEndedQuestion;

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: Record<string, any>; // Store user answers
  isFinished: boolean;
}
