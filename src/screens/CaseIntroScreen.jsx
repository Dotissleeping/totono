import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import DialogueBox from '../components/DialogueBox';
import { useMusic } from '../hooks/useMusic';
import { generateCase } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_case_intro.png');
const MUSIC = require('../../assets/audio/music_case_intro.mp3');

export default function CaseIntroScreen({ navigation }) {
  useMusic(MUSIC);

  const [caseData, setCaseData]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [phase, setPhase]           = useState('intro');
  const [suspectIdx, setSuspectIdx] = useState(0);

  useEffect(() => { loadCase(); }, []);

  async function loadCase() {
    setLoading(true);
    setError(null);
    try {
      const data = await generateCase();
      setCaseData(data);
      setPhase('intro');
    } catch (e) {
      setError(e?.message || 'Failed to generate case. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (phase === 'intro') {
      setPhase('suspects');
      setSuspectIdx(0);
    } else {
      if (suspectIdx < caseData.suspects.length - 1) {
        setSuspectIdx(i => i + 1);
      } else {
        navigation.navigate('Clues', { caseData });
      }
    }
  }

  if (loading) {
    return (
      <BackgroundWrapper source={BG}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent_gold} size="large" />
          <Text style={styles.loadingText}>Crafting your mystery...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (error) {
    return (
      <BackgroundWrapper source={BG}>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCase}>
            <Text style={styles.retryBtnText}>RETRY</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ padding: 8 }}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  // --- Intro phase ---
  if (phase === 'intro') {
    return (
      <BackgroundWrapper source={BG}>
        <View style={styles.container}>
          <View style={styles.caseHeader}>
            <Text style={styles.caseLabel}>CASE FILE</Text>
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <DialogueBox speaker="DETECTIVE" text={caseData.setting} />
            <View style={styles.victimCard}>
              <Text style={styles.victimLabel}>VICTIM</Text>
              <Text style={styles.victimName}>{caseData.victim.name}</Text>
              <Text style={styles.victimInfo}>
                {caseData.victim.age} y/o · {caseData.victim.occupation}
              </Text>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueBtnText}>MEET THE SUSPECTS ▶</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  // --- Suspects phase ---
  const suspect = caseData.suspects[suspectIdx];
  const isLast  = suspectIdx === caseData.suspects.length - 1;

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <Text style={styles.suspectCounterText}>
          SUSPECT {suspectIdx + 1} / {caseData.suspects.length}
        </Text>

        {/* Sprite with background box */}
        <View style={styles.spriteBox}>
          <CharacterSprite name={suspect.sprite} size={170} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.suspectCard}>
            <Text style={styles.suspectName}>{suspect.name}</Text>
            <Text style={styles.suspectInfo}>{suspect.age} y/o · {suspect.occupation}</Text>
            <Text style={styles.suspectRelation}>{suspect.relationship}</Text>
            <View style={styles.alibiBox}>
              <Text style={styles.alibiText}>"{suspect.alibi}"</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueBtnText}>
            {isLast ? 'BEGIN INVESTIGATION ▶' : 'NEXT SUSPECT ▶'}
          </Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 50, paddingBottom: 24 },
  center: { flex: 1, zIndex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: {
    ...FONTS.ui, fontSize: FONT_SIZES.md, color: COLORS.text_primary,
    marginTop: 20, letterSpacing: 3,
  },
  errorText: {
    ...FONTS.body, fontSize: FONT_SIZES.base, color: COLORS.error,
    textAlign: 'center', lineHeight: 22, marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.accent_gold, borderRadius: 4,
    paddingHorizontal: 32, paddingVertical: 14, marginBottom: 12,
  },
  retryBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.bg_dark },
  backLinkText: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary },
  caseHeader: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  caseLabel: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_teal,
    letterSpacing: 5, marginBottom: 6,
  },
  caseTitle: {
    ...FONTS.display, fontSize: FONT_SIZES.xl, color: COLORS.text_primary,
    textAlign: 'center', letterSpacing: 2,
  },
  scroll: { flex: 1 },
  victimCard: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, borderRadius: 4,
    padding: 16, marginHorizontal: 16, marginTop: 12, marginBottom: 16,
  },
  victimLabel: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_red, marginBottom: 4 },
  victimName: { ...FONTS.display, fontSize: FONT_SIZES.lg, color: COLORS.text_primary, marginBottom: 4 },
  victimInfo: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary },
  suspectCounterText: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted,
    letterSpacing: 3, textAlign: 'center', marginBottom: 8,
  },
  // Suspect sprite background box
  spriteBox: {
    alignSelf: 'center',
    width: 200,
    height: 210,
    backgroundColor: 'rgba(20, 20, 82, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    overflow: 'hidden',
  },
  suspectCard: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, borderRadius: 4,
    padding: 16, marginHorizontal: 16, marginBottom: 16,
  },
  suspectName: { ...FONTS.display, fontSize: FONT_SIZES.lg, color: COLORS.text_primary, marginBottom: 2 },
  suspectInfo: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary, marginBottom: 4 },
  suspectRelation: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.accent_teal, marginBottom: 10 },
  alibiBox: {
    backgroundColor: COLORS.bg_mid, borderLeftWidth: 3,
    borderLeftColor: COLORS.accent_purple, padding: 10, borderRadius: 2,
  },
  alibiText: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary, lineHeight: 20, fontStyle: 'italic' },
  continueBtn: {
    backgroundColor: COLORS.accent_gold, marginHorizontal: 16,
    borderRadius: 4, paddingVertical: 16, alignItems: 'center',
  },
  continueBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.bg_dark, letterSpacing: 2 },
});