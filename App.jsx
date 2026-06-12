import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { preloadAllSFX } from './src/hooks/useSFX';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await preloadAllSFX();
      } catch (e) {
        console.warn('Preload error:', e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appReady) return null;

  return <AppNavigator />;
}