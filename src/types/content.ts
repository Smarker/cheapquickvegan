/**
 * Shared content types used across guides and recipes
 */

export interface ContentSection {
  id: string;
  title: string;
  level: number;
  icon?: string; // Optional icon name for lucide-react
}
