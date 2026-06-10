import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

export default function ClueCard({ clue, onUnlock, style }) {
  const [expanded, setExpanded] = useState(false);

  if (clue.locked) {
    return (
      <TouchableOpacity style={[styles.card, styles.locked, style]} onPress={() => onUnlock && onUnlock(clue)}>
        <View style={styles.header}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={[styles.title, styles.lockedText]}>{clue.title}</Text>
        </View>
        <Text style={styles.lockedHint}>Answer a trivia question to unlock</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.title}>{clue.title}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>
      {expanded && (
        <View style={styles.body}>
          <Text style={styles.description}>{clue.description}</Text>
          <View style={styles.divider} />
          <Text style={styles.significanceLabel}>SIGNIFICANCE</Text>
          <Text style={styles.significance}>{clue.significance}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg_surface,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  locked: {
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 16 },
  lockIcon: { fontSize: 16 },
  title: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_primary,
    flex: 1,
  },
  lockedText: {
    color: COLORS.text_muted,
  },
  chevron: {
    color: COLORS.text_secondary,
    fontSize: FONT_SIZES.xs,
  },
  lockedHint: {
    ...FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    marginTop: 4,
    marginLeft: 24,
  },
  body: {
    marginTop: 12,
  },
  description: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  significanceLabel: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent_teal,
    marginBottom: 4,
  },
  significance: {
    ...FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_secondary,
    lineHeight: 20,
  },
});
