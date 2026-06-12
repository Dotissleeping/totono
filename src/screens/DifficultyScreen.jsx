import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { useMusic } from '../hooks/useMusic';
import { playSFX } from '../hooks/useSFX';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_home.png');
const MUSIC = require('../../assets/audio/music_home.mp3');

const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'EASY',
    emoji: '🔍',
    desc: 'All clues visible. Generous hints. Lenient scoring.',
    color: COLORS.success,
  },
  {
    id: 'medium',
    label: 'MEDIUM',
    emoji: '🕵️',
    desc: 'Some clues locked. Balanced hints. Fair scoring.',
    color: COLORS.accent_gold,
  },
  {
    id: 'hard',
    label: 'HARD',
    emoji: '💀',
    desc: 'Most clues locked. Vague hints. Strict scoring.',
    color: COLORS.accent_red,
  },
];

export default function DifficultyScreen({ navigation }) {
  useMusic(MUSIC);
  const [selected, setSelected] = useState('medium');

  function handleStart() {
    playSFX('click');
    navigation.navigate('CaseIntro', { difficulty: selected });
  }

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>SELECT DIFFICULTY</Text>
        <Text style={styles.subtitle}>Choose how hard you want this case to be.</Text>

        <View style={styles.options}>
          {DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[styles.option, selected === d.id && { borderColor: d.color, backgroundColor: `${d.color}18` }]}
              onPress={() => { setSelected(d.id); playSFX('click'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.optionEmoji}>{d.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, selected === d.id && { color: d.color }]}>{d.label}</Text>
                <Text style={styles.optionDesc}>{d.desc}</Text>
              </View>
              {selected === d.id && <Text style={[styles.check, { color: d.color }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startBtnText}>START CASE ▶</Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 24 },
  backText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.accent_teal },
  title: { ...FONTS.display, fontSize: FONT_SIZES.xl, color: COLORS.text_primary, letterSpacing: 4, marginBottom: 8 },
  subtitle: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary, marginBottom: 32 },
  options: { gap: 14, flex: 1 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 6,
    padding: 18, backgroundColor: COLORS.bg_surface,
  },
  optionEmoji: { fontSize: 28 },
  optionText: { flex: 1 },
  optionLabel: { ...FONTS.ui, fontSize: FONT_SIZES.md, color: COLORS.text_primary, marginBottom: 4 },
  optionDesc: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary },
  check: { fontSize: FONT_SIZES.lg },
  startBtn: {
    backgroundColor: COLORS.accent_gold, borderRadius: 4,
    paddingVertical: 18, alignItems: 'center', marginTop: 24,
  },
  startBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.md, color: COLORS.bg_dark, letterSpacing: 3 },
});