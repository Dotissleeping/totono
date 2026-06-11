import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
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

function splitLines(text) {
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

// Pick a random suspect sprite for the detective's responses
const SUSPECT_SPRITES = [
  'suspect_tall_male',
  'suspect_female',
  'suspect_hooded',
  'suspect_stocky_male',
];

export default function InterrogationScreen({ navigation, route }) {
  const { caseData } = route.params;
  useMusic(MUSIC);

  const [messages, setMessages]       = useState([]);
  const [activeLines, setActiveLines] = useState(
    splitLines(`I'm listening. Ask me anything about the case — "${caseData.title}".`)
  );
  const [activeSpeaker, setActiveSpeaker] = useState('DETECTIVE');
  const [activeSprite, setActiveSprite]   = useState('detective');
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [dialogueDone, setDialogueDone]   = useState(false);
  const scrollRef = useRef(null);

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    playSFX('click');
    setInput('');
    setLoading(true);
    setDialogueDone(false);

    const history = [...messages, { role: 'user', content: q }];
    setMessages(history);

    try {
      const reply = await interrogate(caseData, q, history.slice(-6));
      setMessages(m => [...m, { role: 'assistant', content: reply }]);

      // Pick a random suspect to "speak"
      const sprite = SUSPECT_SPRITES[Math.floor(Math.random() * SUSPECT_SPRITES.length)];
      const suspect = caseData.suspects.find(s => s.sprite === sprite);

      setActiveSprite(sprite);
      setActiveSpeaker(suspect?.name || 'WITNESS');
      setActiveLines(splitLines(reply));
    } catch (e) {
      setActiveSprite('detective');
      setActiveSpeaker('DETECTIVE');
      setActiveLines(['(Failed to get a response. Check your connection.)']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BackgroundWrapper source={BG}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>INTERROGATION</Text>
          <Text style={styles.headerCase}>{caseData.title}</Text>
        </View>

        {/* Sprite */}
        <View style={styles.spriteBox}>
          <CharacterSprite name={activeSprite} size={170} />
        </View>

        {/* Dialogue box */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.accent_gold} size="small" />
            <Text style={styles.loadingText}>...</Text>
          </View>
        ) : (
          <VisualNovelBox
            speaker={activeSpeaker}
            sprite={activeSprite}
            lines={activeLines}
            onComplete={() => setDialogueDone(true)}
          />
        )}

        {/* Previous questions */}
        <ScrollView
          ref={scrollRef}
          style={styles.historyScroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.filter(m => m.role === 'user').map((m, i) => (
            <Text key={i} style={styles.historyItem}>▶ {m.content}</Text>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor={COLORS.text_muted}
            multiline
            maxLength={200}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
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

        {/* Proceed to theory */}
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() => {
            playSFX('click');
            navigation.navigate('Theory', { caseData });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedBtnText}>SUBMIT THEORY ▶</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, zIndex: 1, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 12 },
  headerTitle: {
    ...FONTS.ui, fontSize: FONT_SIZES.xs, color: COLORS.accent_red,
    letterSpacing: 4, marginBottom: 2,
  },
  headerCase: { ...FONTS.display, fontSize: FONT_SIZES.sm, color: COLORS.text_primary },
  spriteBox: {
    alignSelf: 'center',
    width: 200, height: 210,
    backgroundColor: 'rgba(20, 20, 82, 0.85)',
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 8, alignItems: 'center', justifyContent: 'flex-end',
    marginBottom: 12, overflow: 'hidden',
  },
  loadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 4, padding: 16, minHeight: 60,
  },
  loadingText: { ...FONTS.body, fontSize: FONT_SIZES.lg, color: COLORS.text_muted },
  historyScroll: { flex: 1, paddingHorizontal: 16, marginBottom: 8 },
  historyItem: {
    ...FONTS.body, fontSize: FONT_SIZES.xs, color: COLORS.text_muted,
    lineHeight: 20, marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg_surface,
    borderWidth: 1, borderColor: COLORS.border_bright,
    borderRadius: 4, padding: 12,
    color: COLORS.text_primary, fontFamily: 'monospace',
    fontSize: FONT_SIZES.base, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.accent_gold, width: 44, height: 44,
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border, opacity: 0.5 },
  sendBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.base, color: COLORS.bg_dark },
  proceedBtn: {
    backgroundColor: COLORS.accent_red, marginHorizontal: 12,
    marginBottom: 20, borderRadius: 4, paddingVertical: 14, alignItems: 'center',
  },
  proceedBtnText: { ...FONTS.ui, fontSize: FONT_SIZES.sm, color: COLORS.text_primary, letterSpacing: 2 },
});