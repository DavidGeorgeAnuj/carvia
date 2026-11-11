# CARVIA — Android App

A dark-themed, production-quality Android app replicating [carvia-india.vercel.app](https://carvia-india.vercel.app/) built with **React Native (Expo)**.

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

## Running the App

### Prerequisites
- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- Android Studio with an emulator **or** Expo Go app on your phone

### Steps

```bash
# 1. Navigate to the project
cd C:\Users\david.george\.gemini\antigravity\scratch\carvia-app

# 2. Install dependencies (already done)
npm install

# 3. Start the dev server
npx expo start

# 4a. Press 'a' to open on Android emulator
# 4b. OR scan the QR code with Expo Go on your phone
```

### Build a standalone APK (EAS Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build Android APK
eas build --platform android --profile preview
```

---

## Design System

| Token | Value |
|---|---|
| Background | `#0D1110` (near-black) |
| Primary accent | `#2FD987` (electric green) |
| Secondary accent | `#3B9EFF` (parking blue) |
| Card surface | `#1A201E` |
| Typography | Space Grotesk (headings) + Inter (body) |

---

## Project Structure

```
carvia-app/
├── App.js                        # Root navigator
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
└── app.json                      # Expo config (CARVIA branding)
```

---

## Mock Data

All data is realistic and Bengaluru-based:
- **Parking spots**: Nexus Koramangala, Forum Mall, BBMP Indiranagar, Prestige Tech Park, Phoenix Marketcity
- **EV stations**: Tata Power EZ Charge, Ather Grid, BESCOM EVCS, ChargeZone, bp Pulse
- **Connectors**: CCS2, CHAdeMO, Type 2 AC, Ather Grid

> To connect a real backend, replace `src/data/mockData.js` exports with API calls.
