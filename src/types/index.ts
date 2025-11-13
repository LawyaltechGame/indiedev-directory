export interface Studio {
  id: number;
  name: string;
  tagline: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  hue: number;
  tools?: string[];
  revenue?: string;
  foundedYear?: string;
  tags?: string[];
}

export interface FormData {
  name: string;
  tagline: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  description: string;
  website: string;
  email: string;
  authEmail?: string;  // User's authentication email
  tools?: string[];
  revenue?: string;
  foundedYear?: string;
  tags?: string[];
}

export type ProfileStep = 'create' | 'review' | 'list';
