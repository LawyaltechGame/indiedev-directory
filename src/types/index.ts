export interface Studio {
  id: number;
  name: string;
  tagline: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  hue: number;
  profileImageId?: string | null; // Studio profile photo from Appwrite Storage
  tools?: string[];
  revenue?: string;
  foundedYear?: string;
  tags?: string[];
}

// Project/Portfolio item
export interface Project {
  gameTitle: string;
  projectStatus: 'Released' | 'In Development' | 'Announced';
  platforms: string[];
  projectPageUrl: string;
  shortDescription?: string;
}

// Recognition/Award item
export interface Recognition {
  recognitionType: 'Award' | 'Nomination' | 'Press Mention' | 'Event Feature';
  title: string;
  year: string;
  description?: string;
  source?: string;
}

// Social links
export interface SocialLinks {
  twitter?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  discord?: string;
  linkedin?: string;
}

export interface FormData {
  // Existing fields (KEEP AS IS)
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
  
  // Basic Studio Details
  studioType?: 'Indie' | 'AA' | 'AAA' | 'Publisher-owned';
  headquartersCountry?: string;
  city?: string;
  languagesSupported?: string[];
  regionsServed?: string[];
  
  // Ownership & Identity
  founders?: string[]; // Repeatable
  parentCompany?: string;
  acquisitionStatus?: 'Independent' | 'Acquired';
  acquiredBy?: string;
  
  // Team & Capabilities
  targetAudience?: 'Casual' | 'Core' | 'Hardcore';
  primaryExpertise?: string[]; // Multi-select
  gameEngines?: string[]; // Multi-select
  
  // Platforms & Technology
  supportedPlatforms?: string[]; // Multi-select
  deploymentType?: 'Digital' | 'Console' | 'PC';
  
  // Projects / Portfolio (Repeatable)
  projects?: Project[];
  
  // Business & Collaboration
  lookingFor?: ('Publishing' | 'Co-development' | 'Hiring' | 'Outsourcing' | 'None')[];
  openToPublishingDeals?: boolean;
  publisherPartners?: string;
  fundingType?: 'Bootstrapped' | 'VC' | 'Publisher-funded' | 'Acquired';
  latestFundingRound?: string;
  totalFunding?: string;
  
  // Distribution & Stores
  distributionChannels?: string[]; // Multi-select
  storeLinks?: string[]; // Repeatable URLs
  
  // Contact & Community
  publicContactEmail?: string;
  socialLinks?: SocialLinks;
  
  // Recognition & Press (Repeatable)
  recognitions?: Recognition[];
  
  // Media (NO PHOTOS)
  trailerVideoUrl?: string;
  gameplayVideoUrl?: string;
}

export type ProfileStep = 'create' | 'review' | 'list';
