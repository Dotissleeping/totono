import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { playSFX } from '../hooks/useSFX';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

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

export default function VisualNovelBox({ speaker, lines: rawLines, onComplete, style }) {
  const lines = rawLines
    ? rawLines.flatMap(l => splitLines(l)).slice(0, 4)
    : [];

  const [lineIdx, setLineIdx]     = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const blinkAnim                 = useRef(new Animated.Value(1)).current;
  const intervalRef               = useRef(null);

  // Blink animation
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

  // Reset when rawLines changes (new dialogue)
  useEffect(() => {
    setLineIdx(0);
    setDisplayed('');
    setDone(false);
  }, [rawLines]);

  // Type out line when lineIdx changes
  useEffect(() => {
    if (!lines || lines.length === 0) return;

    const currentLine = lines[lineIdx];
    if (!currentLine) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setDisplayed('');
    setDone(false);

    let i = 0;

    intervalRef.current = setInterval(() => {
      i++;
      // Use the string directly, not state, to avoid closure issues
      setDisplayed(currentLine.substring(0, i));

      if (i % 2 === 0) {
        playSFX('voice');
      }

      if (i >= currentLine.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDone(true);
      }
    }, 38);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lineIdx, rawLines]);

  function handleTap() {
    // Skip to full line if still typing
    if (!done) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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
      {speaker ? <Text style={styles.speaker}>{speaker}</Text> : null}
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