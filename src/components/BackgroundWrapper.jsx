import React from 'react';
import { ImageBackground, StyleSheet, View, StatusBar } from 'react-native';
import { COLORS } from '../constants/colors';

export default function BackgroundWrapper({ source, children, style }) {
  if (source) {
    return (
      <ImageBackground source={source} style={[styles.fill, style]} resizeMode="cover">
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.overlay} />
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.fill, styles.fallback, style]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg_dark} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay_dark,
  },
  fallback: {
    backgroundColor: COLORS.bg_dark,
  },
});
