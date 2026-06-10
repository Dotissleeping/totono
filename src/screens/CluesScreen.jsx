import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import ClueCard from '../components/ClueCard';
import { useMusic } from '../hooks/useMusic';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_clues.png');
const MUSIC = require('../../assets/audio/music_clues.mp3');

export default function CluesScreen({ navigation, route }) {
  const { caseData: initial } = route.params;
  const [caseData, setCaseData] = useState(initial);

  useMusic(MUSIC);

  const [tab, setTab] = useState('clues'); // 'clues' | 'suspects'

  function handleUnlock(clue) {
    const trivia = caseData.triviaQuestions.find(q => q.clueId === clue.id);
    if (trivia) {
      navigation.navigate('Trivia', {
        trivia,
        clueId: clue.id,
        caseData,
        onUnlocked: (unlockedClueId, updatedCase) => {
          setCaseData(updatedCase);
        },
      });
    }
  }

  const unlockedCount = caseData.clues.filter(c => !c.locked).length;
  const totalCount    = caseData.clues.length;

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.caseLabel}>CASE FILE</Text>
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          </View>
          <View style={styles.clueCount}>
            <Text style={styles.clueCountText}>{unlockedCount}/{totalCount}</Text>
            <Text style={styles.clueCountLabel}>CLUES</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'clues' && styles.tabActive]}
            onPress={() => setTab('clues')}
          >
            <Text style={[styles.tabText, tab === 'clues' && styles.tabTextActive]}>CLUES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'suspects' && styles.tabActive]}
            onPress={() => setTab('suspects')}
          >
            <Text style={[styles.tabText, tab === 'suspects' && styles.tabTextActive]}>SUSPECTS</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'clues' && caseData.clues.map(clue => (
            <ClueCard
              key={clue.id}
              clue={clue}
              onUnlock={handleUnlock}
            />
          ))}

          {tab === 'suspects' && caseData.suspects.map(s => (
            <View key={s.id} style={styles.suspectRow}>
              <Text style={styles.suspectName}>{s.name}</Text>
              <Text style={styles.suspectMeta}>{s.occupation} · Age {s.age}</Text>
              <Text style={styles.suspectRelation}>{s.relationship}</Text>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.interrogateBtn}
            onPress={() => navigation.navigate('Interrogation', { caseData })}
            activeOpacity={0.8}
          >
            <Text style={styles.interrogateBtnText}>INTERROGATE ▶</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  caseLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_teal,
    letterSpacing: 4,
    marginBottom: 4,
  },
  caseTitle: {
    ...FONTS.display,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_primary,
    maxWidth: 240,
  },
  clueCount: { alignItems: 'center' },
  clueCountText: {
    ...FONTS.display,
    fontSize: FONT_SIZES.xl,
    color: COLORS.accent_gold,
  },
  clueCountLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 2,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.border_bright,
  },
  tabText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 3,
  },
  tabTextActive: {
    color: COLORS.text_primary,
  },
  scroll: { flex: 1 },
  suspectRow: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  suspectName: {
    ...FONTS.display,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_primary,
    marginBottom: 2,
  },
  suspectMeta: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    marginBottom: 4,
  },
  suspectRelation: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_teal,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  interrogateBtn: {
    backgroundColor: COLORS.accent_red,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  interrogateBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_primary,
    letterSpacing: 2,
  },
});
