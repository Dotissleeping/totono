import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import TriviaCard from '../components/TriviaCard';
import { useMusic } from '../hooks/useMusic';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_trivia.png');
const MUSIC = require('../../assets/audio/music_trivia.mp3');

export default function TriviaScreen({ navigation, route }) {
  const { trivia, clueId, caseData, onUnlocked } = route.params;

  useMusic(MUSIC);

  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'

  function handleAnswer(correct) {
    setResult(correct ? 'correct' : 'wrong');

    if (correct) {
      // Unlock the clue in caseData
      const updatedCase = {
        ...caseData,
        clues: caseData.clues.map(c =>
          c.id === clueId ? { ...c, locked: false } : c
        ),
      };
      onUnlocked && onUnlocked(clueId, updatedCase);
    }
  }

  function handleBack() {
    navigation.goBack();
  }

  const clue = caseData.clues.find(c => c.id === clueId);

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>TRIVIA UNLOCK</Text>
        </View>

        <View style={styles.lockInfo}>
          <Text style={styles.lockLabel}>🔒 LOCKED CLUE</Text>
          <Text style={styles.lockClueTitle}>{clue?.title}</Text>
          <Text style={styles.lockInstructions}>
            Answer correctly to unlock this clue.
          </Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TriviaCard trivia={trivia} onAnswer={handleAnswer} />

          {result === 'correct' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultIconCorrect}>✓</Text>
              <Text style={styles.resultTitle}>Clue Unlocked!</Text>
              <Text style={styles.resultText}>
                Your knowledge has revealed a new piece of evidence.
              </Text>
              <TouchableOpacity style={styles.continueBtn} onPress={handleBack} activeOpacity={0.8}>
                <Text style={styles.continueBtnText}>VIEW CLUE ▶</Text>
              </TouchableOpacity>
            </View>
          )}

          {result === 'wrong' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultIconWrong}>✗</Text>
              <Text style={styles.resultTitle}>Incorrect</Text>
              <Text style={styles.resultText}>
                The clue remains locked. Study the explanation above and try again later.
              </Text>
              <TouchableOpacity style={styles.backBtn2} onPress={handleBack} activeOpacity={0.8}>
                <Text style={styles.backBtn2Text}>← BACK TO CLUES</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    fontSize: FONT_SIZES.lg,
    color: COLORS.text_primary,
    letterSpacing: 4,
  },
  lockInfo: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  lockLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    marginBottom: 4,
  },
  lockClueTitle: {
    ...FONTS.display,
    fontSize: FONT_SIZES.md,
    color: COLORS.accent_gold,
    marginBottom: 4,
  },
  lockInstructions: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
  },
  scroll: { flex: 1 },
  resultBox: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  resultIconCorrect: {
    fontSize: 40,
    color: COLORS.success,
    marginBottom: 8,
  },
  resultIconWrong: {
    fontSize: 40,
    color: COLORS.error,
    marginBottom: 8,
  },
  resultTitle: {
    ...FONTS.display,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text_primary,
    marginBottom: 8,
  },
  resultText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  continueBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  continueBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.bg_dark,
  },
  backBtn2: {
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtn2Text: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
  },
});
