import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { getMusicEnabled } from '../services/storageService';

const FADE_STEPS = 20;
const FADE_INTERVAL = 50;

// Global sound reference shared across all screens
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

        // Same file already playing — don't restart
        if (globalFile === audioFile && globalSound) return;

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        // Fade out old sound
        if (globalSound) {
          const old = globalSound;
          globalSound = null;
          globalFile  = null;
          let vol = 0.18;
          await new Promise(resolve => {
            const interval = setInterval(async () => {
              vol -= 0.18 / FADE_STEPS;
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

        // Load new sound
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

        // Fade in
        await new Promise(r => setTimeout(r, 300));
        let vol = 0;
        const interval = setInterval(async () => {
          vol += 0.18 / FADE_STEPS;
          if (vol >= 0.18) {
            vol = 0.18;
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
      // Don't stop music on unmount — let next screen take over
    };
  }, [audioFile]);
}