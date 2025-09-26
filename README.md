# NYTHC Mobile App

**Not Your Typical Homecoming** - Norfolk State University's official homecoming mobile platform.

## 🎯 Project Overview

NYTHC is a white-label mobile application designed specifically for Norfolk State University's homecoming events. The app centralizes event management, enables community engagement, facilitates in-app commerce, and provides comprehensive tools for alumni, students, and guests.

### Target Users
- **Alumni**: Verified through LinkedIn integration, exclusive content access
- **Students**: Current Norfolk State students with student-specific features
- **Guests**: Public access with upgrade paths to premium features

## 📱 Current Development Status

### ✅ Completed Screens

#### 1. Splash Screen
- **Purpose**: Brand introduction and app initialization
- **Features**:
  - Norfolk State University branding with gold accents
  - Smooth 60fps animations using Reanimated 3
  - Dark mode optimized design
  - Full accessibility support (VoiceOver/TalkBack)
  - Reduced motion support
  - 2.5-second duration with fade transition

#### 2. Welcome Screen
- **Purpose**: Onboarding carousel showcasing key features
- **Features**:
  - 4-slide feature introduction carousel
  - Interactive pagination dots with haptic feedback
  - Smooth swipe navigation between slides
  - Get Started and Skip CTA buttons
  - Visual mockups of core app functionality
  - Parallax animations for engaging transitions

### 🚧 In Development
- Role Selection Screen (Next: Alumni/Student/Guest)
- Authentication Flow
- LinkedIn Verification System

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Animations**: React Native Reanimated 3
- **Styling**: StyleSheet with custom design system
- **State Management**: Zustand (planned)

### Key Dependencies
```json
{
  "expo": "~50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "@react-navigation/native": "^6.1.0",
  "react-native-reanimated": "~3.6.0",
  "react-native-gesture-handler": "~2.14.0",
  "expo-linear-gradient": "~12.7.0"
}
```

## 🎨 Design System

### Color Palette (Dark Mode First)
```css
/* Primary Norfolk State Colors */
--primary-gold: #D6C238;
--secondary-teal: #5C9F8A;

/* Dark Mode Base */
--background-dark: #000100;
--surface-dark: #1A1A1B;
--surface-elevated: #252526;

/* Text Hierarchy */
--text-primary: #FEFEFE;
--text-secondary: #B8B8B8;
--text-tertiary: #878787;
```

### Typography
- **H1**: 28pt/34pt Semibold (Main titles)
- **H2**: 22pt/28pt Semibold (Section headers)
- **Body**: 16pt/22pt Regular (Primary content)
- **Caption**: 13pt/18pt Regular (Metadata)

### Spacing & Layout
- **Grid**: 8pt base unit system
- **Touch Targets**: Minimum 44x44pt
- **Border Radius**: Cards 12pt, Buttons 8pt, Pills 20pt
- **Safe Areas**: Dynamic notch/home indicator support

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI
- iOS Simulator or Android Emulator
- React Native development environment

### Installation
```bash
# Clone the repository
git clone https://github.com/jermill/NYTHCAPP.git
cd NYTHCAPP

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Development Commands
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test

# Build for production
npm run build
```

## 📁 Project Structure

```
nythc-mobile/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── screens/           # Screen components
│   │   ├── SplashScreen.tsx
│   │   └── WelcomeScreen.tsx
│   ├── components/        # Reusable UI components
│   ├── navigation/        # Navigation configuration
│   ├── types/            # TypeScript type definitions
│   │   └── navigation.ts
│   └── utils/            # Constants and utilities
│       └── constants.ts
└── assets/               # Images, fonts, and static assets
```

## 🎯 Development Roadmap

### Phase 1: Foundation Screens (Current)
- [x] Splash Screen
- [x] Welcome Screen
- [ ] Role Selection (Alumni/Student/Guest)
- [ ] Authentication Flow
- [ ] LinkedIn Verification
- [ ] Permissions Setup

### Phase 2: Core Features (Planned)
- [ ] Events Hub with filtering
- [ ] Event Detail & Ticket Selection
- [ ] Checkout & Payment Processing
- [ ] Community Chat Rooms
- [ ] Alumni Verification System

### Phase 3: Advanced Features (Future)
- [ ] Friend Finder with Maps
- [ ] Media Gallery & Live Streaming
- [ ] Local Guides & Campus Maps
- [ ] Merchandise Store
- [ ] Push Notifications

## 🔧 Technical Standards

### Performance Requirements
- **Animation FPS**: 60fps minimum for all animations
- **Load Time**: < 3 seconds for splash screen
- **Touch Response**: < 100ms for all interactions
- **Memory Usage**: < 200MB average
- **Battery Optimization**: Dark mode OLED optimization

### Accessibility Compliance
- **WCAG AAA**: Text contrast ratios in dark mode
- **Screen Readers**: Full VoiceOver/TalkBack support
- **Touch Targets**: Minimum 44x44pt size
- **Reduced Motion**: Respects system accessibility settings
- **Dynamic Type**: iOS font scaling support

### Code Quality
- **TypeScript**: Strict mode enabled with proper type definitions
- **ESLint**: Consistent code formatting and best practices
- **Testing**: Unit tests for critical functionality
- **Documentation**: Comprehensive inline code comments

## 🎨 Brand Guidelines

### Norfolk State University Identity
- **Primary Color**: Gold (#D6C238) - Used for all primary actions and accents
- **Secondary Color**: Teal (#5C9F8A) - Used for secondary actions
- **Typography**: System fonts (SF Pro on iOS, Roboto on Android)
- **Tone**: Professional, inclusive, celebratory

### Dark Mode Strategy
- **Default Theme**: Dark mode is primary, not an option
- **OLED Optimization**: Pure black backgrounds for battery efficiency
- **Content Hierarchy**: Clear visual hierarchy with appropriate contrast
- **Gold Accents**: Strategic use of Norfolk State gold throughout

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0+
- **Devices**: iPhone 8+ through iPhone 15 Pro Max
- **Features**: Face ID/Touch ID, Dynamic Island support, Haptic Feedback

### Android
- **Minimum Version**: Android 8.0 (API 26)+
- **Devices**: Modern Android devices with 4GB+ RAM
- **Features**: Biometric authentication, Adaptive icons, Material You theming

## 🔐 Security & Privacy

### Data Protection
- **Alumni Verification**: LinkedIn OAuth integration
- **Secure Storage**: Expo Secure Store for sensitive data
- **API Security**: JWT token-based authentication
- **Privacy First**: Minimal data collection, transparent policies

### Compliance
- **COPPA**: Appropriate safeguards for users under 13
- **GDPR**: European user data protection compliance
- **University Policies**: Norfolk State IT security standards

## 🤝 Contributing

### Development Workflow
1. Create feature branches from `main`
2. Follow TypeScript and ESLint configurations
3. Test on both iOS and Android platforms
4. Submit pull requests with detailed descriptions
5. Ensure accessibility compliance

### Code Style
- Use TypeScript strict mode
- Follow React Native best practices
- Maintain dark mode design consistency
- Write comprehensive tests for new features

## 📧 Support & Contact

- **Development Team**: NYTHC Mobile Team
- **University**: Norfolk State University
- **Support Email**: support@nythc.com
- **Repository**: https://github.com/jermill/NYTHCAPP

## 📄 License

Copyright (c) 2025 Norfolk State University. All rights reserved.

This project is proprietary software developed specifically for Norfolk State University's homecoming events.

---

**Built with ❤️ for the Norfolk State University Spartan community**