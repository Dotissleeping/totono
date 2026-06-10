import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GROQ_KEY:     'totono_groq_key',
  MUSIC_ENABLED:'totono_music_enabled',
};

// --- Groq API Key ---
export async function saveGroqKey(key) {
  await AsyncStorage.setItem(KEYS.GROQ_KEY, key);
}

export async function getGroqKey() {
  return await AsyncStorage.getItem(KEYS.GROQ_KEY);
}

export async function clearGroqKey() {
  await AsyncStorage.removeItem(KEYS.GROQ_KEY);
}

// --- Music toggle ---
export async function saveMusicEnabled(enabled) {
  await AsyncStorage.setItem(KEYS.MUSIC_ENABLED, JSON.stringify(enabled));
}

export async function getMusicEnabled() {
  const val = await AsyncStorage.getItem(KEYS.MUSIC_ENABLED);
  return val === null ? true : JSON.parse(val); // default on
}
