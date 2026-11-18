<div align="center">

# ⚡ CARVIA

### One platform. Every journey.
**Next-generation smart EV charging and parking navigation for India.**

[![React Native](https://img.shields.io/badge/React_Native-0.88.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![Google Maps](https://img.shields.io/badge/Google_Maps-API_Integrated-4285F4?style=flat-square&logo=googlemaps&logoColor=white)](https://cloud.google.com/maps-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-2FD987?style=flat-square)](LICENSE)
[![Theme: Dark Automotive](https://img.shields.io/badge/Theme-Dark_Automotive-0D1110?style=flat-square&color=2FD987)](#design-system)

[Key Features](#-highlights) • [Maintainers](#-maintainers) • [Core Modules](#-core-screens--modules) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start)

</div>

---

## 🌟 Highlights

**CARVIA** is a connected automotive mobile application designed for electric vehicle drivers and urban commuters. Built with an obsidian dark automotive aesthetic (`#0D1110`), CARVIA combines real-time **EV Supercharging discovery** with **Smart Parking reservations** in one seamless platform.

- 🗺️ **Interactive Google Map Engine:** Real-time dark-themed vector map with custom animated power badges (`150 kW`, `60 kW`, `₹40/h`) and live availability rings.
- ⚡ **EV Charging Telemetry:** Dynamic connector status (CCS2, Type 2, CHAdeMO), real-time charging session simulation, kWh counter, and live tariff calculators.
- 🅿️ **Smart Parking Reservation:** Instant slot vacancy indicators, covered parking filters, and hourly slot booking with digital receipts.
- 🔀 **Instant Mode Switcher:** Switch between EV Charging and Parking modes on the fly with a single tap.
- 🎨 **Bespoke Automotive UI:** High-contrast emerald green (`#2FD987`) and electric blue (`#3B9EFF`) accents on obsidian black, paired with Space Grotesk & Inter typography.

---

## 👥 Maintainers

| Maintainer | GitHub | Contact |
| :--- | :--- | :--- |
| **David George Anuj** | [@DavidGeorgeAnuj](https://github.com/DavidGeorgeAnuj) | `davidgeorgeanuj@gmail.com` |
| **Joe Lonney** | [@joelonney](https://github.com/joelonney) | `joelonney@gmail.com` |

---

## 📱 Core Screens & Modules

| Screen | Focus | Highlights |
| :--- | :--- | :--- |
| 🗺️ **Live Map** | Primary UI | Fullscreen Google Map, mode switcher, Bengaluru area search, filter chips, and bottom preview cards |
| ⚡ **EV Stations** | Charging Feed | Station list sorted by speed, distance, or price with live connector badges (CCS2, Type 2, CHAdeMO) |
| 🅿️ **Smart Parking** | Parking Feed | Real-time vacancy bars, covered parking indicators, CCTV filters, and hourly rates |
| 🔌 **Live Session** | Telemetry | Animated battery SoC % arc, live kWh counter, charging timer, and emergency stop button |
| 👤 **Garage & Profile**| Vehicle Hub | Registered EVs (Tata Nexon EV Max), wallet balance, charging history, and app preferences |

---

## 🛠️ Tech Stack

- **Framework:** React Native `0.88.1` & Expo SDK `58`
- **Navigation:** React Navigation 7 (Floating bottom tab bar + nested native stacks)
- **Mapping:** Google Maps JavaScript API with Night Theme styling + `react-native-maps` for native Android
- **Styling & Assets:** Custom dark automotive design system with `expo-linear-gradient` and `react-native-svg`
- **Typography:** Space Grotesk (Headings) + Inter (Body) via `@expo-google-fonts`
- **Alternative Implementation:** Complete Flutter 3 (Dart) architecture available in `lib/`

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** `20+` or `22+`
- **Android Studio** with emulator, or a physical Android device with **Expo Go**

### 1. Clone the repository
```bash
git clone https://github.com/DavidGeorgeAnuj/carvia.git
cd carvia
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and add your Google Maps API key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
> **Note:** The Google Maps API key is kept strictly in your local `.env` file (git-ignored) and is never committed to source control.

### 4. Launch Development Server
```bash
# Start Metro bundler (Web, Android, iOS)
npm start

# Or directly target Android:
npm run android

# Or preview in your browser:
npm run web
```

---

## 🎨 Design System Tokens

| Token | Hex | Role |
| :--- | :--- | :--- |
| `bg` | `#0D1110` | Obsidian deep canvas |
| `surface` | `#141918` | Elevated container surface |
| `card` | `#1A201E` | Card surface |
| `primary` | `#2FD987` | Electric emerald green (EV brand accent) |
| `secondary`| `#3B9EFF` | Parking cobalt blue |
| `warning` | `#FFB930` | Limited availability / busy |
| `error` | `#FF5A5A` | Full / occupied / stop |
| `textPrimary`| `#F0F4F2`| Crisp headings & readout text |
| `textSecondary`| `#8A9E98`| Subtitles & metadata |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
