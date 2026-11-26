import { Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold } from '@expo-google-fonts/rubik';
import { GochiHand_400Regular } from '@expo-google-fonts/gochi-hand';
import { SourceSerif4_300Light, SourceSerif4_700Bold, useFonts } from '@expo-google-fonts/source-serif-4';
import { StirringPot } from './src/components/Doodles';
import { DataProvider } from './src/lib/data';
import { GroceryProvider } from './src/lib/grocery';
import { SavedProvider } from './src/lib/saved';
import { PrefsProvider } from './src/lib/prefs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { linking } from './src/linking';
import { JournalProvider } from './src/lib/journal';
import { PlannerProvider } from './src/lib/plannerStore';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootTabs } from './src/navigation';
import { usePalette } from './src/theme/tokens';

export default function App() {
  const [loaded] = useFonts({ GochiHand_400Regular, SourceSerif4_300Light, SourceSerif4_700Bold, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold });
  const scheme = useColorScheme();
  const p = usePalette();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  if (!loaded)
    return (
      <View style={{ flex: 1, backgroundColor: p.ground, alignItems: 'center', justifyContent: 'center' }}>
        <StirringPot color={p.ink} />
      </View>
    );

  return (
    <SafeAreaProvider>
      <DataProvider>
      <SavedProvider>
      <GroceryProvider>
      <PrefsProvider>
      <JournalProvider>
      <PlannerProvider>
      <NavigationContainer linking={linking} theme={{ ...base, colors: { ...base.colors, background: p.ground, card: p.ground, text: p.ink, primary: p.ink } }}>
        <RootTabs />
      </NavigationContainer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </PlannerProvider>
      </JournalProvider>
      </PrefsProvider>
      </GroceryProvider>
      </SavedProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}
