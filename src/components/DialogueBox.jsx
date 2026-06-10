import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

export default function DialogueBox({ speaker, text, style }) {
  return (
    <View style={[styles.box, style]}>
      {speaker ? (
        <Text style={styles.speaker}>{speaker}</Text>
      ) : null}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.overlay_dark,
    borderWidth: 1,
    borderColor: COLORS.border_bright,
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  speaker: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_gold,
    marginBottom: 6,
  },
  text: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 22,
  },
});
