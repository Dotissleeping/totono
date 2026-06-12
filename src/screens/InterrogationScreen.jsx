import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import VisualNovelBox from '../components/VisualNovelBox';
import { useMusic } from '../hooks/useMusic';
import { playSFX } from '../hooks/useSFX';
import { interrogate } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_interrogation.png');
const MUSIC = require('../../assets/audio/music_interrogation.mp3');

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

// Reference panel
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

export default function InterrogationScreen({ navigation, route }) {
  const { caseData, difficulty = 'medium' } = route.params;
  useMusic(MUSIC);

  // Who is selected to talk to
  const CHARACTERS = [
    { id: 'detective', name: 'Detective', sprite: 'detective' },
    ...caseData.suspects.map(s => ({ id: s.id, name: s.name, sprite: s.sprite })),
  ];

  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [activeLines, setActiveLines]   = useState(
    splitLines(`Ask me anything about "${caseData.title}". I'm here to help you find the truth.`)
  );
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [dialogueDone, setDialogueDone] = useState(true);
  const [showRef, setShowRef]           = useState(false);
  const [history, setHistory]           = useState([]);

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    playSFX('click');
    setInput('');
    setLoading(true);
    setDialogueDone(false);

    const newHistory = [...history, { role: 'user', content: `[Asking ${selectedChar.name}]: ${q}` }];
    setHistory(newHistory);

    try {
      const reply = await interrogate(caseData, q, newHistory.slice(-6), difficulty);
      setHistory(h => [...h, { role: 'assistant', content: reply }]);
      setActiveLines(splitLines(reply));
    } catch (e) {
      setActiveLines(['(Failed to get a response. Check your connection.)']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BackgroundWrapper source={BG}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>INTERROGATION</Text>
              <Text style={styles.headerCase} numberOfLines={1}>{caseData.title}</Text>
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
              {/* Character selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.charSelector}
                contentContainerStyle={styles.charSelectorContent}
              >
                {CHARACTERS.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.charChip, selectedChar.id === c.id && styles.charChipActive]}
                    onPress={() => {
                      setSelectedChar(c);
                      playSFX('click');
                      setActiveLines(splitLines(`You're now speaking with ${c.name}. What do you want to ask?`));
                      setDialogueDone(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.charChipText, selectedChar.id === c.id && styles.charChipTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Sprite */}
              <View style={styles.spriteBox}>
                <CharacterSprite name={selectedChar.sprite} size={150} />
              </View>

              {/* Dialogue */}
              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={COLORS.accent_gold} size="small" />
                  <Text style={styles.loadingText}>...</Text>
                </View>
              ) : (
                <VisualNovelBox
                  speaker={selectedChar.name}
                  sprite={selectedChar.sprite}
                  lines={activeLines}
                  onComplete={() => setDialogueDone(true)}
                />
              )}
            </>
          )}

          {/* Input row — always visible */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={`Ask ${selectedChar.name}...`}
              placeholderTextColor={COLORS.text_muted}
              multiline={false}
              maxLength={200}
              editable={!loading}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
              activeOpacity={0.8}
            >
              <Text style={styles.sendBtnText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Proceed button */}
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={() => {
              playSFX('click');
              navigation.navigate('Theory', { caseData, difficulty });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedBtnText}>SUBMIT THEORY ▶</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, zIndex: 1, paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 10,
  },
  headerTitle: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_red, letterSpacing: 4, marginBottom: 2 },
  headerCase: { ...FONTS.display, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, maxWidth: 260 },
  refToggle: {
    width: 40, height: 40, borderRadius: 4,
    backgroundColor: COLORS.bg_surface, borderWidth: 1,
    borderColor: COLORS.border_bright, alignItems: 'center', justifyContent: 'center',
  },
  refToggleActive: { borderColor: COLORS.accent_gold },
  refToggleText: { fontSize: 18 },
  charSelector: { maxHeight: 44, marginBottom: 8 },
  charSelectorContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  charChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border_bright,
    backgroundColor: COLORS.bg_surface,
  },
  charChipActive: { backgroundColor: COLORS.accent_gold, borderColor: COLORS.accent_gold },
  charChipText: { ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.text_secondary, letterSpacing: 1 },
  charChipTextActive: { color: COLORS.bg_dark },
  spriteBox: {
    alignSelf: 'center', width: 180, height: 190,
    backgroundColor: 'rgba(20, 20, 82, 0.85)',
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 8, alignItems: 'center', justifyContent: 'flex-end',
    marginBottom: 10, overflow: 'hidden',
  },
  loadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 4, padding: 16, minHeight: 60,
  },
  loadingText: { ...FONTS.body, fontSize: FONT_SIZES.lg, color: COLORS.text_muted },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg_surface,
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 4, paddingHorizontal: 12, paddingVertical: 10,
    color: COLORS.text_primary, fontFamily: 'monospace',
    fontSize: FONT_SIZES.base, height: 44,
  },
  sendBtn: {
    backgroundColor: COLORS.accent_gold, width: 44, height: 44,
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border, opacity: 0.5 },
  sendBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.base, color: COLORS.bg_dark },
  proceedBtn: {
    backgroundColor: COLORS.accent_red, marginHorizontal: 12,
    marginBottom: 16, borderRadius: 4, paddingVertical: 14, alignItems: 'center',
  },
  proceedBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, letterSpacing: 2 },
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