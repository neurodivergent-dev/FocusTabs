# 📱 FocusTabs

*Your Mind in 3 Steps.*

FocusTabs is a minimalist, local-first goal management app designed with FAANG-level architecture and a 2025 aesthetic. It allows you to focus on just 3 daily goals at a time, providing a distraction-free environment.

## 🌟 Features

- **3 Goal Limit**: Focus on what matters most
- **Offline-First**: All data stored locally on your device
- **SQLite Database**: Reliable and persistent storage
- **Midnight Reset**: Start fresh every day
- **Gradient Cards**: Beautiful 2025-level UI
- **Ad-Free**: No distractions, just your goals

## 🚀 Tech Stack

- React Native + Expo SDK 52
- TypeScript (100% type safe)
- Zustand for state management
- SQLite for local storage
- Expo Router for navigation
- Lucide Icons for beautiful icons
- ESLint + Prettier for code quality

## 🔧 Installation

1. **Clone the repository**

```bash
git clone https://github.com/melihcandemir/focustabs.git
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

## 📱 Usage

1. **Add a goal**: Tap the "Add Goal" button and enter your goal
2. **Complete a goal**: Tap the checkbox to mark a goal as complete
3. **Edit a goal**: Tap the edit icon to modify a goal
4. **Delete a goal**: Tap the trash icon to remove a goal
5. **Check stats**: View your progress in the Stats tab
6. **Adjust settings**: Configure the app in the Settings tab

## 🔐 Privacy

FocusTabs respects your privacy:
- No data leaves your device
- No analytics tracking
- No cloud sync (unless you explicitly enable it in a future version)
- No advertisements

## 🛣️ Roadmap

- [ ] Dark mode support
- [ ] Optional cloud sync
- [ ] Claude-powered reflection assistant
- [ ] Focus timer integration
- [ ] Weekly stats view

## 📄 License

MIT License

## 👨‍💻 Author

Melih Can Demir 