export enum QuestionType {
  SINGLE = 1,
  MULTI = 2,
  JUDGE = 3,
}

export interface OptionDTO {
  label: string;
  content: string;
  sortOrder?: number;
}

export interface CreateQuestionDTO {
  type: QuestionType;
  chapterId: number;
  content: string;
  answer: string;
  analysis?: string;
  difficulty?: number;
  options?: OptionDTO[];
  sortOrder?: number;
}

export interface UpdateQuestionDTO extends Partial<CreateQuestionDTO> {}

export interface ImportQuestionDTO {
  type: QuestionType;
  content: string;
  answer: string;
  analysis?: string;
  difficulty?: number;
  options: OptionDTO[];
}

export interface ImportError {
  lineNumber: number;
  type: 'error' | 'warning';
  message: string;
  rawContent?: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: ImportError[];
}
