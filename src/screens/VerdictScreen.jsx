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
  const color = score >= 80 ? COLORS.success : score >= 50 ? COLORS.accent_gold : COLORS.error;
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
  track: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  label: { ...FONTS.display, fontSize: FONT_SIZES.xl, minWidth: 40 },
});

export default function VerdictScreen({ navigation, route }) {
  const { caseData, verdict, theory } = route.params;
  useMusic(MUSIC);

  const [didYouKnow, setDidYouKnow]   = useState(null);
  const [loadingFact, setLoadingFact] = useState(true);

  useEffect(() => {
    generateDidYouKnow(caseData)
      .then(setDidYouKnow)
      .catch(() => setDidYouKnow({ fact: 'The human capacity for self-deception is one of the most studied phenomena in psychology.', category: 'Psychology' }))
      .finally(() => setLoadingFact(false));
  }, []);

  const culprit = caseData.suspects.find(s => s.id === caseData.truth.culpritId);
  const verdictColor = verdict.verdict === 'CORRECT' ? COLORS.success : verdict.verdict === 'PARTIALLY CORRECT' ? COLORS.accent_gold : COLORS.error;

  return (
    <BackgroundWrapper source={BG}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          {/* Verdict + Score */}
          <View style={[styles.banner, { borderColor: verdictColor }]}>
            <Text style={[styles.verdictText, { color: verdictColor }]}>{verdict.verdict}</Text>
            <ScoreBar score={verdict.score} />
          </View>

          {/* Detective reaction */}
          <Text style={styles.reaction}>"{verdict.reaction}"</Text>

          {/* Culprit reveal with sprite box */}
          <View style={styles.culpritSection}>
            <Text style={styles.sectionLabel}>THE CULPRIT</Text>
            <View style={styles.culpritRow}>
              {culprit && (
                <View style={styles.spriteBox}>
                  <CharacterSprite name={culprit.sprite} size={90} />
                </View>
              )}
              <View style={styles.culpritInfo}>
                <Text style={styles.culpritName}>{culprit?.name}</Text>
                <Text style={styles.culpritOccupation}>{culprit?.occupation}</Text>
              </View>
            </View>
          </View>

          {/* Full reveal */}
          <View style={styles.revealBox}>
            <Text style={styles.revealText}>{verdict.fullReveal}</Text>
          </View>

          {/* Did You Know */}
          <View style={styles.factBox}>
            <Text style={styles.factLabel}>DID YOU KNOW?</Text>
            {loadingFact
              ? <ActivityIndicator color={COLORS.accent_teal} size="small" />
              : <Text style={styles.factText}>{didYouKnow?.fact}</Text>
            }
          </View>

          <TouchableOpacity
            style={styles.newCaseBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
            activeOpacity={0.8}
          >
            <Text style={styles.newCaseBtnText}>▶ NEW CASE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, zIndex: 1 },
  container: { paddingTop: 60, paddingBottom: 60, paddingHorizontal: 16, gap: 20 },
  banner: {
    borderWidth: 2, borderRadius: 4, padding: 20, gap: 14,
  },
  verdictText: { ...FONTS.display, fontSize: FONT_SIZES.xl, letterSpacing: 4, textAlign: 'center' },
  reaction: {
    ...FONTS.body, fontSize: FONT_SIZES.base, color: COLORS.text_secondary,
    lineHeight: 24, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 8,
  },
  culpritSection: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, borderRadius: 4, padding: 16,
  },
  sectionLabel: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.error,
    letterSpacing: 4, marginBottom: 12,
  },
  culpritRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  spriteBox: {
    width: 100, height: 110,
    backgroundColor: 'rgba(20, 20, 82, 0.85)',
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 6, alignItems: 'center', justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  culpritInfo: { flex: 1 },
  culpritName: { ...FONTS.display, fontSize: FONT_SIZES.lg, color: COLORS.text_primary, marginBottom: 4 },
  culpritOccupation: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary },
  revealBox: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 4, padding: 16,
  },
  revealText: { ...FONTS.body, fontSize: FONT_SIZES.base, color: COLORS.text_primary, lineHeight: 26 },
  factBox: {
    backgroundColor: COLORS.bg_mid, borderWidth: 1,
    borderColor: COLORS.accent_teal, borderRadius: 4, padding: 16,
  },
  factLabel: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_teal, letterSpacing: 4, marginBottom: 10 },
  factText: { ...FONTS.body, fontSize: FONT_SIZES.base, color: COLORS.text_primary, lineHeight: 24 },
  newCaseBtn: {
    backgroundColor: COLORS.accent_gold, borderRadius: 4,
    paddingVertical: 18, alignItems: 'center',
  },
  newCaseBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.md, color: COLORS.bg_dark, letterSpacing: 3 },
});