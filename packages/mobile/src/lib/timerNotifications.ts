import Constants, { ExecutionEnvironment } from 'expo-constants';

// Expo Go (the preview app) no longer supports expo-notifications on Android, so only load it
// in real builds. In Expo Go the on-screen kitchen timer still rings; it just can't notify in the background.
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
type NotificationsModule = typeof import('expo-notifications');
let mod: NotificationsModule | null = null;
let asked = false;

function notifications(): NotificationsModule | null {
  if (inExpoGo) return null;
  if (!mod) {
    mod = require('expo-notifications') as NotificationsModule;
    // While the app is open the timer rings on screen, so don't also show a banner.
    mod.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
  }
  return mod;
}

/** Schedule a "time's up" notification so the timer still rings if the phone is locked or you switch apps. */
export async function scheduleTimerDone(label: string, recipeTitle: string, endsAt: number): Promise<string | null> {
  const N = notifications();
  if (!N) return null;
  try {
    if (!asked) {
      asked = true;
      const { status } = await N.getPermissionsAsync();
      if (status !== 'granted') await N.requestPermissionsAsync();
    }
    const seconds = Math.max(1, Math.round((endsAt - Date.now()) / 1000));
    return await N.scheduleNotificationAsync({
      content: { title: "Time's up!", body: `Your ${label} timer for ${recipeTitle} is done. Go check it.`, sound: true },
      trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
    });
  } catch {
    return null; // No permission: the on-screen timer still works.
  }
}

export function cancelTimerDone(id: string | null) {
  if (id) notifications()?.cancelScheduledNotificationAsync(id).catch(() => {});
}
