export interface Guide {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  alt: string;
  content: string;
  date: string;
  lastUpdated: string;
  categories: string[];
  relatedGuides?: string[];
  readingTime: string;
  city: string;
  country: string;
  mapEmbedUrl?: string;
}
