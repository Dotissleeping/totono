import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import VisualNovelBox from '../components/VisualNovelBox';
import { useMusic } from '../hooks/useMusic';
import { generateCase } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_case_intro.png');
const MUSIC = require('../../assets/audio/music_case_intro.mp3');

function splitLines(text) {
  // Split long text into dialogue chunks of ~100 chars at sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const lines = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > 120) {
      if (current) lines.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export default function CaseIntroScreen({ navigation }) {
  useMusic(MUSIC);

  const [caseData, setCaseData]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [phase, setPhase]             = useState('intro');
  const [suspectIdx, setSuspectIdx]   = useState(0);
  const [dialogueDone, setDialogueDone] = useState(false);

  useEffect(() => { loadCase(); }, []);

  async function loadCase() {
    setLoading(true);
    setError(null);
    try {
      const data = await generateCase();
      setCaseData(data);
      setPhase('intro');
      setDialogueDone(false);
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
      setDialogueDone(false);
    } else {
      if (suspectIdx < caseData.suspects.length - 1) {
        setSuspectIdx(i => i + 1);
        setDialogueDone(false);
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
    const settingLines = splitLines(caseData.setting);
    const victimLines  = [
      `Victim: ${caseData.victim.name}, ${caseData.victim.age} years old.`,
      `Occupation: ${caseData.victim.occupation}.`,
      caseData.victim.description,
    ];
    const allLines = [...settingLines, ...victimLines];

    return (
      <BackgroundWrapper source={BG}>
        <View style={styles.container}>
          <View style={styles.caseHeader}>
            <Text style={styles.caseLabel}>CASE FILE</Text>
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          </View>

          <View style={styles.spriteBox}>
            <CharacterSprite name="detective" size={170} />
          </View>

          <VisualNovelBox
            speaker="DETECTIVE"
            sprite="detective"
            lines={allLines}
            onComplete={() => setDialogueDone(true)}
          />

          {dialogueDone && (
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
              <Text style={styles.continueBtnText}>MEET THE SUSPECTS ▶</Text>
            </TouchableOpacity>
          )}
        </View>
      </BackgroundWrapper>
    );
  }

  // --- Suspects phase ---
  const suspect = caseData.suspects[suspectIdx];
  const isLast  = suspectIdx === caseData.suspects.length - 1;

  const suspectLines = [
    `My name is ${suspect.name}.`,
    `I'm ${suspect.age} years old. I work as a ${suspect.occupation}.`,
    `${suspect.relationship}.`,
    `As for my alibi — ${suspect.alibi}`,
  ];

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <Text style={styles.suspectCounterText}>
          SUSPECT {suspectIdx + 1} / {caseData.suspects.length}
        </Text>

        <View style={styles.spriteBox}>
          <CharacterSprite name={suspect.sprite} size={170} />
        </View>

        <VisualNovelBox
          speaker={suspect.name}
          sprite={suspect.sprite}
          lines={suspectLines}
          onComplete={() => setDialogueDone(true)}
        />

        {dialogueDone && (
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueBtnText}>
              {isLast ? 'BEGIN INVESTIGATION ▶' : 'NEXT SUSPECT ▶'}
            </Text>
          </TouchableOpacity>
        )}
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
  caseHeader: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  caseLabel: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_teal,
    letterSpacing: 5, marginBottom: 4,
  },
  caseTitle: {
    ...FONTS.display, fontSize: FONT_SIZES.xl, color: COLORS.text_primary,
    textAlign: 'center', letterSpacing: 2,
  },
  spriteBox: {
    alignSelf: 'center',
    width: 200, height: 210,
    backgroundColor: 'rgba(20, 20, 82, 0.85)',
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 8, alignItems: 'center', justifyContent: 'flex-end',
    marginBottom: 12, overflow: 'hidden',
  },
  suspectCounterText: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted,
    letterSpacing: 3, textAlign: 'center', marginBottom: 8,
  },
  continueBtn: {
    backgroundColor: COLORS.accent_gold, marginHorizontal: 16,
    borderRadius: 4, paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  continueBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.bg_dark, letterSpacing: 2 },
});