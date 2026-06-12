import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { playSFX } from '../hooks/useSFX';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

function splitLines(text, maxPerLine = 100, maxLines = 4) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const lines = [];
  let current = '';

  for (const s of sentences) {
    if ((current + s).length > maxPerLine) {
      if (current) lines.push(current.trim());
      current = s;
    } else {
      current += s;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current.trim());

  // Hard cap at maxLines
  return lines.slice(0, maxLines);
}

export default function VisualNovelBox({ speaker, lines: rawLines, onComplete, style }) {
  // Flatten and re-split to enforce 3-4 line max per page
  const lines = rawLines
    ? rawLines.flatMap(l => splitLines(l)).slice(0, 4)
    : [];

  const [lineIdx, setLineIdx]   = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const blinkAnim                 = useRef(new Animated.Value(1)).current;
  const typingRef                 = useRef(null);
  const charRef                   = useRef(0);

  // Blink ▼
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

  // Reset when lines change
  useEffect(() => {
    setLineIdx(0);
    setDisplayed('');
    setDone(false);
  }, [rawLines]);

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

      // Voice blip every 2 chars
      if (charRef.current % 2 === 0) {
        playSFX('voice');
      }

      if (charRef.current >= currentLine.length) {
        clearInterval(typingRef.current);
        setDone(true);
      }
    }, 35);

    return () => clearInterval(typingRef.current);
  }, [lineIdx, lines]);

  function handleTap() {
    // Skip to end of current line
    if (!done) {
      clearInterval(typingRef.current);
      setDisplayed(lines[lineIdx]);
      setDone(true);
      return;
    }

    playSFX('next_line');

    if (lineIdx < lines.length - 1) {
      setLineIdx(i => i + 1);
    } else {
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
      <Text style={styles.hint}>{lineIdx + 1}/{lines.length}</Text>
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
    minHeight: 110,
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