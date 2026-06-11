import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { getMusicEnabled } from '../services/storageService';

const FADE_STEPS = 20;
const FADE_INTERVAL = 50; // ms per step = 1 second total fade

export function useMusic(audioFile) {
  const soundRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let fadeInterval = null;

    async function loadAndPlay() {
      try {
        const enabled = await getMusicEnabled();
        if (!enabled || !audioFile) return;

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        // Fade out existing sound first
        if (soundRef.current) {
          const old = soundRef.current;
          let vol = 0.5;
          fadeInterval = setInterval(async () => {
            vol -= 0.5 / FADE_STEPS;
            if (vol <= 0) {
              clearInterval(fadeInterval);
              await old.unloadAsync().catch(() => {});
            } else {
              await old.setVolumeAsync(vol).catch(() => {});
            }
          }, FADE_INTERVAL);
          await new Promise(r => setTimeout(r, FADE_STEPS * FADE_INTERVAL + 200));
        }

        if (!mounted) return;

        // Load new sound at volume 0
        const { sound } = await Audio.Sound.createAsync(audioFile, {
          isLooping: true,
          volume: 0,
          shouldPlay: true,
        });

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;

        // Fade in after short delay
        await new Promise(r => setTimeout(r, 300));
        let vol = 0;
        fadeInterval = setInterval(async () => {
          vol += 0.5 / FADE_STEPS;
          if (vol >= 0.5) {
            vol = 0.5;
            clearInterval(fadeInterval);
          }
          await sound.setVolumeAsync(vol).catch(() => {});
        }, FADE_INTERVAL);

      } catch (e) {
        console.warn('Music error:', e);
      }
    }

    loadAndPlay();

    return () => {
      mounted = false;
      clearInterval(fadeInterval);
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [audioFile]);
}