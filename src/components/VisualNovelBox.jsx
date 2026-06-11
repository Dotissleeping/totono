import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { playSFX } from '../hooks/useSFX';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

// Map sprite name to voice SFX
const VOICE_MAP = {
  detective:          'detective',
  suspect_tall_male:  'tall_male',
  suspect_female:     'female',
  suspect_hooded:     'hooded',
  suspect_stocky_male:'stocky_male',
};

export default function VisualNovelBox({ speaker, sprite, lines, onComplete, style }) {
  const [lineIdx, setLineIdx]     = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const blinkAnim                 = useRef(new Animated.Value(1)).current;
  const typingRef                 = useRef(null);
  const charRef                   = useRef(0);

  const voice = VOICE_MAP[sprite] || 'detective';

  // Blink animation for ▼
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  // Type out current line
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    setDisplayed('');
    setDone(false);
    charRef.current = 0;

    const currentLine = lines[lineIdx];

    typingRef.current = setInterval(async () => {
      charRef.current++;
      setDisplayed(currentLine.slice(0, charRef.current));

      // Play voice blip on every other character (not every char = less spammy)
      if (charRef.current % 2 === 0) {
        playSFX(voice);
      }

      if (charRef.current >= currentLine.length) {
        clearInterval(typingRef.current);
        setDone(true);
      }
    }, 35);

    return () => clearInterval(typingRef.current);
  }, [lineIdx, lines]);

  function handleTap() {
    // If still typing — skip to end of current line
    if (!done) {
      clearInterval(typingRef.current);
      setDisplayed(lines[lineIdx]);
      setDone(true);
      return;
    }

    // Play next line tap sound
    playSFX('next_line');

    // Advance to next line
    if (lineIdx < lines.length - 1) {
      setLineIdx(i => i + 1);
    } else {
      // All lines done
      onComplete && onComplete();
    }
  }

  if (!lines || lines.length === 0) return null;

  return (
    <TouchableOpacity style={[styles.box, style]} onPress={handleTap} activeOpacity={0.9}>
      {speaker && <Text style={styles.speaker}>{speaker}</Text>}
      <Text style={styles.text}>{displayed}</Text>
      {done && (
        <Animated.Text style={[styles.arrow, { opacity: blinkAnim }]}>
          {lineIdx < lines.length - 1 ? '▼' : '■'}
        </Animated.Text>
      )}
      <Text style={styles.hint}>
        {lineIdx + 1}/{lines.length}
      </Text>
    </TouchableOpacity>
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
    minHeight: 100,
  },
  speaker: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent_gold,
    marginBottom: 8,
  },
  text: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_primary,
    lineHeight: 24,
    minHeight: 50,
  },
  arrow: {
    color: COLORS.accent_gold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'right',
    marginTop: 8,
  },
  hint: {
    ...FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    textAlign: 'right',
    marginTop: 4,
  },
});