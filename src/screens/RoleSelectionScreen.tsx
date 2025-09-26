import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../types/navigation';

// Types
interface RoleSelectionScreenProps {
  onRoleSelected: (role: UserRole) => void;
  onBack: () => void;
}

interface RoleOption {
  id: UserRole;
  title: string;
  badge: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  borderColor: string;
  features: string[];
}

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 24;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);

const COLORS = {
  primaryGold: '#D6C238',
  secondaryTeal: '#5C9F8A',
  backgroundDark: '#000100',
  surfaceDark: '#1A1A1B',
  surfaceElevated: '#252526',
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B8B8',
  textTertiary: '#878787',
  success: '#4CAF50',
  guestColor: '#666666',
};

// Role Options Configuration
const roleOptions: RoleOption[] = [
  {
    id: 'alumni',
    title: 'Norfolk State Alumni',
    badge: 'Verified Required',
    description: 'Access exclusive alumni events, verified networking, and premium homecoming experiences. LinkedIn verification required.',
    icon: 'school',
    color: COLORS.primaryGold,
    borderColor: COLORS.primaryGold,
    features: [
      'Alumni-only events and mixers',
      'Verified community chat rooms',
      'Priority event ticketing',
      'Networking opportunities'
    ]
  },
  {
    id: 'student',
    title: 'Current Student',
    badge: 'NSU Student',
    description: 'Connect with fellow Spartans, join student activities, and enjoy special student pricing on events and merchandise.',
    icon: 'library',
    color: COLORS.secondaryTeal,
    borderColor: COLORS.secondaryTeal,
    features: [
      'Student-specific events',
      'Campus activity groups',
      'Student pricing discounts',
      'Class year connections'
    ]
  },
  {
    id: 'guest',
    title: 'Guest & Visitor',
    badge: 'Welcome',
    description: 'Explore public homecoming events, local guides, and discover what makes Norfolk State special. Upgrade anytime.',
    icon: 'eye',
    color: COLORS.guestColor,
    borderColor: COLORS.guestColor,
    features: [
      'Public event access',
      'Local guides and maps',
      'General information',
      'Upgrade to verified roles'
    ]
  }
];

// Role Card Component
const RoleCard: React.FC<{
  role: RoleOption;
  isSelected: boolean;
  onSelect: (roleId: UserRole) => void;
  animatedValue: Animated.SharedValue<number>;
}> = ({ role, isSelected, onSelect, animatedValue }) => {

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animatedValue.value, [0, 1], [1, 1.02]);
    const borderWidth = interpolate(animatedValue.value, [0, 1], [2, 3]);

    return {
      transform: [{ scale }],
      borderWidth,
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 1], [0, 0.3]);

    return {
      opacity,
    };
  });

  const handlePress = useCallback(() => {
    onSelect(role.id);
    AccessibilityInfo.announceForAccessibility(`${role.title} selected`);
  }, [role, onSelect]);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Select ${role.title}. ${role.description}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: role.borderColor,
            backgroundColor: isSelected ? `${role.color}10` : COLORS.surfaceDark,
          },
          cardAnimatedStyle,
        ]}
      >
        {/* Glow Effect */}
        {isSelected && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.cardGlow,
              { shadowColor: role.color },
              glowAnimatedStyle,
            ]}
          />
        )}

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${role.color}20` }]}>
            <Ionicons name={role.icon} size={32} color={role.color} />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.roleTitle}>{role.title}</Text>
            <View style={[styles.badge, { backgroundColor: role.color }]}>
              <Text style={[styles.badgeText, { color: role.id === 'guest' ? COLORS.textPrimary : COLORS.backgroundDark }]}>
                {role.badge}
              </Text>
            </View>
          </View>

          {isSelected && (
            <View style={[styles.checkContainer, { backgroundColor: role.color }]}>
              <Ionicons name="checkmark" size={20} color={role.id === 'guest' ? COLORS.textPrimary : COLORS.backgroundDark} />
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={styles.roleDescription}>{role.description}</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {role.features.slice(0, 2).map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={role.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
          {role.features.length > 2 && (
            <Text style={styles.moreFeatures}>+{role.features.length - 2} more features</Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Role Selection Screen Component
const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onRoleSelected, onBack }) => {
  // Hooks
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Animated values for each card
  const alumniAnim = useSharedValue(0);
  const studentAnim = useSharedValue(0);
  const guestAnim = useSharedValue(0);

  const getAnimatedValue = (roleId: UserRole) => {
    switch (roleId) {
      case 'alumni': return alumniAnim;
      case 'student': return studentAnim;
      case 'guest': return guestAnim;
      default: return alumniAnim;
    }
  };

  // Handlers
  const handleRoleSelect = useCallback((roleId: UserRole) => {
    // Reset all animations
    alumniAnim.value = 0;
    studentAnim.value = 0;
    guestAnim.value = 0;

    // Animate selected card
    const selectedAnim = getAnimatedValue(roleId);
    selectedAnim.value = withSpring(1, { damping: 0.7, stiffness: 100 });

    setSelectedRole(roleId);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedRole) {
      AccessibilityInfo.announceForAccessibility(`Continuing as ${selectedRole}`);
      onRoleSelected(selectedRole);
    }
  }, [selectedRole, onRoleSelected]);

  const handleBack = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Going back to welcome screen');
    onBack();
  }, [onBack]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.surfaceDark]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Your Role</Text>
          <Text style={styles.headerSubtitle}>
            Select your relationship to Norfolk State University
          </Text>
        </View>
      </View>

      {/* Role Cards */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Role selection options"
      >
        <View style={styles.cardsContainer}>
          {roleOptions.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              onSelect={handleRoleSelect}
              animatedValue={getAnimatedValue(role.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedRole ? COLORS.primaryGold : COLORS.textTertiary,
              opacity: selectedRole ? 1 : 0.5,
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={selectedRole ? `Continue as ${selectedRole}` : 'Select a role to continue'}
          accessibilityState={{ disabled: !selectedRole }}
        >
          <Text style={[
            styles.continueButtonText,
            { color: selectedRole ? COLORS.backgroundDark : COLORS.textSecondary }
          ]}>
            Continue
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={selectedRole ? COLORS.backgroundDark : COLORS.textSecondary}
          />
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
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: CARD_MARGIN,
  },
  cardsContainer: {
    paddingBottom: 24,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    position: 'relative',
  },
  cardGlow: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    marginLeft: 24,
  },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGold,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 52,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.backgroundDark,
  },
});

export default RoleSelectionScreen;