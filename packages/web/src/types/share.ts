/**
 * Share tracking types
 */

export type SharePlatform = 'facebook' | 'whatsapp' | 'email' | 'native' | 'pinterest';

export interface ShareEvent {
  id: string;
  recipeId: string;
  platform: SharePlatform;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ShareCounts {
  recipeId: string;
  facebook: number;
  whatsapp: number;
  email: number;
  native: number;
  pinterest: number;
  total: number;
}
