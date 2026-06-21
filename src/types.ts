export type ScreenState = 'garden' | 'miss-you' | 'cramps' | 'comfort' | 'lonely' | 'distraction' | 'scrapbook';

export interface StarThought {
  id: string;
  left: number; // percentage (15 to 85)
  bottom: number; // percentage (10 to 70)
  driftX: number; // px movement
  driftY: number; // px movement
  delay: number; // seconds
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
}

export interface ReassuranceQuote {
  id: string;
  quote: string;
}

export interface MemoryCard {
  id: number;
  symbol: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
  imageUrl?: string;
}
