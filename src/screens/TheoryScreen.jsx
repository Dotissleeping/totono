import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import TheoryInput from '../components/TheoryInput';
import { useMusic } from '../hooks/useMusic';
import { judgeTheory } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_theory.png');
const MUSIC = require('../../assets/audio/music_theory.mp3');

export default function TheoryScreen({ navigation, route }) {
  const { caseData } = route.params;
  useMusic(MUSIC);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handleSubmit(theory) {
    setLoading(true);
    setError(null);
    try {
      const verdict = await judgeTheory(caseData, theory);
      navigation.navigate('Verdict', { caseData, verdict, theory });
    } catch (e) {
      setError(e?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BackgroundWrapper source={BG}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← BACK</Text>
            </TouchableOpacity>
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.prompt}>Who did it — and why?</Text>

            <View style={styles.suspects}>
              {caseData.suspects.map(s => (
                <Text key={s.id} style={styles.suspectChip}>• {s.name}</Text>
              ))}
            </View>

            {error && <Text style={styles.errorText}>⚠ {error}</Text>}

            <TheoryInput onSubmit={handleSubmit} loading={loading} />
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 12, gap: 16,
  },
  backBtn: { padding: 4 },
  backText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.accent_teal },
  caseTitle: { ...FONTS.display, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, flex: 1 },
  scroll: { flex: 1 },
  prompt: {
    ...FONTS.display, fontSize: FONT_SIZES.lg, color: COLORS.accent_gold,
    textAlign: 'center', marginVertical: 20, letterSpacing: 1,
  },
  suspects: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, marginBottom: 20,
  },
  suspectChip: {
    ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary,
  },
  errorText: {
    ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.error,
    marginHorizontal: 16, marginBottom: 12,
  },
});