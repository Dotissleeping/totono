import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import { useMusic } from '../hooks/useMusic';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_home.png');
const MUSIC = require('../../assets/audio/music_home.mp3');

export default function HomeScreen({ navigation }) {
  useMusic(MUSIC);

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>TOTONO</Text>
          <Text style={styles.subtitle}>ミステリと言う勿れ</Text>
        </View>

        <View style={styles.spriteArea}>
          <CharacterSprite name="detective" size={200} />
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CaseIntro')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>▶  NEW CASE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>⚙  SETTINGS</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0 — AI Mystery</Text>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center' },
  title: {
    ...FONTS.display,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text_primary,
    letterSpacing: 12,
  },
  subtitle: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    letterSpacing: 3,
    marginTop: 6,
  },
  spriteArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  menu: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.accent_gold,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.md,
    color: COLORS.bg_dark,
    letterSpacing: 3,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    letterSpacing: 3,
  },
  version: {
    ...FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    marginTop: 16,
  },
});
