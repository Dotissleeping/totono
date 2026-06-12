import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoadingScreen       from '../screens/LoadingScreen';
import HomeScreen          from '../screens/HomeScreen';
import DifficultyScreen    from '../screens/DifficultyScreen';
import SaveScreen          from '../screens/SaveScreen';
import CaseIntroScreen     from '../screens/CaseIntroScreen';
import CluesScreen         from '../screens/CluesScreen';
import InterrogationScreen from '../screens/InterrogationScreen';
import TriviaScreen        from '../screens/TriviaScreen';
import TheoryScreen        from '../screens/TheoryScreen';
import VerdictScreen       from '../screens/VerdictScreen';
import SettingsScreen      from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{ headerShown: false, gestureEnabled: false }}
      >
        <Stack.Screen name="Loading"       component={LoadingScreen} />
        <Stack.Screen name="Home"          component={HomeScreen} />
        <Stack.Screen name="Difficulty"    component={DifficultyScreen} />
        <Stack.Screen name="SaveFiles"     component={SaveScreen} />
        <Stack.Screen name="Settings"      component={SettingsScreen} />
        <Stack.Screen name="CaseIntro"     component={CaseIntroScreen} />
        <Stack.Screen name="Clues"         component={CluesScreen} />
        <Stack.Screen name="Trivia"        component={TriviaScreen} />
        <Stack.Screen name="Interrogation" component={InterrogationScreen} />
        <Stack.Screen name="Theory"        component={TheoryScreen} />
        <Stack.Screen name="Verdict"       component={VerdictScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}