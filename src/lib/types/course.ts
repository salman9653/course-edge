export interface FlashcardData {
  front: string;
  back: string;
}

export interface SlideData {
  title: string;
  body: string;
}

export interface QuizMetadata {
  type: 'small' | 'major';
  question_count: number;
  context_summary: string;
}

export interface ModuleData {
  title: string;
  type: 'video' | 'infographics' | 'quiz' | 'flashcard' | 'slideDeck';
  description: string;
  order_index: number;
  created_at: string;
  updated_at?: string;
  content?: string;
  search_query?: string;
  youtube_links?: string[];
  quiz_metadata?: QuizMetadata;
  flashcard_data?: FlashcardData[];
  slides?: SlideData[];
}
