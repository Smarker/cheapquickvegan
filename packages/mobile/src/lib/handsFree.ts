import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseCommand, type VoiceCommand } from './voice';

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
};

/**
 * Hands-free cook mode: listens while switched on, turns each phrase into a command, and can talk back.
 * The mic is ignored while the app is speaking, so it doesn't hear itself.
 */
export function useHandsFree({ onCommand, onUnknown }: Options) {
  const [on, setOn] = useState(false);
  const [listening, setListening] = useState(false);
  const onRef = useRef(false);
  const speaking = useRef(false);
  const utterance = useRef(0);
  const handlers = useRef({ onCommand, onUnknown });
  handlers.current = { onCommand, onUnknown };

  const listen = useCallback(() => {
    const m = modules();
    if (!m || !onRef.current) return;
    m.rec.ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false, continuous: true, maxAlternatives: 1 });
  }, []);

  useEffect(() => {
    const m = modules();
    if (!m) return;
    const R = m.rec.ExpoSpeechRecognitionModule;
    const subs = [
      R.addListener('start', () => setListening(true)),
      // Recognisers stop after a pause; keep going while hands-free is on.
      R.addListener('end', () => {
        setListening(false);
        if (onRef.current && !speaking.current) setTimeout(listen, 250);
      }),
      R.addListener('error', (e) => {
        if (e.error === 'not-allowed') {
          onRef.current = false;
          setOn(false);
        }
      }),
      R.addListener('result', (e) => {
        if (speaking.current || !e.isFinal) return;
        const said = e.results[0]?.transcript ?? '';
        const cmd = parseCommand(said);
        if (cmd) handlers.current.onCommand(cmd);
        else if (said.trim()) handlers.current.onUnknown?.(said);
      }),
    ];
    return () => {
      subs.forEach((s) => s.remove());
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
    setOn(true);
    listen();
    return true;
  }, [listen]);

  const stop = useCallback(() => {
    onRef.current = false;
    setOn(false);
    modules()?.rec.ExpoSpeechRecognitionModule.abort();
  }, []);

  /** Read something out loud, pausing the mic so it doesn't hear itself. */
  const say = useCallback(
    (text: string) => {
      const m = modules();
      if (!m) return;
      const mine = ++utterance.current;
      speaking.current = true;
      m.rec.ExpoSpeechRecognitionModule.abort();
      m.speech.stop();
      const resume = () => {
        if (mine !== utterance.current) return; // a newer reply took over
        speaking.current = false;
        listen();
      };
      m.speech.speak(text, { language: 'en-US', rate: 0.95, onDone: resume, onStopped: resume, onError: resume });
    },
    [listen],
  );

  return { on, listening, start, stop, say };
}
