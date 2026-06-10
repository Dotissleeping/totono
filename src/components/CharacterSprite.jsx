import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const SPRITES = {
  detective:          require('../../assets/images/characters/detective.png'),
  suspect_tall_male:  require('../../assets/images/characters/suspect_tall_male.png'),
  suspect_female:     require('../../assets/images/characters/suspect_female.png'),
  suspect_hooded:     require('../../assets/images/characters/suspect_hooded.png'),
  suspect_stocky_male:require('../../assets/images/characters/suspect_stocky_male.png'),
};

export default function CharacterSprite({ name, size = 160, style }) {
  const source = SPRITES[name];
  if (!source) return null;

  return (
    <View style={[styles.container, style]}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
