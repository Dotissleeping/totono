import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import { useMusic } from '../hooks/useMusic';
import { generateDidYouKnow } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_verdict.png');
const MUSIC = require('../../assets/audio/music_verdict.mp3');

function ScoreBar({ score }) {
  const color =
    score >= 80 ? COLORS.success :
    score >= 50 ? COLORS.accent_gold :
    COLORS.error;

  return (
    <View style={scoreStyles.container}>
      <View style={scoreStyles.track}>
        <View style={[scoreStyles.fill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[scoreStyles.label, { color }]}>{score}</Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: {
    flex: 1, height: 8, backgroundColor: COLORS.border,
    borderRadius: 4, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  label: { ...FONTS.display, fontSize: FONT_SIZES.xl, minWidth: 40 },
});

export default function VerdictScreen({ navigation, route }) {
  const { caseData, verdict, theory } = route.params;

  useMusic(MUSIC);

  const [didYouKnow, setDidYouKnow] = useState(null);
  const [loadingFact, setLoadingFact] = useState(true);

  useEffect(() => {
    generateDidYouKnow(caseData)
      .then(setDidYouKnow)
      .catch(() => setDidYouKnow({ fact: 'The human capacity for self-deception is one of the most studied phenomena in psychology.', category: 'Psychology' }))
      .finally(() => setLoadingFact(false));
  }, []);

  const culprit = caseData.suspects.find(s => s.id === caseData.truth.culpritId);

  const verdictColor =
    verdict.verdict === 'CORRECT'           ? COLORS.success :
    verdict.verdict === 'PARTIALLY CORRECT' ? COLORS.accent_gold :
    COLORS.error;

  return (
    <BackgroundWrapper source={BG}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Verdict Banner */}
          <View style={[styles.verdictBanner, { borderColor: verdictColor }]}>
            <Text style={styles.verdictLabel}>VERDICT</Text>
            <Text style={[styles.verdictText, { color: verdictColor }]}>
              {verdict.verdict}
            </Text>
          </View>

          {/* Score */}
          <View style={styles.scoreSection}>
            <Text style={styles.sectionLabel}>SCORE</Text>
            <ScoreBar score={verdict.score} />
          </View>

          {/* Detective Reaction */}
          <View style={styles.reactionBox}>
            <View style={styles.reactionHeader}>
              <CharacterSprite name="detective" size={50} />
              <Text style={styles.reactionSpeaker}>DETECTIVE</Text>
            </View>
            <Text style={styles.reactionText}>"{verdict.reaction}"</Text>
          </View>

          {/* What They Got Right/Wrong */}
          <View style={styles.analysisBox}>
            <Text style={styles.sectionLabel}>ANALYSIS</Text>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisTitle}>✓ Got Right</Text>
              <Text style={styles.analysisText}>{verdict.whatTheyGotRight}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.analysisRow}>
              <Text style={[styles.analysisTitle, { color: COLORS.error }]}>✗ Missed</Text>
              <Text style={styles.analysisText}>{verdict.whatTheyMissed}</Text>
            </View>
          </View>

          {/* Full Reveal */}
          <View style={styles.revealBox}>
            <Text style={styles.sectionLabel}>THE TRUTH</Text>
            {culprit && (
              <View style={styles.culpritRow}>
                <CharacterSprite name={culprit.sprite} size={80} />
                <View style={styles.culpritInfo}>
                  <Text style={styles.culpritLabel}>CULPRIT</Text>
                  <Text style={styles.culpritName}>{culprit.name}</Text>
                  <Text style={styles.culpritOccupation}>{culprit.occupation}</Text>
                </View>
              </View>
            )}
            <Text style={styles.revealText}>{verdict.fullReveal}</Text>
          </View>

          {/* Did You Know */}
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>DID YOU KNOW?</Text>
            {loadingFact ? (
              <ActivityIndicator color={COLORS.accent_teal} size="small" />
            ) : didYouKnow ? (
              <>
                <Text style={styles.factText}>{didYouKnow.fact}</Text>
                <Text style={styles.factCategory}>{didYouKnow.category}</Text>
              </>
            ) : null}
          </View>

          {/* Player's Theory */}
          <View style={styles.theoryBox}>
            <Text style={styles.sectionLabel}>YOUR THEORY</Text>
            <Text style={styles.theoryText}>"{theory}"</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.newCaseBtn}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
              activeOpacity={0.8}
            >
              <Text style={styles.newCaseBtnText}>▶ NEW CASE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, zIndex: 1 },
  container: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 16,
    gap: 20,
  },
  verdictBanner: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
  },
  verdictLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 6,
    marginBottom: 6,
  },
  verdictText: {
    ...FONTS.display,
    fontSize: FONT_SIZES.xl,
    letterSpacing: 4,
  },
  scoreSection: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 16,
  },
  sectionLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 4,
    marginBottom: 10,
  },
  reactionBox: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 16,
  },
  reactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reactionSpeaker: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_gold,
    letterSpacing: 4,
  },
  reactionText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  analysisBox: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 16,
  },
  analysisRow: { marginBottom: 8 },
  analysisTitle: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    marginBottom: 4,
  },
  analysisText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_secondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  revealBox: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 16,
  },
  culpritRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  culpritInfo: { flex: 1 },
  culpritLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    letterSpacing: 4,
    marginBottom: 2,
  },
  culpritName: {
    ...FONTS.display,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text_primary,
    marginBottom: 2,
  },
  culpritOccupation: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
  },
  revealText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 26,
  },
  factBox: {
    backgroundColor: COLORS.bg_mid,
    borderWidth: 1,
    borderColor: COLORS.accent_teal,
    borderRadius: 4,
    padding: 16,
  },
  factLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_teal,
    letterSpacing: 4,
    marginBottom: 10,
  },
  factText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  factCategory: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 2,
  },
  theoryBox: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.accent_purple,
    borderRadius: 4,
    padding: 16,
  },
  theoryText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actions: { gap: 12 },
  newCaseBtn: {
    backgroundColor: COLORS.accent_gold,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
  },
  newCaseBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.md,
    color: COLORS.bg_dark,
    letterSpacing: 3,
  },
});
