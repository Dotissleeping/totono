import { Audio } from 'expo-av';

// Preload all SFX once at startup — reuse instead of creating new objects
const soundPool = {};

const SFX_FILES = {
  click:     require('../../assets/audio/sfx_click.mp3'),
  unlock:    require('../../assets/audio/sfx_unlock.mp3'),
  wrong:     require('../../assets/audio/sfx_wrong.mp3'),
  next_line: require('../../assets/audio/sfx_next_line.mp3'),
  voice:     require('../../assets/audio/sfx_voice_female.mp3'),
};

const VOLUMES = {
  click:     0.7,
  unlock:    0.8,
  wrong:     0.7,
  next_line: 0.5,
  voice:     0.6,
};

export async function preloadAllSFX() {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  for (const [name, file] of Object.entries(SFX_FILES)) {
    try {
      const { sound } = await Audio.Sound.createAsync(file, {
        volume: VOLUMES[name],
        shouldPlay: false,
      });
      soundPool[name] = sound;
    } catch (e) {
      console.warn(`SFX preload failed: ${name}`, e);
    }
  }
}

export async function playSFX(name) {
  try {
    const sound = soundPool[name];
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (e) {
    // ignore — never crash on sfx
  }
}