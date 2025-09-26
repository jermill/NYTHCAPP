import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  Image
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  useReducedMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
interface SplashScreenProps {
  onComplete: () => void;
}

interface LoadingDotsProps {
  opacity: Animated.SharedValue<number>;
}

// Constants
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOGO_SIZE = 180;
const COLORS = {
  primaryGold: '#D6C238',
  backgroundDark: '#000100',
  surfaceDark: '#1A1A1B',
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B8B8',
};

// Animated Loading Dots Component
const LoadingDots: React.FC<LoadingDotsProps> = ({ opacity }) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const animateDots = () => {
      dot1.value = withTiming(1, { duration: 400 }, () => {
        dot1.value = withTiming(0, { duration: 400 });
      });

      dot2.value = withDelay(200, withTiming(1, { duration: 400 }, () => {
        dot2.value = withTiming(0, { duration: 400 });
      }));

      dot3.value = withDelay(400, withTiming(1, { duration: 400 }, () => {
        dot3.value = withTiming(0, { duration: 400 }, () => {
          runOnJS(animateDots)();
        });
      }));
    };

    const timer = setTimeout(animateDots, 1000);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const createDotStyle = (dotValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value * interpolate(dotValue.value, [0, 1], [0.3, 1]),
      transform: [{ scale: interpolate(dotValue.value, [0, 1], [0.8, 1]) }],
    }));

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.dot, createDotStyle(dot1)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot2)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot3)]} />
    </View>
  );
};

// Main Splash Screen Component
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Hooks
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  // Animated Values
  const logoScale = useSharedValue(reducedMotion ? 1 : 0.8);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(reducedMotion ? 0 : 20);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  // Animated Styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  // Effects
  useEffect(() => {
    // Announce to screen readers
    AccessibilityInfo.announceForAccessibility(
      'NYTHC App Loading. Not Your Typical Homecoming.'
    );

    // Start animations
    const startAnimations = () => {
      if (reducedMotion) {
        // Simplified animations for reduced motion
        logoOpacity.value = withTiming(1, { duration: 300 });
        titleOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
        subtitleOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
        loaderOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
      } else {
        // Full animation sequence
        logoScale.value = withSpring(1.0, { damping: 0.8, stiffness: 100 });
        logoOpacity.value = withTiming(1, { duration: 500 });

        titleTranslateY.value = withDelay(300, withTiming(0, { duration: 400 }));
        titleOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

        subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
        loaderOpacity.value = withDelay(1000, withTiming(1, { duration: 200 }));
      }

      // Exit transition
      screenOpacity.value = withDelay(2500, withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      }));
    };

    startAnimations();
  }, [reducedMotion]);

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.surfaceDark]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>NYTHC</Text>
            <Text style={styles.logoSubtext}>NSU</Text>
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title} accessibilityRole="header">
            NYTHC
          </Text>
        </Animated.View>

        {/* Subtitle Section */}
        <Animated.View style={subtitleAnimatedStyle}>
          <Text style={styles.subtitle}>
            Not Your Typical Homecoming
          </Text>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 60 }]}>
        <LoadingDots opacity={loaderOpacity} />
      </View>
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 3,
    borderColor: COLORS.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primaryGold,
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.primaryGold,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryGold,
    marginHorizontal: 4,
  },
});

export default SplashScreen;