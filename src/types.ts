export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  type?: 'single' | 'multiple';
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  hint?: string;
}

export interface TheorySection {
  title: string;
  content?: string; // Markdown or rich text
  table?: {
    headers: string[];
    rows: string[][];
  };
  keyTakeaway?: string;
  egeTrap?: string; // "Ловушка ЕГЭ"
}

export interface TopicData {
  id: number;
  sectionId: number;
  title: string;
  subtitle: string;
  iconName: string;
  estimatedMinutes: number;
  theory: TheorySection[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  keyTerms: string[];
}

export interface SectionData {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  icon: string;
  topicIds: number[];
  bossExam: {
    title: string;
    description: string;
    questions: QuizQuestion[];
  };
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  unlockedLevels: number[]; // topic IDs
  completedLevels: Record<number, { stars: number; bestScore: number; completedAt: string }>;
  masteredFlashcards: string[]; // flashcard IDs
  unlockedAchievements: string[]; // achievement IDs
  bossesDefeated: number[]; // section IDs
  freePlayMode: boolean; // unlock all levels toggle
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'streak' | 'exam';
  unlockedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  sectionId: number;
  topicId: number;
  importance: 'high' | 'medium';
}
