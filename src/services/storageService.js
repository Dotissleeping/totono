import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GROQ_KEY:      'totono_groq_key',
  MUSIC_ENABLED: 'totono_music_enabled',
  SAVE_SLOT:     'totono_save_slot_',
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
  return val === null ? true : JSON.parse(val);
}

// --- Save Slots (5 slots: 0-4) ---
export async function getSaveSlot(slot) {
  try {
    const val = await AsyncStorage.getItem(KEYS.SAVE_SLOT + slot);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function writeSaveSlot(slot, data) {
  const save = {
    ...data,
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEYS.SAVE_SLOT + slot, JSON.stringify(save));
}

export async function deleteSaveSlot(slot) {
  await AsyncStorage.removeItem(KEYS.SAVE_SLOT + slot);
}

export async function getAllSaveSlots() {
  const slots = [];
  for (let i = 0; i < 5; i++) {
    slots.push(await getSaveSlot(i));
  }
  return slots;
}