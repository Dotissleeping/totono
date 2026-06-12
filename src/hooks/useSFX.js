import { Audio } from 'expo-av';

const VOLUMES = {
  click:     0.7,
  unlock:    0.8,
  wrong:     0.7,
  next_line: 0.5,
  voice:     0.6,
};

const SOUNDS = {
  click:     require('../../assets/audio/sfx_click.mp3'),
  unlock:    require('../../assets/audio/sfx_unlock.mp3'),
  wrong:     require('../../assets/audio/sfx_wrong.mp3'),
  next_line: require('../../assets/audio/sfx_next_line.mp3'),
  voice:     require('../../assets/audio/sfx_voice_female.mp3'),
};

export async function playSFX(name) {
  try {
    const { sound } = await Audio.Sound.createAsync(SOUNDS[name], {
      volume: VOLUMES[name] ?? 0.7,
      shouldPlay: true,
    });
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.warn('SFX error:', e);
  }
}