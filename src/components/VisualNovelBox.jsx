import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  // Memoize line splitting so it doesn't recompute on every render
  const lines = useMemo(() => {
    return rawLines
      ? rawLines.flatMap(l => splitLines(l)).slice(0, 4)
      : [];
  }, [rawLines]);

  const [lineIdx, setLineIdx]     = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);

  // Blink only starts after done — saves animation overhead while typing
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const blinkRef  = useRef(null);

  useEffect(() => {
    if (done) {
      blinkRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      blinkRef.current.start();
    } else {
      if (blinkRef.current) {
        blinkRef.current.stop();
        blinkRef.current = null;
      }
      blinkAnim.setValue(1);
    }
    return () => {
      if (blinkRef.current) {
        blinkRef.current.stop();
        blinkRef.current = null;
      }
    };
  }, [done]);

  const intervalRef = useRef(null);

  // Reset when rawLines changes
  useEffect(() => {
    setLineIdx(0);
    setDisplayed('');
    setDone(false);
  }, [rawLines]);

  // Type out current line
  useEffect(() => {
    if (!lines || lines.length === 0) return;

    const currentLine = lines[lineIdx];
    if (!currentLine) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setDisplayed('');
    setDone(false);

    let i = 0;

    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(currentLine.substring(0, i));

      // Blip every 3 chars
      if (i % 3 === 0) {
        playSFX('voice');
      }

      if (i >= currentLine.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDone(true);
      }
    }, 22);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lineIdx, rawLines]);

  function handleTap() {
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