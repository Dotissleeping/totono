import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import CharacterSprite from '../components/CharacterSprite';
import { useMusic } from '../hooks/useMusic';
import { interrogate } from '../services/groqService';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG    = require('../../assets/images/backgrounds/bg_interrogation.png');
const MUSIC = require('../../assets/audio/music_interrogation.mp3');

export default function InterrogationScreen({ navigation, route }) {
  const { caseData } = route.params;

  useMusic(MUSIC);

  const [messages, setMessages]   = useState([
    { role: 'assistant', content: `I'm here to help you investigate "${caseData.title}". Ask me anything about the case, the suspects, or the evidence.` }
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const scrollRef = useRef(null);

  async function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const history = updatedMessages.slice(-6); // last 6 messages for context
      const reply = await interrogate(caseData, q, history);
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: '(Failed to get response. Check your connection.)' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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
          <CharacterSprite name="detective" size={60} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>INTERROGATION</Text>
            <Text style={styles.headerCase}>{caseData.title}</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
              ]}
            >
              {msg.role === 'assistant' && (
                <Text style={styles.bubbleLabel}>DETECTIVE</Text>
              )}
              <Text style={[
                styles.bubbleText,
                msg.role === 'user' && styles.bubbleTextUser,
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator color={COLORS.accent_gold} size="small" />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          )}
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
            maxLength={300}
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

        {/* Proceed */}
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() => navigation.navigate('Theory', { caseData })}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedBtnText}>SUBMIT THEORY ▶</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  headerText: { flex: 1 },
  headerTitle: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_red,
    letterSpacing: 4,
    marginBottom: 2,
  },
  headerCase: {
    ...FONTS.display,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_primary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 4,
    padding: 12,
  },
  bubbleAI: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    alignSelf: 'flex-start',
  },
  bubbleUser: {
    backgroundColor: COLORS.accent_purple,
    alignSelf: 'flex-end',
  },
  bubbleLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_gold,
    marginBottom: 4,
  },
  bubbleText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    padding: 8,
  },
  typingText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_muted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 12,
    color: COLORS.text_primary,
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.base,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.accent_gold,
    width: 44,
    height: 44,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  sendBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.base,
    color: COLORS.bg_dark,
  },
  proceedBtn: {
    backgroundColor: COLORS.accent_red,
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  proceedBtnText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_primary,
    letterSpacing: 2,
  },
});
