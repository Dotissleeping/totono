import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { getMusicEnabled } from '../services/storageService';

const FADE_STEPS = 15;
const FADE_INTERVAL = 50;

let globalSound = null;
let globalFile  = null;

export function useMusic(audioFile) {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function loadAndPlay() {
      try {
        const enabled = await getMusicEnabled();
        if (!enabled || !audioFile) return;

        if (globalFile === audioFile && globalSound) return;

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        // Fade out old sound
        if (globalSound) {
          const old = globalSound;
          globalSound = null;
          globalFile  = null;
          let vol = 0.25;
          await new Promise(resolve => {
            const interval = setInterval(async () => {
              vol -= 0.25 / FADE_STEPS;
              if (vol <= 0) {
                clearInterval(interval);
                await old.unloadAsync().catch(() => {});
                resolve();
              } else {
                await old.setVolumeAsync(vol).catch(() => {});
              }
            }, FADE_INTERVAL);
          });
        }

        if (!mountedRef.current) return;

        const { sound } = await Audio.Sound.createAsync(audioFile, {
          isLooping: true,
          volume: 0,
          shouldPlay: true,
        });

        if (!mountedRef.current) {
          await sound.unloadAsync();
          return;
        }

        globalSound = sound;
        globalFile  = audioFile;

        await new Promise(r => setTimeout(r, 300));
        let vol = 0;
        const interval = setInterval(async () => {
          vol += 0.25 / FADE_STEPS;
          if (vol >= 0.25) {
            vol = 0.25;
            clearInterval(interval);
          }
          if (globalSound === sound) {
            await sound.setVolumeAsync(vol).catch(() => {});
          }
        }, FADE_INTERVAL);

      } catch (e) {
        console.warn('Music error:', e);
      }
    }

    loadAndPlay();

    return () => {
      mountedRef.current = false;
    };
  }, [audioFile]);
}