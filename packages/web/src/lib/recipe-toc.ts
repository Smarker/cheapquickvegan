import { generateTOC } from "@/lib/guide-parser";

/**
 * Generate table of contents for recipe pages
 * Adds icons to sections and filters out non-useful sections
 */

export function generateRecipeTOC(content: string | undefined, hasRelatedRecipes: boolean) {
  const sections = content ? generateTOC(content) : [];
  // Filter out Recipe Details and h3 subsections (too busy)
  const filteredSections = sections.filter(section =>
    section.title !== 'Recipe Details' && section.level !== 3
  );

  // Add icons to sections
  const processedSections = filteredSections.map(section => {
    if (section.title === 'Instructions') {
      return { ...section, title: 'Jump to Recipe', icon: '👇' };
    }
    if (section.title === 'Ingredients') {
      return { ...section, icon: '🥕' };
    }
    if (section.title === 'Tips') {
      return { ...section, icon: '💡' };
    }
    // Match various FAQ section titles
    if (section.title.toLowerCase().includes('faq')) {
      return { ...section, icon: '❓' };
    }
    // Match "What is/are" sections
    if (section.title.toLowerCase().startsWith('what is') || section.title.toLowerCase().startsWith('what are')) {
      return { ...section, icon: '📚' };
    }
    return section;
  });

  // Add Reviews section to ToC (rendered outside markdown)
  processedSections.push({ id: 'reviews', title: 'Reviews', level: 2, icon: '⭐' });
  // Add Related Recipes to ToC if they exist
  if (hasRelatedRecipes) {
    processedSections.push({ id: 'related-recipes', title: 'Related Recipes', level: 2, icon: '📖' });
  }
  const showTOC = processedSections.length >= 5; // Only show ToC if there are 5+ sections
  return { sections: processedSections, showTOC };
}
