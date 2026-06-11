import { Audio } from 'expo-av';

const VOLUMES = {
  // SFX sit loud and clear above music
  click:      0.7,
  unlock:     0.8,
  wrong:      0.7,
  next_line:  0.5,
  // Voice blips — clear but not piercing
  detective:  0.6,
  female:     0.6,
  tall_male:  0.6,
  hooded:     0.6,
  stocky_male:0.6,
};

const SOUNDS = {
  click:       require('../../assets/audio/sfx_click.mp3'),
  unlock:      require('../../assets/audio/sfx_unlock.mp3'),
  wrong:       require('../../assets/audio/sfx_wrong.mp3'),
  next_line:   require('../../assets/audio/sfx_next_line.mp3'),
  detective:         require('../../assets/audio/sfx_voice_detective.mp3'),
  female:            require('../../assets/audio/sfx_voice_female.mp3'),
  tall_male:         require('../../assets/audio/sfx_voice_tall_male.mp3'),
  hooded:            require('../../assets/audio/sfx_voice_hooded.mp3'),
  stocky_male:       require('../../assets/audio/sfx_voice_stocky_male.mp3'),
};

export async function playSFX(name) {
  try {
    const { sound } = await Audio.Sound.createAsync(SOUNDS[name], {
      volume: VOLUMES[name] ?? 0.7,
      shouldPlay: true,
    });
    // Auto-unload after playing
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.warn('SFX error:', e);
  }
}