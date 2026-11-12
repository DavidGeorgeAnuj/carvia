# CARVIA — Android App

A dark-themed, production-quality Android app replicating [carvia-india.vercel.app](https://carvia-india.vercel.app/) built with **React Native (Expo)**.

- **Official Repository:** [https://github.com/DavidGeorgeAnuj/carvia](https://github.com/DavidGeorgeAnuj/carvia)
- **Maintainer:** DavidGeorgeAnuj (davidgeorgeanuj@gmail.com)

---

## Features

| Screen | What it does |
|---|---|
| 🏠 **Home** | Greeting, quick-action cards, nearby spots, stats dashboard, recent activity |
| 🅿️ **Smart Parking** | Search, filter, sort, map view with pins, spot cards with availability bars |
| 📋 **Parking Detail** | Floor map, booking modal, duration selector, price breakdown, confirmation |
| ⚡ **EV Charging** | Station list, connector badges, real-time availability stats |
| 🔌 **EV Detail** | Connector selector, live charging session timer, cost estimator |
| 👤 **Profile** | Vehicle cards with battery indicator, stats, settings, payment info |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Version | **1.0.1** |
| SDK | Expo **58** (`expo ~58.0.24`) |
| Runtime | React Native **0.88.1**, React **19.3**, Hermes |
| Navigation | React Navigation 7 (bottom tabs + nested native stacks) |
| UI | Custom dark design system, `expo-linear-gradient`, `react-native-svg` |
| Fonts | Space Grotesk + Inter (`@expo-google-fonts/*`, loaded with `expo-font`) |
| Native config | CNG — no `android/` or `ios/` folders are committed |

The app currently uses **React Navigation**, not Expo Router. `index.js` registers `App.js` with `registerRootComponent`, and `App.js` defines the tab/stack tree.

---

## Running the App

### Prerequisites

- **Node.js** `22.13+` or `24.3+` (required by Expo 58 / RN 0.88 — Node 18 is not supported)
- **Android Studio** with an emulator, **or** a physical Android device with **Expo Go for SDK 58**
- No global Expo/EAS CLI install is needed — use `npx` (this project uses npm; there is no `bun.lock`)

### Install and start

```bash
# 1. Install dependencies
npm install
```

There are two ways to run the app. **You do not need Expo Go.**

**Option A — Development build (no Expo Go)**

```bash
npm run android   # expo run:android: generates android/, builds a debug APK, installs & launches it
```

This compiles a native debug build with Gradle and installs it directly on the emulator/device. It needs **JDK 17+** and the Android SDK (`ANDROID_HOME`). The generated `android/` and `ios/` folders are git-ignored — never edit them by hand; configure native behavior in `app.json`.

```powershell
# Typical Windows setup for the native build
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm run android
```

**Option B — Expo Go**

```bash
npx expo start --android   # opens the project in Expo Go
```

Expo Go only contains Expo's bundled native modules, so use Option A once you add a library with native code.

### Start an Android emulator (Windows)

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"

# List available AVDs
& "$sdk\emulator\emulator.exe" -list-avds

# Boot one (example AVD name)
& "$sdk\emulator\emulator.exe" -avd Medium_Phone_API_37.0

# Verify the device is connected before running the app
& "$sdk\platform-tools\adb.exe" devices
```

Then run `npm run android` from the project root.

### Expo Go on a physical device

1. Install **Expo Go** from the Play Store (it must support SDK 58).
2. Make sure phone and computer are on the same Wi-Fi.
3. Run `npm start` and scan the QR code.
4. If the LAN connection is blocked, retry with `npx expo start --tunnel`.

### Useful scripts

| Command | Description |
|---|---|
| `npm start` | Start Metro / dev server |
| `npm run android` | Start Metro and open on Android |
| `npm run ios` | Start Metro and open on iOS (macOS only) |
| `npm run web` | Start the web target |

### Adding dependencies

Always install Expo/React Native packages through Expo so versions match the SDK:

```bash
npx expo install <package>
```

A library with native code cannot run in Expo Go — it requires a development build (`npx expo run:android`) or an EAS build.

### Build a standalone Android app (EAS Build)

```bash
# Login and configure (eas.json is generated)
npx eas-cli@latest login
npx eas-cli@latest build:configure

# Production build (AAB for Play Store)
npx eas-cli@latest build --platform android

# Installable APK (requires a "preview" profile with buildType: "apk" in eas.json)
npx eas-cli@latest build --platform android --profile preview
```

---

## Project Structure

```
carvia_app/
├── index.js                      # Entry point — registerRootComponent(App)
├── App.js                        # Root navigator: tabs + nested stacks, font loading
├── app.json                      # Expo config (branding, icons, plugins)
├── assets/                       # App icon, adaptive icon layers, splash, favicon
├── src/
│   ├── theme/
│   │   └── colors.js             # Design tokens
│   ├── data/
│   │   └── mockData.js           # Realistic Bengaluru mock data
│   ├── components/
│   │   ├── UIComponents.js       # Reusable: Button, Card, Chip, Badge…
│   │   └── CustomTabBar.js       # Animated floating tab bar
│   └── screens/
│       ├── HomeScreen.js
│       ├── ParkingScreen.js
│       ├── ParkingDetailScreen.js
│       ├── EVScreen.js
│       ├── EVDetailScreen.js
│       └── ProfileScreen.js
└── AGENTS.md                     # Conventions for AI-assisted development
```

### Navigation

- Bottom tabs (custom `CustomTabBar`): **Home**, **Parking**, **EV**, **Profile**
- Each tab hosts its own native stack:
  - Home → `ParkingDetail`, `EVDetail`
  - Parking → `ParkingDetail`
  - EV → `EVDetail`
  - Profile (single screen)
- Headers are hidden; screens draw their own top bars with safe-area insets.

---

## Design System

| Token | Value |
|---|---|
| Background | `#0D1110` (near-black) |
| Elevated surface | `#141918` |
| Card surface | `#1A201E` |
| Primary accent | `#2FD987` (electric green) |
| Secondary accent | `#3B9EFF` (parking blue) |
| Text primary / secondary | `#F0F4F2` / `#8A9E96` |
| Border | `#1E2D29` |
| Typography | Space Grotesk (headings) + Inter (body) |

Tokens live in `src/theme/colors.js`; font families are loaded once in `App.js` and referenced by name.

---

## Mock Data

All data is realistic and Bengaluru-based:
- **Parking spots**: Nexus Koramangala, Forum Mall, BBMP Indiranagar, Prestige Tech Park, Phoenix Marketcity
- **EV stations**: Tata Power EZ Charge, Ather Grid, BESCOM EVCS, ChargeZone, bp Pulse
- **Connectors**: CCS2, CHAdeMO, Type 2 AC, Ather Grid

> To connect a real backend, replace `src/data/mockData.js` exports with API calls.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Expo Go crashes or shows an SDK mismatch | Install the Expo Go build matching **SDK 58**, or run `npx expo start --android` and accept the install prompt |
| Emulator not detected | `adb devices` must list a `device`, not `offline`; restart the AVD or `adb kill-server` |
| Config changes not applied | Restart Metro with a cleared cache: `npx expo start -c` |
| Dependency warnings | Run `npx expo-doctor` and `npx expo install --fix` |
| Wrong status bar / splash in Expo Go | Native splash and status bar config only fully apply in a development or release build |
| Windows native build fails with "Filename longer than 260 characters" (Ninja) | Upgrade `ninja.exe` in `$env:LOCALAPPDATA\Android\Sdk\cmake\<version>\bin` to Ninja 1.12+ (which supports Windows long paths) or install CMake 3.31+ |
