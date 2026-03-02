# 📱 FocusTabs

*Your Mind in 3 Steps.*

FocusTabs is a minimalist, local-first goal management app designed with FAANG-level architecture and a 2025 aesthetic. It allows you to focus on just 3 daily goals at a time, providing a distraction-free environment.

## 🌟 Features

- **3 Goal Limit**: Focus on what matters most
- **AI-Powered**: Deep integration with Gemini AI for goal refinement and task decomposition
- **Offline-First**: All data stored locally on your device (No Login Required)
- **SQLite Database**: Reliable and persistent storage
- **Midnight Reset**: Start fresh every day
- **Gradient Cards**: Beautiful 2025-level UI
- **Ad-Free**: No distractions, just your goals

## 🚀 Tech Stack

- React Native + Expo SDK 55
- TypeScript (100% type safe)
- Zustand for state management
- SQLite for local storage
- Expo Router for navigation
- Gemini AI (Google Generative AI)
- Lucide Icons for beautiful icons
- ESLint + Prettier for code quality

## 🔧 Installation

1. **Clone the repository**

```bash
git clone https://github.com/neurodivergent-dev/focustabs.git
cd focustabs
```

2. **Install dependencies**

```bash
npm install --legacy-peer-deps
```

3. **Start the development server**

```bash
npx expo start
```

4. **Run on your device or emulator**

```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## 🧹 Troubleshooting

If you encounter any issues with dependencies or Metro bundler:

### Windows
```bash
# Using PowerShell script
./clean-reinstall.ps1
```

### macOS/Linux
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm cache clean --force
npm install --legacy-peer-deps
```

## 🔐 Privacy

FocusTabs respects your privacy:
- **No Login Required**: Start using the app immediately
- **Privacy-First**: No data leaves your device
- **No Analytics**: No tracking or advertisements

## 👨‍💻 Author

Melih Can Demir
