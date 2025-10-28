export interface Studio {
  id: number;
  name: string;
  tagline: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  hue: number;
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
}

export type ProfileStep = 'create' | 'review' | 'list';
