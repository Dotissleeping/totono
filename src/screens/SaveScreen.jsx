import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { useMusic } from '../hooks/useMusic';
import { playSFX } from '../hooks/useSFX';
import { getAllSaveSlots, deleteSaveSlot } from '../services/storageService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_home.png');
const MUSIC = require('../../assets/audio/music_home.mp3');

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const STAGE_LABELS = {
  clues:         '🔍 Investigating Clues',
  interrogation: '💬 Interrogating',
  theory:        '📝 Writing Theory',
};

const DIFF_COLORS = {
  easy:   COLORS.success,
  medium: COLORS.accent_gold,
  hard:   COLORS.accent_red,
};

export default function SaveScreen({ navigation }) {
  useMusic(MUSIC);
  const [slots, setSlots]     = useState([null, null, null, null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSlots(); }, []);

  async function loadSlots() {
    setLoading(true);
    const data = await getAllSaveSlots();
    setSlots(data);
    setLoading(false);
  }

  function handleLoad(slot, save) {
    playSFX('click');
    // Navigate to where they left off
    const screen =
      save.stage === 'interrogation' ? 'Interrogation' :
      save.stage === 'theory'        ? 'Theory' :
      'Clues';

    navigation.navigate(screen, {
      caseData:   save.caseData,
      difficulty: save.difficulty,
      saveSlot:   slot,
    });
  }

  function handleDelete(slot) {
    Alert.alert(
      'Delete Save',
      `Delete Save File ${slot + 1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            playSFX('wrong');
            await deleteSaveSlot(slot);
            loadSlots();
          }
        }
      ]
    );
  }

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>

        <Text style={styles.title}>SAVE FILES</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.accent_gold} size="large" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {slots.map((save, i) => (
              <View key={i} style={styles.slot}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotNum}>SLOT {i + 1}</Text>
                  {save && (
                    <Text style={[styles.diffBadge, { color: DIFF_COLORS[save.difficulty] || COLORS.text_muted }]}>
                      {save.difficulty?.toUpperCase()}
                    </Text>
                  )}
                </View>

                {save ? (
                  <>
                    <Text style={styles.caseTitle}>{save.caseData?.title || 'Unknown Case'}</Text>
                    <Text style={styles.stageLine}>{STAGE_LABELS[save.stage] || '🔍 In Progress'}</Text>
                    <Text style={styles.dateLine}>Saved: {formatDate(save.savedAt)}</Text>
                    <View style={styles.slotActions}>
                      <TouchableOpacity style={styles.loadBtn} onPress={() => handleLoad(i, save)} activeOpacity={0.8}>
                        <Text style={styles.loadBtnText}>CONTINUE ▶</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(i)} activeOpacity={0.8}>
                        <Text style={styles.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>— Empty —</Text>
                )}
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 60, paddingHorizontal: 20 },
  backBtn: { marginBottom: 20 },
  backText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.accent_teal },
  title: { ...FONTS.display, fontSize: FONT_SIZES.xl, color: COLORS.text_primary, letterSpacing: 4, marginBottom: 20 },
  scroll: { flex: 1 },
  slot: {
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, borderRadius: 6,
    padding: 16, marginBottom: 14,
  },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  slotNum: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_muted, letterSpacing: 3 },
  diffBadge: { ...FONTS.ui, fontSize: FONT_SIZES.xs, letterSpacing: 2 },
  caseTitle: { ...FONTS.display, fontSize: FONT_SIZES.md, color: COLORS.text_primary, marginBottom: 4 },
  stageLine: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.accent_teal, marginBottom: 2 },
  dateLine: { ...FONTS.body, fontSize: FONT_SIZES.xs, color: COLORS.text_muted, marginBottom: 12 },
  slotActions: { flexDirection: 'row', gap: 10 },
  loadBtn: {
    flex: 1, backgroundColor: COLORS.accent_gold,
    borderRadius: 4, paddingVertical: 12, alignItems: 'center',
  },
  loadBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.bg_dark },
  deleteBtn: {
    width: 44, borderWidth: 1, borderColor: COLORS.error,
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.error },
  emptyText: { ...FONTS.body, fontSize: FONT_SIZES.sm, color: COLORS.text_muted, textAlign: 'center', paddingVertical: 10 },
});