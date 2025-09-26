import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AccessibilityInfo,
  Alert,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { AuthUser } from '../types/navigation';

// Types
interface LinkedInVerificationScreenProps {
  user: AuthUser;
  onVerificationComplete: (verified: boolean, linkedInData?: LinkedInProfile) => void;
  onSkip: () => void;
  onBack: () => void;
}

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  education: LinkedInEducation[];
  profilePicture?: string;
}

interface LinkedInEducation {
  schoolName: string;
  fieldOfStudy?: string;
  degree?: string;
  startDate?: {
    year: number;
    month?: number;
  };
  endDate?: {
    year: number;
    month?: number;
  };
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: 'pending' | 'active' | 'completed' | 'error';
}

// Constants
const COLORS = {
  primaryGold: '#D6C238',
  backgroundDark: '#000100',
  surfaceDark: '#1A1A1B',
  surfaceElevated: '#252526',
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B8B8',
  textTertiary: '#878787',
  success: '#4CAF50',
  error: '#F44336',
  linkedInBlue: '#0A66C2',
};

// LinkedIn OAuth Configuration
const linkedInConfig = {
  clientId: process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID || 'demo_client_id',
  redirectUri: AuthSession.makeRedirectUri({ scheme: 'nythc' }),
  scopes: ['r_liteprofile', 'r_emailaddress', 'r_educations'].join(' '),
};

// Norfolk State University variations for matching
const norfolkStateVariations = [
  'Norfolk State University',
  'Norfolk State College',
  'Norfolk State',
  'NSU',
  'Norfolk State Univ',
  'Norfolk State Univ.',
];

// Verification Steps Component
const VerificationSteps: React.FC<{
  steps: VerificationStep[];
  currentStepIndex: number;
}> = ({ steps, currentStepIndex }) => {
  return (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const isError = step.status === 'error';

        return (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepIndicatorContainer}>
              <View
                style={[
                  styles.stepIndicator,
                  isCompleted && styles.stepIndicatorCompleted,
                  isActive && styles.stepIndicatorActive,
                  isError && styles.stepIndicatorError,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color={COLORS.backgroundDark} />
                ) : isError ? (
                  <Ionicons name="close" size={16} color={COLORS.textPrimary} />
                ) : (
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={isActive ? COLORS.backgroundDark : COLORS.textTertiary}
                  />
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    (isCompleted || isActive) && styles.stepConnectorActive,
                  ]}
                />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepTitle,
                  isActive && styles.stepTitleActive,
                  isCompleted && styles.stepTitleCompleted,
                ]}
              >
                {step.title}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// Benefits Preview Component
const BenefitsPreview: React.FC = () => {
  const benefits = [
    {
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      title: 'Verified Alumni Badge',
      description: 'Display your verified Norfolk State alumni status',
    },
    {
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      title: 'Exclusive Events',
      description: 'Access alumni-only mixers and networking events',
    },
    {
      icon: 'chatbubbles' as keyof typeof Ionicons.glyphMap,
      title: 'Alumni Chat Rooms',
      description: 'Connect with verified Spartans by graduation year',
    },
    {
      icon: 'ticket' as keyof typeof Ionicons.glyphMap,
      title: 'Priority Ticketing',
      description: 'Early access to homecoming event tickets',
    },
  ];

  return (
    <View style={styles.benefitsContainer}>
      <Text style={styles.benefitsTitle}>What You'll Unlock</Text>
      <View style={styles.benefitsList}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name={benefit.icon} size={20} color={COLORS.primaryGold} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Main LinkedIn Verification Screen Component
const LinkedInVerificationScreen: React.FC<LinkedInVerificationScreenProps> = ({
  user,
  onVerificationComplete,
  onSkip,
  onBack,
}) => {
  // Hooks
  const insets = useSafeAreaInsets();

  // State
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'connect',
      title: 'Connect LinkedIn',
      description: 'Securely connect your LinkedIn profile',
      icon: 'link',
      status: 'active',
    },
    {
      id: 'verify',
      title: 'Verify Education',
      description: 'Confirm Norfolk State University graduation',
      icon: 'school',
      status: 'pending',
    },
    {
      id: 'complete',
      title: 'Complete Setup',
      description: 'Access your verified alumni features',
      icon: 'checkmark-circle',
      status: 'pending',
    },
  ]);

  // Animation values
  const logoScale = useSharedValue(1);
  const connectButtonScale = useSharedValue(1);

  // Animation styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const connectButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: connectButtonScale.value }],
  }));

  // LinkedIn OAuth Functions
  const createAuthURL = async () => {
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Crypto.randomUUID()
    );

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: linkedInConfig.clientId,
      redirect_uri: linkedInConfig.redirectUri,
      state,
      scope: linkedInConfig.scopes,
    });

    return {
      authUrl: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
      state,
    };
  };

  const exchangeCodeForTokens = async (code: string) => {
    // Mock token exchange - in production, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      access_token: 'mock_access_token_' + Date.now(),
      expires_in: 3600,
    };
  };

  const fetchLinkedInProfile = async (accessToken: string): Promise<LinkedInProfile> => {
    // Mock LinkedIn profile data - in production, this would call LinkedIn API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different alumni scenarios
    const mockEducations: LinkedInEducation[] = [
      {
        schoolName: 'Norfolk State University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: { year: 2011 },
        endDate: { year: 2015 },
      },
      {
        schoolName: 'Norfolk State University',
        degree: 'Master of Business Administration',
        fieldOfStudy: 'Business Administration',
        startDate: { year: 2016 },
        endDate: { year: 2018 },
      },
    ];

    return {
      id: 'linkedin_' + Date.now(),
      firstName: user.firstName || 'Sarah',
      lastName: user.lastName || 'Johnson',
      email: user.email,
      education: mockEducations,
      profilePicture: 'mock://profile.jpg',
    };
  };

  const verifyNorfolkStateAlumni = (profile: LinkedInProfile): boolean => {
    return profile.education.some(edu => {
      // Check if any education entry matches Norfolk State variations
      const schoolMatch = norfolkStateVariations.some(variation =>
        edu.schoolName?.toLowerCase().includes(variation.toLowerCase())
      );

      // Ensure they graduated (has end date and it's in the past)
      const hasGraduated = edu.endDate && edu.endDate.year < new Date().getFullYear();

      return schoolMatch && hasGraduated;
    });
  };

  // Handlers
  const handleLinkedInConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      connectButtonScale.value = withSequence(
        withSpring(0.95),
        withSpring(1)
      );

      // Step 1: Create auth URL
      const { authUrl, state } = await createAuthURL();

      AccessibilityInfo.announceForAccessibility('Opening LinkedIn authentication');

      // Step 2: Start OAuth flow
      const result = await AuthSession.startAsync({ authUrl });

      if (result.type === 'success' && result.params.code && result.params.state === state) {
        // Update to verification step
        setCurrentStep(1);
        setIsVerifying(true);

        // Step 3: Exchange code for tokens
        const tokens = await exchangeCodeForTokens(result.params.code);

        // Step 4: Fetch LinkedIn profile
        const profile = await fetchLinkedInProfile(tokens.access_token);

        // Step 5: Verify Norfolk State alumni status
        const isVerified = verifyNorfolkStateAlumni(profile);

        setIsVerifying(false);
        setCurrentStep(2);

        // Animate logo for success/failure
        logoScale.value = withSequence(
          withSpring(1.1),
          withSpring(1)
        );

        if (isVerified) {
          AccessibilityInfo.announceForAccessibility('Norfolk State alumni status verified successfully');

          // Update steps to show success
          setVerificationSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index <= 2 ? 'completed' : 'pending'
          })));

          setTimeout(() => {
            onVerificationComplete(true, profile);
          }, 1500);
        } else {
          AccessibilityInfo.announceForAccessibility('Could not verify Norfolk State alumni status');

          // Update steps to show error
          setVerificationSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index === 1 ? 'error' : step.status
          })));

          Alert.alert(
            'Verification Failed',
            'We could not find Norfolk State University in your LinkedIn education history. Please ensure your LinkedIn profile includes your Norfolk State graduation.',
            [
              { text: 'Try Again', onPress: () => setCurrentStep(0) },
              { text: 'Skip for Now', onPress: handleSkip, style: 'cancel' },
            ]
          );
        }
      } else if (result.type === 'cancel') {
        AccessibilityInfo.announceForAccessibility('LinkedIn authentication cancelled');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('LinkedIn verification error:', error);
      AccessibilityInfo.announceForAccessibility('LinkedIn verification failed');

      Alert.alert(
        'Connection Failed',
        'Unable to connect to LinkedIn. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsConnecting(false);
      setIsVerifying(false);
    }
  }, [user, onVerificationComplete, connectButtonScale, logoScale]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip LinkedIn Verification?',
      'You can verify your alumni status later in your profile settings. Some exclusive features will not be available until verification.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip for Now',
          onPress: () => {
            AccessibilityInfo.announceForAccessibility('Skipping LinkedIn verification');
            onSkip();
          },
        },
      ]
    );
  }, [onSkip]);

  const handleBack = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Going back to authentication');
    onBack();
  }, [onBack]);

  const handlePrivacyInfo = useCallback(() => {
    Alert.alert(
      'Privacy & Security',
      'We only access your basic profile information and education history to verify your Norfolk State alumni status. Your data is encrypted and never shared with third parties.',
      [{ text: 'Got it' }]
    );
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          accessibilityLabel="Go back to authentication"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Verify Your Alumni Status</Text>
          <Text style={styles.headerSubtitle}>
            Connect with LinkedIn to unlock exclusive Norfolk State alumni features
          </Text>
        </View>
      </View>

      {/* LinkedIn Integration Hero */}
      <View style={styles.heroSection}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.linkedInLogo}>
            <Ionicons name="logo-linkedin" size={48} color={COLORS.linkedInBlue} />
          </View>
          <View style={styles.plusIcon}>
            <Ionicons name="add" size={16} color={COLORS.textSecondary} />
          </View>
          <View style={styles.nsuLogo}>
            <Text style={styles.nsuText}>NSU</Text>
          </View>
        </Animated.View>

        <Text style={styles.heroTitle}>Secure Alumni Verification</Text>
        <Text style={styles.heroDescription}>
          We'll verify your Norfolk State graduation through your LinkedIn education history
        </Text>
      </View>

      {/* Verification Steps */}
      <VerificationSteps steps={verificationSteps} currentStepIndex={currentStep} />

      {/* Benefits Preview */}
      <BenefitsPreview />

      {/* Connect Button */}
      <View style={styles.actionSection}>
        <Animated.View style={connectButtonAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.connectButton,
              (isConnecting || isVerifying) && styles.connectButtonDisabled,
            ]}
            onPress={handleLinkedInConnect}
            disabled={isConnecting || isVerifying}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Connect with LinkedIn to verify alumni status"
          >
            <Ionicons
              name="logo-linkedin"
              size={20}
              color={COLORS.textPrimary}
            />
            <Text style={styles.connectButtonText}>
              {isConnecting ? 'Connecting...' : isVerifying ? 'Verifying...' : 'Connect with LinkedIn'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Privacy Notice */}
        <TouchableOpacity style={styles.privacyButton} onPress={handlePrivacyInfo}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.textTertiary} />
          <Text style={styles.privacyText}>Your privacy is protected</Text>
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Skip verification for now"
        >
          <Text style={styles.skipButtonText}>I'll verify later</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: insets.bottom + 40 }} />
    </ScrollView>
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
    paddingBottom: 32,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  linkedInLogo: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    marginHorizontal: 16,
  },
  nsuLogo: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primaryGold,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nsuText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.backgroundDark,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  stepsContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.primaryGold,
    borderColor: COLORS.primaryGold,
  },
  stepIndicatorCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepIndicatorError: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.textTertiary,
    marginTop: 4,
  },
  stepConnectorActive: {
    backgroundColor: COLORS.primaryGold,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  stepTitleActive: {
    color: COLORS.textPrimary,
  },
  stepTitleCompleted: {
    color: COLORS.success,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primaryGold}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.linkedInBlue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    gap: 12,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default LinkedInVerificationScreen;