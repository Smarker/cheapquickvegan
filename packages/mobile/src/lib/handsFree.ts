import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { isEcho, parseCommand, type VoiceCommand } from './voice';

// Commands short enough to act on from a partial transcript, before the recogniser decides you've
// finished. "How much…" and "set a timer for…" wait for the end so they aren't cut off early.
/** Hands-free switches itself off after this long with nothing said, to save battery and the mic. */
const IDLE_MS = 10 * 60 * 1000;

/** What to tell the cook when the speech service can't carry on. Null: a normal pause, just listen again. */
function problemFor(code: string): string | null {
  switch (code) {
    case 'not-allowed':
      return 'Microphone access is off. Turn it on in Settings to use hands-free.';
    case 'network':
      return 'Voice needs an internet connection on this phone.';
    case 'language-not-supported':
      return "Voice isn't available in English on this phone.";
    case 'service-not-allowed':
      return "This phone's speech service is turned off, so hands-free can't listen.";
    case 'audio-capture':
    case 'busy':
      return 'The microphone is busy right now (a call or another app?).';
    default:
      return null; // no-speech, speech-timeout, aborted: the 'end' handler listens again
  }
}

const QUICK = new Set<VoiceCommand['type']>(['next', 'back', 'repeat', 'stopTimer', 'timeLeft', 'finish', 'stopListening', 'ingredients']);

// Speech recognition is native code that Expo Go doesn't include, so it only loads in real builds.
// In Expo Go the hands-free switch simply doesn't appear.
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
type Recognition = typeof import('expo-speech-recognition');
type Speech = typeof import('expo-speech');
let rec: Recognition | null = null;
let speech: Speech | null = null;

function modules(): { rec: Recognition; speech: Speech } | null {
  if (inExpoGo) return null;
  try {
    rec ??= require('expo-speech-recognition') as Recognition;
    speech ??= require('expo-speech') as Speech;
    return rec.ExpoSpeechRecognitionModule.isRecognitionAvailable() ? { rec, speech } : null;
  } catch {
    return null;
  }
}

export const handsFreeAvailable = () => modules() != null;

type Options = {
  onCommand: (cmd: VoiceCommand) => void;
  /** What the cook says that isn't a command (shown briefly, so they know they were heard). */
  onUnknown?: (said: string) => void;
  /** Hands-free had to stop, and why, in plain words. */
  onProblem?: (message: string) => void;
};

/**
 * Hands-free cook mode: listens while switched on, turns each phrase into a command, and can talk back.
 * The mic stays on while the app is talking, so the cook can cut in ("next", "stop the timer") without
 * waiting for it to finish; anything that's only the app's own words coming back is ignored.
 */
export function useHandsFree({ onCommand, onUnknown, onProblem }: Options) {
  const [on, setOn] = useState(false);
  const [listening, setListening] = useState(false);
  const onRef = useRef(false);
  const speaking = useRef(false);
  const spokenText = useRef(''); // what the app is saying right now, to tell its echo from the cook
  const active = useRef(false); // the recogniser is running (never start it twice)
  const utterance = useRef(0);
  const acted = useRef(false); // already acted on this phrase from a partial result
  const paused = useRef(false); // app in the background: mic off until it's back
  const lastHeard = useRef(Date.now());
  const handlers = useRef({ onCommand, onUnknown, onProblem });
  handlers.current = { onCommand, onUnknown, onProblem };

  const listen = useCallback(() => {
    const m = modules();
    if (!m || !onRef.current || paused.current || active.current) return;
    const R = m.rec.ExpoSpeechRecognitionModule;
    acted.current = false;
    active.current = true;
    R.start({
      lang: 'en-US',
      interimResults: true,
      // One phrase at a time (we restart right after each). Continuous mode on Android runs only on the
      // on-device recogniser, which returns nothing when the phone hasn't downloaded the language pack.
      continuous: false,
      maxAlternatives: 1,
      // No requiresOnDeviceRecognition: phones can report support without having the language pack,
      // and then return empty results. Google's service already goes on-device when the pack is there.
      // iPhone: record and play on one session, replies through the loudspeaker (not the earpiece).
      iosCategory: { category: 'playAndRecord', categoryOptions: ['defaultToSpeaker', 'allowBluetooth'], mode: 'default' },
      // Decide a phrase is over after a short pause rather than the default couple of seconds.
      androidIntentOptions: { EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 700, EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 500 },
    });
  }, []);

  useEffect(() => {
    const m = modules();
    if (!m) return;
    const R = m.rec.ExpoSpeechRecognitionModule;
    const subs = [
      R.addListener('start', () => setListening(true)),
      // Recognisers stop after each phrase; start again straight away, even while the app is talking.
      R.addListener('end', () => {
        active.current = false;
        setListening(false);
        if (onRef.current && !paused.current) listen();
      }),
      R.addListener('error', (e) => {
        active.current = false; // some errors arrive without an 'end'
        const problem = problemFor(e.error);
        if (!problem) return;
        onRef.current = false;
        setOn(false);
        handlers.current.onProblem?.(problem);
      }),
      R.addListener('result', (e) => {
        const said = e.results[0]?.transcript ?? '';
        // The app hearing itself: ignore.
        if (speaking.current && isEcho(said, spokenText.current)) return;
        lastHeard.current = Date.now();
        const cmd = parseCommand(said);
        // The cook cutting in: stop talking and do it.
        if (cmd && speaking.current) m.speech.stop();
        if (!e.isFinal) {
          // Act the moment a short command is clear, then ignore the rest of this phrase.
          if (cmd && QUICK.has(cmd.type) && !acted.current) {
            acted.current = true;
            handlers.current.onCommand(cmd);
          }
          return;
        }
        if (acted.current) {
          acted.current = false;
          return;
        }
        if (cmd) handlers.current.onCommand(cmd);
        else if (said.trim()) handlers.current.onUnknown?.(said);
      }),
    ];
    // The mic never listens in the background: stop when the app leaves the screen, pick up on return.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (paused.current) {
          paused.current = false;
          lastHeard.current = Date.now();
          listen();
        }
      } else if (onRef.current && !paused.current) {
        paused.current = true;
        R.abort();
        m.speech.stop();
      }
    });
    // Nothing said for a while: switch off, and say so.
    const idle = setInterval(() => {
      if (onRef.current && !paused.current && Date.now() - lastHeard.current > IDLE_MS) {
        onRef.current = false;
        setOn(false);
        R.abort();
        m.speech.speak('Hands-free is off. Tap it to turn it back on.', { language: 'en-US', rate: 0.95 });
        handlers.current.onProblem?.('Hands-free turned off after 10 quiet minutes.');
      }
    }, 30_000);
    return () => {
      subs.forEach((s) => s.remove());
      appState.remove();
      clearInterval(idle);
      onRef.current = false;
      R.abort();
      m.speech.stop();
    };
  }, [listen]);

  const start = useCallback(async () => {
    const m = modules();
    if (!m) return false;
    const { granted } = await m.rec.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) return false;
    onRef.current = true;
    paused.current = false;
    lastHeard.current = Date.now();
    setOn(true);
    listen();
    return true;
  }, [listen]);

  const stop = useCallback(() => {
    onRef.current = false;
    setOn(false);
    modules()?.rec.ExpoSpeechRecognitionModule.abort();
    modules()?.speech.stop();
  }, []);

  /** Read something out loud. The mic keeps listening, so the cook can interrupt. */
  const say = useCallback(
    (text: string) => {
      const m = modules();
      if (!m) return;
      const mine = ++utterance.current;
      speaking.current = true;
      spokenText.current = text;
      m.speech.stop();
      const done = () => {
        if (mine !== utterance.current) return; // a newer reply took over
        speaking.current = false;
        spokenText.current = '';
      };
      m.speech.speak(text, { language: 'en-US', rate: 0.95, onDone: done, onStopped: done, onError: done });
      listen(); // in case it had stopped; does nothing if it's already listening
    },
    [listen],
  );

  return { on, listening, start, stop, say };
}
