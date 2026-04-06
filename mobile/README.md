# PersonalLearningPro Mobile

React Native mobile application for PersonalLearningPro built with Expo.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your Firebase credentials and API URL

## Development

Start the development server:
```bash
npm start
```

Then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard components
│   └── chat/             # Chat components
├── lib/                   # Utilities and services
│   ├── api.ts            # API client
│   ├── firebase.ts       # Firebase configuration
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── constants/             # App constants
│   └── config.ts         # Configuration
└── types/                 # TypeScript types
```

## Features

- ✅ Firebase Authentication
- ✅ Tab Navigation (Dashboard, Tasks, Messages, Profile)
- ✅ NativeWind (Tailwind CSS)
- ✅ React Query for data fetching
- ✅ Secure token storage
- 🚧 AI Tutor Chat (coming soon)
- 🚧 Test Taking (coming soon)
- 🚧 Live Classes (coming soon)
- 🚧 Push Notifications (coming soon)

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

See `.env.example` for required environment variables.

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Troubleshooting

### Clear cache
```bash
npx expo start --clear
```

### Reset Metro bundler
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

## Documentation

See `.agent/spec/react-native-migration/` for detailed migration documentation.

## License

MIT
