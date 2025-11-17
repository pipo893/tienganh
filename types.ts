
export interface VocabularyInfo {
  word: string;
  definition: string;
  examples: string[];
  synonyms: string[];
}

export interface GrammarError {
  error: string;
  explanation: string;
}

export interface GrammarCorrection {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
