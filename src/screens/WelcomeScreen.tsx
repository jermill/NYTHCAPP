import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Types
interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  visual: string;
}

// Constants
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - 48;
const HERO_HEIGHT = SCREEN_HEIGHT * 0.4;

const COLORS = {
  primaryGold: '#D6C238',
  secondaryTeal: '#5C9F8A',
  backgroundDark: '#000100',
  surfaceDark: '#1A1A1B',
  surfaceElevated: '#252526',
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B8B8',
  textTertiary: '#878787',
};

// Mock Data
const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'events',
    icon: 'calendar',
    title: 'Your Homecoming Schedule',
    description: 'Discover exclusive events, from alumni mixers to student showcases. Filter by your interests and never miss a moment.',
    visual: 'events-mockup'
  },
  {
    id: 'community',
    icon: 'shield-checkmark',
    title: 'Verified Spartan Community',
    description: 'Connect with fellow graduates through secure, LinkedIn-verified chat rooms and networking events.',
    visual: 'community-mockup'
  },
  {
    id: 'digital',
    icon: 'phone-portrait',
    title: 'Seamless Mobile Experience',
    description: 'Digital tickets, secure payments, and real-time updates - everything you need in your pocket.',
    visual: 'mobile-mockup'
  },
  {
    id: 'local',
    icon: 'map',
    title: 'Navigate Like a Local',
    description: 'Campus maps, parking availability, restaurant recommendations, and venue policies at your fingertips.',
    visual: 'map-mockup'
  }
];

// Pagination Dots Component
const PaginationDots: React.FC<{
  slides: OnboardingSlide[];
  currentIndex: number;
  onDotPress: (index: number) => void;
}> = ({ slides, currentIndex, onDotPress }) => {
  return (
    <View style={styles.pagination} accessible={true} accessibilityRole="tablist">
      {slides.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.activeDot : styles.inactiveDot
          ]}
          onPress={() => onDotPress(index)}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentIndex === index }}
          accessibilityLabel={`Slide ${index + 1} of ${slides.length}`}
        />
      ))}
    </View>
  );
};

// Slide Component
const OnboardingSlideComponent: React.FC<{
  slide: OnboardingSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}> = ({ slide, index, scrollX }) => {
  const slideAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]);
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const VisualMockup = () => {
    switch (slide.visual) {
      case 'events-mockup':
        return (
          <View style={styles.mockupContainer}>
            <View style={styles.eventCard}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDateText}>OCT</Text>
                <Text style={styles.eventDateNumber}>15</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>Alumni Welcome Mixer</Text>
                <Text style={styles.eventTime}>7:00 PM • Student Center</Text>
              </View>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Alumni Only</Text>
              </View>
            </View>
          </View>
        );
      case 'community-mockup':
        return (
          <View style={styles.mockupContainer}>
            <View style={styles.chatPreview}>
              <View style={styles.chatHeader}>
                <View style={styles.chatAvatar} />
                <Text style={styles.chatName}>Class of 2015 Alumni</Text>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primaryGold} />
              </View>
              <Text style={styles.chatMessage}>Looking forward to seeing everyone at the mixer!</Text>
            </View>
          </View>
        );
      case 'mobile-mockup':
        return (
          <View style={styles.mockupContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.ticketCard}>
                <Text style={styles.ticketTitle}>Homecoming Game</Text>
                <View style={styles.qrCodePlaceholder}>
                  <Text style={styles.qrText}>QR</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'map-mockup':
        return (
          <View style={styles.mockupContainer}>
            <View style={styles.mapContainer}>
              <View style={styles.mapPin}>
                <Ionicons name="location" size={20} color={COLORS.primaryGold} />
              </View>
              <Text style={styles.mapLabel}>Student Center</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.slide, slideAnimatedStyle]} accessible={true}>
      <View style={styles.iconContainer}>
        <Ionicons name={slide.icon} size={48} color={COLORS.primaryGold} />
      </View>

      <VisualMockup />

      <Text style={styles.slideTitle} accessibilityRole="header">
        {slide.title}
      </Text>

      <Text style={styles.slideDescription}>
        {slide.description}
      </Text>
    </Animated.View>
  );
};

// Main Welcome Screen Component
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSkip }) => {
  // Hooks
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  // Scroll Handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      runOnJS(setCurrentIndex)(index);
    },
  });

  // Navigation Functions
  const handleDotPress = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
    AccessibilityInfo.announceForAccessibility(`Slide ${index + 1} selected`);
  }, []);

  const handleGetStarted = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Starting NYTHC setup');
    onGetStarted();
  }, [onGetStarted]);

  const handleSkip = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Skipping welcome tour');
    onSkip();
  }, [onSkip]);

  return (
    <View style={styles.container}>
      {/* Hero Background */}
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.surfaceDark]}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero Section */}
      <View style={[styles.heroSection, { paddingTop: insets.top }]}>
        <View style={styles.heroImagePlaceholder}>
          <Text style={styles.heroTitle}>Welcome to NYTHC</Text>
          <Text style={styles.heroSubtitle}>Norfolk State University</Text>
        </View>
        <View style={styles.heroOverlay} />
      </View>

      {/* Carousel Section */}
      <View style={styles.carouselSection}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={styles.carousel}
          accessible={true}
          accessibilityLabel="Feature carousel"
        >
          {onboardingSlides.map((slide, index) => (
            <OnboardingSlideComponent
              key={slide.id}
              slide={slide}
              index={index}
              scrollX={scrollX}
            />
          ))}
        </Animated.ScrollView>

        <PaginationDots
          slides={onboardingSlides}
          currentIndex={currentIndex}
          onDotPress={handleDotPress}
        />
      </View>

      {/* Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Skip welcome tour"
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Get started with NYTHC"
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.backgroundDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  heroSection: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImagePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.primaryGold,
    textAlign: 'center',
  },
  carouselSection: {
    flex: 1,
    paddingVertical: 32,
  },
  carousel: {
    flexGrow: 0,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.primaryGold,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  slideDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  mockupContainer: {
    width: SLIDE_WIDTH,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 16,
  },
  eventDateText: {
    fontSize: 12,
    color: COLORS.primaryGold,
    fontWeight: '600',
  },
  eventDateNumber: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  eventBadge: {
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 10,
    color: COLORS.backgroundDark,
    fontWeight: '600',
  },
  chatPreview: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGold,
    marginRight: 8,
  },
  chatName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  chatMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  phoneFrame: {
    width: 120,
    height: 100,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  ticketTitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  qrCodePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primaryGold,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 10,
    color: COLORS.backgroundDark,
    fontWeight: '700',
  },
  mapContainer: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  mapPin: {
    marginBottom: 8,
  },
  mapLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: COLORS.primaryGold,
  },
  inactiveDot: {
    backgroundColor: COLORS.textTertiary,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  getStartedButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryGold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
  },
  getStartedButtonText: {
    fontSize: 16,
    color: COLORS.backgroundDark,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default WelcomeScreen;