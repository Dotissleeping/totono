import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { getMusicEnabled } from '../services/storageService';

export function useMusic(audioFile) {
  const soundRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadAndPlay() {
      try {
        const enabled = await getMusicEnabled();
        if (!enabled || !audioFile) return;

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        const { sound } = await Audio.Sound.createAsync(audioFile, {
          isLooping: true,
          volume: 0.5,
          shouldPlay: true,
        });

        if (mounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (e) {
        console.warn('Music load error:', e);
      }
    }

    loadAndPlay();

    return () => {
      mounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [audioFile]);
}
