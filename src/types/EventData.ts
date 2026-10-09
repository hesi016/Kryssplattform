export interface EventData {
  title: string;
  description: string;
  id: string;
  creator: string;
  creatorName?: string;
  favorites?: string[];
  images?: string[];
  comments: string[];
  address?: string | null;
  category?: string | null;
  location?: { latitude: number; longitude: number } | null;
  tasks?: string[];
  participants?: string[];
  maxParticipants?: number | null;

  date?: string | null;
  time?: string | null;

  createdAt?: number;
}
