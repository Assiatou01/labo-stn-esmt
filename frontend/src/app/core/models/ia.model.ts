export interface SourceCitation {
  documentId: number;
  documentTitre: string;
  auteur?: string;
  theseId?: number;
  page?: number;
  scorePertinence: number;
  extrait: string;
}

export interface SummaryResponse {
  livrableId: number;
  titreDocument?: string;
  resume: string;
  pointsCles: string[];
  motsCles: string[];
  generatedAt: string;
}

export interface RagChatRequest {
  question: string;
  theseIdContext?: number;
  topContextDocs?: number;
}

export interface RagChatResponse {
  question: string;
  answer: string;
  modelUsed?: string;
  responseTimeMs?: string;
  tempsReponseMs?: number;
  sources: SourceCitation[];
  generatedAt?: string;
}

export interface ChatMessage {
  id: string;
  expediteur: 'user' | 'ia';
  texte: string;
  date: Date;
  sources?: SourceCitation[];
  isTyping?: boolean;
}

export interface SemanticSearchRequest {
  query: string;
  topK?: number;
  theseId?: number;
}

export interface SearchResultItem {
  livrableId: number;
  titre: string;
  score: number;
  extrait: string;
  theseId?: number;
  typeLivrable: string;
}

export interface SemanticSearchResponse {
  query: string;
  totalHits: number;
  results: SearchResultItem[];
}

export interface SummaryRequest {
  livrableId: number;
  maxLengthWords?: number;
}
