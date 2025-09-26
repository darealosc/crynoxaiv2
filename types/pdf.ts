export interface PDFProcessingRequest {
  pdf: File;
  question: string;
}

export interface PDFProcessingResponse {
  answer?: string;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  type?: "chat" | "flashcards" | "pdf";
}

export interface Chat {
  id: number;
  history: ChatMessage[];
}

export interface FlashCard {
  question: string;
  answer: string;
}