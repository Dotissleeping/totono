import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import VisualNovelBox from '../components/VisualNovelBox';
import { useMusic } from '../hooks/useMusic';
import { playSFX } from '../hooks/useSFX';
import { generateCase } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_case_intro.png');
const MUSIC = require('../../assets/audio/music_case_intro.mp3');

function splitLines(text, maxLen = 110, maxLines = 4) {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const lines = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current) lines.push(current.trim());
      current = s;
    } else {
      current += s;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current.trim());
  return lines.slice(0, maxLines);
}

// Reference panel tabs — clues, suspects, crime scene
function ReferencePanel({ caseData }) {
  const [tab, setTab] = useState('clues');

  return (
    <View style={refStyles.container}>
      <View style={refStyles.tabs}>
        {['clues', 'suspects', 'scene'].map(t => (
          <TouchableOpacity
            key={t}
            style={[refStyles.tab, tab === t && refStyles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[refStyles.tabText, tab === t && refStyles.tabTextActive]}>
              {t === 'scene' ? 'SCENE' : t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={refStyles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'clues' && caseData.clues.map(c => (
          <View key={c.id} style={[refStyles.item, c.locked && refStyles.itemLocked]}>
            <Text style={refStyles.itemTitle}>{c.locked ? '🔒 ' : '📋 '}{c.title}</Text>
            {!c.locked && <Text style={refStyles.itemDesc}>{c.description}</Text>}
          </View>
        ))}

        {tab === 'suspects' && caseData.suspects.map(s => (
          <View key={s.id} style={refStyles.item}>
            <Text style={refStyles.itemTitle}>{s.name}</Text>
            <Text style={refStyles.itemMeta}>{s.occupation} · Age {s.age}</Text>
            <Text style={refStyles.itemDesc}>{s.relationship}</Text>
            <Text style={refStyles.alibi}>"{s.alibi}"</Text>
          </View>
        ))}

        {tab === 'scene' && (
          <>
            <View style={refStyles.item}>
              <Text style={refStyles.itemTitle}>VICTIM</Text>
              <Text style={refStyles.itemMeta}>{caseData.victim.name} · Age {caseData.victim.age}</Text>
              <Text style={refStyles.itemDesc}>{caseData.victim.occupation}</Text>
              <Text style={refStyles.itemDesc}>{caseData.victim.description}</Text>
            </View>
            <View style={refStyles.item}>
              <Text style={refStyles.itemTitle}>SETTING</Text>
              <Text style={refStyles.itemDesc}>{caseData.setting}</Text>
            </View>
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

export default function CaseIntroScreen({ navigation, route }) {
  const { difficulty = 'medium' } = route.params || {};
  useMusic(MUSIC);

  const [caseData, setCaseData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [phase, setPhase]               = useState('intro');
  const [suspectIdx, setSuspectIdx]     = useState(0);
  const [dialogueDone, setDialogueDone] = useState(false);
  const [showRef, setShowRef]           = useState(false);

  useEffect(() => { loadCase(); }, []);

  async function loadCase() {
    setLoading(true);
    setError(null);
    try {
      const data = await generateCase(difficulty);
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
    playSFX('click');
    setShowRef(false);
    if (phase === 'intro') {
      setPhase('suspects');
      setSuspectIdx(0);
      setDialogueDone(false);
    } else {
      if (suspectIdx < caseData.suspects.length - 1) {
        setSuspectIdx(i => i + 1);
        setDialogueDone(false);
      } else {
        navigation.navigate('Clues', { caseData, difficulty });
      }
    }
  }

  if (loading) {
    return (
      <BackgroundWrapper source={BG}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent_gold} size="large" />
          <Text style={styles.loadingText}>Crafting your mystery...</Text>
          <Text style={styles.loadingSubtext}>
            {difficulty === 'easy' ? '🔍 Easy Mode' : difficulty === 'hard' ? '💀 Hard Mode' : '🕵️ Medium Mode'}
          </Text>
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

  const suspect = phase === 'suspects' ? caseData.suspects[suspectIdx] : null;
  const isLast  = phase === 'suspects' && suspectIdx === caseData.suspects.length - 1;

  const introLines = useMemo(() => {
    if (!caseData) return [];
    return [
      ...splitLines(caseData.setting),
      `Victim: ${caseData.victim.name}, ${caseData.victim.age} years old.`,
      `${caseData.victim.occupation}.`,
    ].slice(0, 4);
  }, [caseData]);

  const suspectLines = useMemo(() => {
    if (!suspect) return [];
    return [
      `My name is ${suspect.name}.`,
      `I'm ${suspect.age} years old. I work as ${suspect.occupation}.`,
      `${suspect.relationship}.`,
      `My alibi — ${suspect.alibi}`,
    ];
  }, [suspect]);

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.caseLabel}>CASE FILE</Text>
            <Text style={styles.caseTitle} numberOfLines={1}>{caseData.title}</Text>
          </View>
          <TouchableOpacity
            style={[styles.refToggle, showRef && styles.refToggleActive]}
            onPress={() => setShowRef(r => !r)}
          >
            <Text style={styles.refToggleText}>📂</Text>
          </TouchableOpacity>
        </View>

        {showRef ? (
          <ReferencePanel caseData={caseData} />
        ) : (
          <>
            {phase === 'suspects' && (
              <Text style={styles.suspectCounterText}>
                SUSPECT {suspectIdx + 1} / {caseData.suspects.length}
              </Text>
            )}

            <View style={styles.spriteBox}>
              <CharacterSprite
                name={phase === 'intro' ? 'detective' : suspect?.sprite}
                size={170}
              />
            </View>

            <VisualNovelBox
              speaker={phase === 'intro' ? 'DETECTIVE' : suspect?.name}
              sprite={phase === 'intro' ? 'detective' : suspect?.sprite}
              lines={phase === 'intro' ? introLines : suspectLines}
              onComplete={() => setDialogueDone(true)}
            />

            {dialogueDone && (
              <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
                <Text style={styles.continueBtnText}>
                  {phase === 'intro'
                    ? 'MEET THE SUSPECTS ▶'
                    : isLast ? 'BEGIN INVESTIGATION ▶' : 'NEXT SUSPECT ▶'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 50, paddingBottom: 24 },
  center: { flex: 1, zIndex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { ...FONTS.ui, fontSize: FONT_SIZES.md, color: COLORS.text_primary, marginTop: 20, letterSpacing: 3 },
  loadingSubtext: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_muted, marginTop: 6 },
  errorText: { ...FONTS.body, fontSize: FONT_SIZES.base, color: COLORS.error, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  retryBtn: { backgroundColor: COLORS.accent_gold, borderRadius: 4, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 12 },
  retryBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.bg_dark },
  backLinkText: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 10,
  },
  headerLeft: { flex: 1 },
  caseLabel: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_teal, letterSpacing: 5, marginBottom: 2 },
  caseTitle: { ...FONTS.display, fontSize: FONT_SIZES.md, color: COLORS.text_primary },
  refToggle: {
    width: 40, height: 40, borderRadius: 4,
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, alignItems: 'center', justifyContent: 'center',
  },
  refToggleActive: { borderColor: COLORS.accent_gold, backgroundColor: COLORS.bg_mid },
  refToggleText: { fontSize: 18 },
  suspectCounterText: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted,
    letterSpacing: 3, textAlign: 'center', marginBottom: 6,
  },
  spriteBox: {
    alignSelf: 'center', width: 200, height: 210,
    backgroundColor: 'rgba(20, 20, 82, 0.85)',
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 8, alignItems: 'center', justifyContent: 'flex-end',
    marginBottom: 12, overflow: 'hidden',
  },
  continueBtn: {
    backgroundColor: COLORS.accent_gold, marginHorizontal: 16,
    borderRadius: 4, paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  continueBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.bg_dark, letterSpacing: 2 },
});

const refStyles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 16 },
  tabs: {
    flexDirection: 'row', borderWidth: 1,
    borderColor: COLORS.border_bright, borderRadius: 4,
    overflow: 'hidden', marginBottom: 10,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.border_bright },
  tabText: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted, letterSpacing: 2 },
  tabTextActive: { color: COLORS.text_primary },
  scroll: { flex: 1 },
  item: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 4,
    padding: 12, marginBottom: 8,
  },
  itemLocked: { opacity: 0.5 },
  itemTitle: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_gold, marginBottom: 4 },
  itemMeta: { ...FONTS.body, fontSize: FONT_SIZES.xs, color: COLORS.text_secondary, marginBottom: 4 },
  itemDesc: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, lineHeight: 20 },
  alibi: { ...FONTS.body, fontSize: FONT_SIZES.xs, color: COLORS.accent_purple, marginTop: 6, fontStyle: 'italic' },
});