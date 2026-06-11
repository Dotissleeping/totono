import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG = require('../../assets/images/backgrounds/bg_loading.png');
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#TOTONO';

function useGlitchText(original, interval = 80) {
  const [text, setText] = useState(original);
  const frame = useRef(0);

  useEffect(() => {
    let iterations = 0;
    const timer = setInterval(() => {
      setText(
        original.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i < iterations) return original[i];
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('')
      );
      iterations += 0.4;
      if (iterations >= original.length) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [original]);

  return text;
}

export default function LoadingScreen({ navigation }) {
  const glitchedTitle = useGlitchText('TOTONO');

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Home'), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <Text style={styles.title}>{glitchedTitle}</Text>
        <Text style={styles.subtitle}>ミステリと言う勿れ</Text>
        <ActivityIndicator color={COLORS.accent_gold} size="large" style={styles.spinner} />
        <Text style={styles.tagline}>Don't Call It Mystery</Text>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    ...FONTS.display,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text_primary,
    letterSpacing: 10,
    marginBottom: 8,
  },
  subtitle: {
    ...FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.text_secondary,
    letterSpacing: 3,
    marginBottom: 40,
  },
  spinner: { marginBottom: 24 },
  tagline: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 4,
  },
});