// ====================
// 📘 INTERFACES
// ====================

// Each card inside a deck
export interface DeckCard {
  card_id: string;
  quantity: number;
}

// Deck metadata returned by GET /deck
export interface DeckMetadata {
  deck_id: string;
  user_id: string;
  name: string;
  card_domain_id: string;
  format: string;
  createdAt: string;
}

// API response for GET /deck (list)
export interface DeckListResponse {
  total: number;
  page: number;
  limit: number;
  decks: DeckMetadata[];
}

// API response for PUT /deck/{id}
export interface DeckUpdateResponse {
  message: string;
  metadata: DeckMetadata;
}

// API response for DELETE /deck/{id}
export interface DeckDeleteResponse {
  message: string;
}

// Data required to create or update a deck
export interface DeckPayload {
  name: string;
  card_domain_id: string;
  format: string;
  cards: DeckCard[];
}