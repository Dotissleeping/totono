import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

export default function TheoryInput({ onSubmit, loading }) {
  const [text, setText] = useState('');

  function handleSubmit() {
    if (text.trim().length < 20) return;
    onSubmit && onSubmit(text.trim());
  }

  const charCount = text.length;
  const ready = charCount >= 20;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>YOUR THEORY</Text>
      <Text style={styles.hint}>Who did it, how, and most importantly — why?</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={8}
        placeholder="Type your theory here... The more psychological depth you show, the higher your score."
        placeholderTextColor={COLORS.text_muted}
        textAlignVertical="top"
        editable={!loading}
      />
      <View style={styles.footer}>
        <Text style={[styles.charCount, ready && styles.charCountReady]}>
          {charCount} chars {!ready ? `(min 20)` : '✓'}
        </Text>
        <TouchableOpacity
          style={[styles.button, (!ready || loading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!ready || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{loading ? 'JUDGING...' : 'SUBMIT THEORY'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_gold,
    marginBottom: 4,
  },
  hint: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 14,
    color: COLORS.text_primary,
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.base,
    lineHeight: 22,
    minHeight: 160,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  charCount: {
    ...FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
  },
  charCountReady: {
    color: COLORS.success,
  },
  button: {
    backgroundColor: COLORS.accent_red,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  buttonText: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_primary,
  },
});
