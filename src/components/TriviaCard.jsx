import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

export default function TriviaCard({ trivia, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  function handleSelect(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === trivia.correctIndex;
    onAnswer && onAnswer(correct, idx);
  }

  function getOptionStyle(idx) {
    if (!answered) return styles.option;
    if (idx === trivia.correctIndex) return [styles.option, styles.optionCorrect];
    if (idx === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  }

  function getOptionTextStyle(idx) {
    if (!answered) return styles.optionText;
    if (idx === trivia.correctIndex) return [styles.optionText, styles.optionTextCorrect];
    if (idx === selected && idx !== trivia.correctIndex) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDim];
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{trivia.question}</Text>
      <View style={styles.options}>
        {trivia.options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={getOptionStyle(idx)}
            onPress={() => handleSelect(idx)}
            activeOpacity={answered ? 1 : 0.8}
          >
            <Text style={styles.optionLabel}>{String.fromCharCode(65 + idx)}.</Text>
            <Text style={getOptionTextStyle(idx)}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {answered && (
        <View style={styles.explanation}>
          <Text style={styles.explanationLabel}>
            {selected === trivia.correctIndex ? '✓ CORRECT' : '✗ INCORRECT'}
          </Text>
          <Text style={styles.explanationText}>{trivia.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  question: {
    ...FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_primary,
    lineHeight: 26,
    marginBottom: 20,
  },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 14,
    gap: 10,
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(76,217,100,0.1)',
  },
  optionWrong: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(232,57,74,0.1)',
  },
  optionDim: {
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  optionLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_gold,
    minWidth: 20,
  },
  optionText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    flex: 1,
    lineHeight: 20,
  },
  optionTextCorrect: { color: COLORS.success },
  optionTextWrong:   { color: COLORS.error },
  optionTextDim:     { color: COLORS.text_muted },
  explanation: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.bg_mid,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent_teal,
  },
  explanationLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_teal,
    marginBottom: 4,
  },
  explanationText: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 20,
  },
});
