import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useSettings } from './store';

const SOURCES = {
  move: require('../../assets/sounds/move.wav'),
  capture: require('../../assets/sounds/capture.wav'),
  star: require('../../assets/sounds/star.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  win: require('../../assets/sounds/win.wav'),
  check: require('../../assets/sounds/check.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let modeSet = false;

export function play(name: SoundName): void {
  if (!useSettings.getState().sound) return;
  try {
    if (!modeSet) {
      modeSet = true;
      void setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    }
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    void p.seekTo(0);
    p.play();
  } catch {
    // Âm thanh là phụ — bỏ qua lỗi (ví dụ trình duyệt chặn tự phát).
  }
  if (Platform.OS !== 'web') {
    if (name === 'wrong') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    else if (name === 'win') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else if (name === 'capture') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
}
