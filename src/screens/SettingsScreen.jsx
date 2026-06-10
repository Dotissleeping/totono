import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { useMusic } from '../hooks/useMusic';
import { saveGroqKey, getGroqKey, clearGroqKey, saveMusicEnabled, getMusicEnabled } from '../services/storageService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_home.png');
const MUSIC = require('../../assets/audio/music_home.mp3');

export default function SettingsScreen({ navigation }) {
  useMusic(MUSIC);

  const [apiKey, setApiKey]         = useState('');
  const [savedKey, setSavedKey]     = useState('');
  const [musicOn, setMusicOn]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    async function load() {
      const key = await getGroqKey();
      const music = await getMusicEnabled();
      if (key) setSavedKey(key);
      setMusicOn(music);
    }
    load();
  }, []);

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    setSaving(true);
    await saveGroqKey(apiKey.trim());
    setSavedKey(apiKey.trim());
    setApiKey('');
    setSaving(false);
    Alert.alert('Saved', 'Your Groq API key has been saved.');
  }

  async function handleClearKey() {
    await clearGroqKey();
    setSavedKey('');
    Alert.alert('Cleared', 'API key removed. Default key will be used.');
  }

  async function toggleMusic(val) {
    setMusicOn(val);
    await saveMusicEnabled(val);
  }

  return (
    <BackgroundWrapper source={BG}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SETTINGS</Text>
        </View>

        {/* Groq API Key */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GROQ API KEY</Text>
          <Text style={styles.sectionDesc}>
            A default key is bundled. Add your own for unlimited usage.
          </Text>
          {savedKey ? (
            <View style={styles.savedKeyRow}>
              <Text style={styles.savedKeyText}>
                ✓ Custom key: {savedKey.slice(0, 8)}{'*'.repeat(Math.max(0, savedKey.length - 8))}
              </Text>
              <TouchableOpacity onPress={handleClearKey} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>REMOVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.defaultKeyText}>Using default key</Text>
          )}
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
            placeholderTextColor={COLORS.text_muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.saveBtn, (!apiKey.trim() || saving) && styles.saveBtnDisabled]}
            onPress={handleSaveKey}
            disabled={!apiKey.trim() || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE KEY'}</Text>
          </TouchableOpacity>
        </View>

        {/* Music */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MUSIC</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Background Music</Text>
            <Switch
              value={musicOn}
              onValueChange={toggleMusic}
              trackColor={{ false: COLORS.border, true: COLORS.accent_gold }}
              thumbColor={COLORS.text_primary}
            />
          </View>
          <Text style={styles.sectionDesc}>Changes take effect on next screen load.</Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.aboutText}>
            TOTONO — AI Mystery Solving Game{'\n'}
            Inspired by ミステリと言う勿れ{'\n'}
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, zIndex: 1 },
  container: { padding: 24, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  backBtn: { padding: 4 },
  backText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_teal,
  },
  title: {
    ...FONTS.display,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text_primary,
    letterSpacing: 6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_gold,
    marginBottom: 8,
  },
  sectionDesc: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  savedKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg_surface,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  savedKeyText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    flex: 1,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 4,
  },
  clearBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
  },
  defaultKeyText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 14,
    color: COLORS.text_primary,
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.base,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.accent_teal,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.bg_dark,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleLabel: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
  },
  aboutText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 24,
  },
});
