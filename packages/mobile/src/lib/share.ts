import { Platform, Share } from 'react-native';
import type { Recipe } from './recipes';
import { displayTitle } from './recipes';

/** Opens the phone's share sheet with the recipe's canonical page on the website (no query parameters). */
export function shareRecipe(r: Recipe) {
  const url = `https://www.cheapquickvegan.com/recipes/${r.slug}`;
  const title = displayTitle(r);
  const line = `${title}, ${r.totalText ?? 'quick'} and vegan`;
  // iOS attaches the url itself (with a link preview); Android only shares the message text.
  const content = Platform.OS === 'ios' ? { title, message: line, url } : { title, message: `${line}: ${url}` };
  return Share.share(content, { dialogTitle: `Share ${title}` }).catch(() => {});
}
