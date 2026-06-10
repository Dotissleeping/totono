# TOTONO — AI Mystery Solving Game

> A short-form psychological mystery game inspired by "Don't Call It Mystery" (ミステリと言う勿れ)

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/Dotissleeping/totono.git
cd totono
npm install
npx expo install expo-av @react-native-async-storage/async-storage expo-font expo-splash-screen react-native-screens react-native-safe-area-context
npm install @react-navigation/native @react-navigation/stack
```

### 2. Environment
Create a `.env` file in the project root:
```
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```
Get a free Groq API key at: https://console.groq.com

### 3. Add Assets
Place your asset files in the correct directories:

**Characters** (`assets/images/characters/`) — 500x500px PNG transparent:
- `detective.png`
- `suspect_tall_male.png`
- `suspect_female.png`
- `suspect_hooded.png`
- `suspect_stocky_male.png`

**Backgrounds** (`assets/images/backgrounds/`) — 941x1672px PNG:
- `bg_home.png`, `bg_case_intro.png`, `bg_clues.png`
- `bg_interrogation.png`, `bg_trivia.png`, `bg_theory.png`
- `bg_verdict.png`, `bg_loading.png`

**Icons** (`assets/images/icon/`):
- `icon.png` — 1254x1254px
- `adaptive-icon.png` — 1024x1024px

**Audio** (`assets/audio/`) — MP3 looping:
- `music_home.mp3`, `music_case_intro.mp3`, `music_clues.mp3`
- `music_interrogation.mp3`, `music_trivia.mp3`, `music_theory.mp3`
- `music_verdict.mp3`

### 4. Run
```bash
npx expo start
```
Press `a` for Android emulator or scan QR code with Expo Go.

### 5. Build APK
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Screens
```
LoadingScreen → HomeScreen → CaseIntroScreen → CluesScreen ⇄ TriviaScreen
                                                     ↓
                                          InterrogationScreen
                                                     ↓
                                            TheoryScreen
                                                     ↓
                                            VerdictScreen → HomeScreen
```

## Tech Stack
- **Expo** (React Native)
- **Groq API** (Llama 3 70B) for AI
- **React Navigation** for screen flow
- **expo-av** for audio
- **AsyncStorage** for settings persistence
