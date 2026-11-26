import type { LinkingOptions } from '@react-navigation/native';

/**
 * Links that open the app: the site's own recipe and guide URLs (universal links on iOS,
 * verified app links on Android), plus cheapquickvegan:// for testing. The paths match the
 * website exactly, so a shared link works whether or not the app is installed.
 *
 * Category pages (/recipes/category/side) have no screen here; they don't match a pattern
 * and open the app on Discover.
 */
export const linking: LinkingOptions<object> = {
  prefixes: ['https://www.cheapquickvegan.com', 'cheapquickvegan://'],
  config: {
    screens: {
      Tabs: {
        screens: {
          DiscoverTab: {
            // Back from a linked recipe goes to Discover, not out of the app.
            initialRouteName: 'Discover',
            screens: {
              Discover: '',
              Recipe: 'recipes/:slug',
              Guide: 'guides/:slug',
            },
          },
        },
      },
    },
  },
};
