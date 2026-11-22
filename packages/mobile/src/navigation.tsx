import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSaved } from './lib/saved';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiscoverIcon, SavedIcon, SearchIcon } from './components/Icons';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { GuideScreen } from './screens/GuideScreen';
import { JourneyScreen } from './screens/JourneyScreen';
import { CookScreen } from './screens/CookScreen';
import { RecipeScreen } from './screens/RecipeScreen';
import { SavedScreen } from './screens/SavedScreen';
import { font, spring, type as t, usePalette } from './theme/tokens';

export type DiscoverStack = {
  Discover: undefined;
  Recipe: { slug: string };
  Cook: { slug: string };
  Journey: { id: string };
  Guide: { slug: string };
};
export type SavedStack = { Saved: undefined; Recipe: { slug: string }; Cook: { slug: string } };

const Stack = createNativeStackNavigator<DiscoverStack>();
const SavedNav = createNativeStackNavigator<SavedStack>();

function useStackOptions() {
  const p = usePalette();
  return {
    headerTintColor: p.ink,
    headerStyle: { backgroundColor: p.ground },
    headerShadowVisible: false,
    headerTitleStyle: { fontFamily: font.sansBold },
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: p.ground },
  };
}
const Tabs = createBottomTabNavigator();

function DiscoverTab() {
  return (
    <Stack.Navigator screenOptions={useStackOptions()}>
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Recipe" component={RecipeScreen} options={{ title: '' }} />
      <Stack.Screen name="Journey" component={JourneyScreen} options={{ title: '' }} />
      <Stack.Screen name="Guide" component={GuideScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function SavedTab() {
  return (
    <SavedNav.Navigator screenOptions={useStackOptions()}>
      <SavedNav.Screen name="Saved" component={SavedScreen} options={{ headerShown: false }} />
      <SavedNav.Screen name="Recipe" component={RecipeScreen} options={{ title: '' }} />
    </SavedNav.Navigator>
  );
}

const ICONS = { DiscoverTab: DiscoverIcon, SearchTab: SearchIcon, SavedTab: SavedIcon } as const;

/** Docked bar on both OSes; the active tab gets a soft basil pill, like Material's indicator. */
function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: p.ground, borderTopColor: p.hairline }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const label = descriptors[route.key].options.title ?? route.name;
        const Icon = ICONS[route.name as keyof typeof ICONS];
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) {
                if (Platform.OS === 'ios') Haptics.selectionAsync();
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <View style={[styles.pill, { backgroundColor: focused ? p.greenSoft : 'transparent' }]}>
              {route.name === 'SavedTab' ? (
                <BouncyIcon>
                  <Icon color={focused ? p.green : p.muted} />
                </BouncyIcon>
              ) : (
                <Icon color={focused ? p.green : p.muted} />
              )}
            </View>
            <Text style={[t.label, { fontSize: 12, color: focused ? p.ink : p.muted }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The Saved tab icon hops whenever a recipe is saved, so you can see where it went. */
function BouncyIcon({ children }: { children: React.ReactNode }) {
  const { bounceTick } = useSaved();
  const reduce = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (bounceTick === 0 || reduce) return;
    y.value = withSequence(withSpring(-7, spring), withSpring(0, spring));
  }, [bounceTick, reduce, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function Tabbed() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="DiscoverTab" component={DiscoverTab} options={{ title: 'Discover' }} />
      <Tabs.Screen name="SearchTab" options={{ title: 'Search' }}>
        {() => <ComingSoonScreen title="Search" doodle="pot" line={'Search is still simmering.\nFor now, the time and equipment filters on Discover will get you there.'} />}
      </Tabs.Screen>
      <Tabs.Screen name="SavedTab" component={SavedTab} options={{ title: 'Saved' }} />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52 },
  pill: { width: 60, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

type RootStack = { Tabs: undefined; Cook: { slug: string } };
const Root = createNativeStackNavigator<RootStack>();

/** Cook mode sits above the tabs so it takes the whole screen; Recipe screens in either tab open it. */
export function RootTabs() {
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="Tabs" component={Tabbed} />
      <Root.Screen name="Cook" component={CookScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
    </Root.Navigator>
  );
}
