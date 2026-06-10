import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

const BG = require('../../assets/images/backgrounds/bg_loading.png');

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BackgroundWrapper source={BG}>
      <View style={styles.container}>
        <Text style={styles.title}>TOTONO</Text>
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
  spinner: {
    marginBottom: 24,
  },
  tagline: {
    ...FONTS.ui,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text_muted,
    letterSpacing: 4,
  },
});
