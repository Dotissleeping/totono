import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { useMusic } from '../hooks/useMusic';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_clues.png');
const MUSIC = require('../../assets/audio/music_clues.mp3');

function ClueCard({ clue, onUnlock }) {
  const [expanded, setExpanded] = useState(false);

  if (clue.locked) {
    return (
      <TouchableOpacity style={[styles.card, styles.lockedCard]} onPress={() => onUnlock(clue)} activeOpacity={0.8}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedTitle}>{clue.title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
      <View style={styles.cardRow}>
        <Text style={styles.cardIcon}>📋</Text>
        <Text style={styles.cardTitle}>{clue.title}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>
      {expanded && (
        <View style={styles.cardBody}>
          <Text style={styles.cardDesc}>{clue.description}</Text>
          <View style={styles.sigBox}>
            <Text style={styles.sigText}>{clue.significance}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function CluesScreen({ navigation, route }) {
  const { caseData: initial } = route.params;
  const [caseData, setCaseData] = useState(initial);
  const [tab, setTab] = useState('clues');

  useMusic(MUSIC);

  function handleUnlock(clue) {
    const trivia = caseData.triviaQuestions.find(q => q.clueId === clue.id);
    if (trivia) {
      navigation.navigate('Trivia', {
        trivia, clueId: clue.id, caseData,
        onUnlocked: (id, updated) => setCaseData(updated),
      });
    }
  }

  const unlockedCount = caseData.clues.filter(c => !c.locked).length;

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.caseLabel}>CASE FILE</Text>
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          </View>
          <View style={styles.clueCount}>
            <Text style={styles.clueCountText}>{unlockedCount}/{caseData.clues.length}</Text>
            <Text style={styles.clueCountLabel}>CLUES</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {['clues', 'suspects'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'clues' && caseData.clues.map(clue => (
            <ClueCard key={clue.id} clue={clue} onUnlock={handleUnlock} />
          ))}
          {tab === 'suspects' && caseData.suspects.map(s => (
            <View key={s.id} style={styles.suspectRow}>
              <Text style={styles.suspectName}>{s.name}</Text>
              <Text style={styles.suspectMeta}>{s.occupation} · {s.relationship}</Text>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.interrogateBtn} onPress={() => navigation.navigate('Interrogation', { caseData })} activeOpacity={0.8}>
            <Text style={styles.interrogateBtnText}>INTERROGATE ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 16,
  },
  caseLabel: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_teal, letterSpacing: 4, marginBottom: 4 },
  caseTitle: { ...FONTS.display, fontSize: FONT_SIZES.md, color: COLORS.text_primary, maxWidth: 220 },
  clueCount: { alignItems: 'center' },
  clueCountText: { ...FONTS.display, fontSize: FONT_SIZES.xl, color: COLORS.accent_gold },
  clueCountLabel: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted, letterSpacing: 2 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border_bright, borderRadius: 4, overflow: 'hidden',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.border_bright },
  tabText: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted, letterSpacing: 3 },
  tabTextActive: { color: COLORS.text_primary },
  scroll: { flex: 1 },
  card: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, borderRadius: 4,
    padding: 14, marginBottom: 10, marginHorizontal: 16,
  },
  lockedCard: { borderColor: COLORS.border, opacity: 0.6, flexDirection: 'row', alignItems: 'center', gap: 10 },
  lockIcon: { fontSize: 16 },
  lockedTitle: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.text_muted, flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 16 },
  cardTitle: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, flex: 1 },
  chevron: { color: COLORS.text_secondary, fontSize: FONT_SIZES.xs },
  cardBody: { marginTop: 12 },
  cardDesc: { ...FONTS.body, fontSize: FONT_SIZES.base, color: COLORS.text_primary, lineHeight: 22, marginBottom: 10 },
  sigBox: { borderLeftWidth: 3, borderLeftColor: COLORS.accent_teal, paddingLeft: 10 },
  sigText: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary, lineHeight: 20 },
  suspectRow: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 4, padding: 14, marginHorizontal: 16, marginBottom: 10,
  },
  suspectName: { ...FONTS.display, fontSize: FONT_SIZES.md, color: COLORS.text_primary, marginBottom: 2 },
  suspectMeta: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_secondary },
  actions: { padding: 16, paddingBottom: 32 },
  interrogateBtn: { backgroundColor: COLORS.accent_red, borderRadius: 4, paddingVertical: 16, alignItems: 'center' },
  interrogateBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, letterSpacing: 2 },
});