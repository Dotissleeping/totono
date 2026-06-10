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
      setError(e?.message || 'Failed to judge theory. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BackgroundWrapper source={BG}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>← BACK</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.label}>THEORY</Text>
              <Text style={styles.caseTitle}>{caseData.title}</Text>
            </View>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Prompt */}
            <View style={styles.promptBox}>
              <Text style={styles.promptTitle}>THE QUESTION</Text>
              <Text style={styles.promptText}>
                You have reviewed the evidence. You have asked your questions.{'\n\n'}
                Now — who committed this crime, and what drove them to do it?
              </Text>
              <Text style={styles.promptHint}>
                The AI will judge your theory based on accuracy and psychological insight.
                Points are awarded not just for naming the culprit, but for understanding <Text style={styles.promptHintBold}>why</Text>.
              </Text>
            </View>

            {/* Suspect List reminder */}
            <View style={styles.suspectReminder}>
              <Text style={styles.suspectReminderLabel}>SUSPECTS</Text>
              {caseData.suspects.map(s => (
                <Text key={s.id} style={styles.suspectItem}>• {s.name} — {s.occupation}</Text>
              ))}
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            )}

            <TheoryInput onSubmit={handleSubmit} loading={loading} />

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    zIndex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  backBtn: { padding: 4 },
  backText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_teal,
  },
  headerCenter: { flex: 1 },
  label: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_gold,
    letterSpacing: 4,
    marginBottom: 2,
  },
  caseTitle: {
    ...FONTS.display,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_primary,
  },
  scroll: { flex: 1 },
  promptBox: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  promptTitle: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_red,
    letterSpacing: 4,
    marginBottom: 8,
  },
  promptText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 24,
    marginBottom: 12,
  },
  promptHint: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 20,
  },
  promptHintBold: {
    color: COLORS.accent_gold,
  },
  suspectReminder: {
    backgroundColor: COLORS.bg_mid,
    borderRadius: 4,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  suspectReminderLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 4,
    marginBottom: 8,
  },
  suspectItem: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(232,57,74,0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 4,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  errorText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    lineHeight: 20,
  },
});
