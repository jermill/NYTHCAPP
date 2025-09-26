import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  Alert,
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
interface AuthenticationScreenProps {
  userRole: UserRole;
  onAuthenticationComplete: (user: AuthUser) => void;
  onBack: () => void;
}

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  needsVerification: boolean;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

// Constants
const COLORS = {
  primaryGold: '#D6C238',
  secondaryTeal: '#5C9F8A',
  backgroundDark: '#000100',
  surfaceDark: '#1A1A1B',
  surfaceElevated: '#252526',
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B8B8',
  textTertiary: '#878787',
  error: '#F44336',
  success: '#4CAF50',
  guestColor: '#666666',
};

// Role-specific configuration
const getRoleConfig = (role: UserRole) => {
  switch (role) {
    case 'alumni':
      return {
        color: COLORS.primaryGold,
        title: 'Welcome Back, Spartan',
        subtitle: 'Access your exclusive alumni experience',
        notice: 'LinkedIn verification will be required after sign-up',
        buttonText: 'Continue as Alumni',
      };
    case 'student':
      return {
        color: COLORS.secondaryTeal,
        title: 'Hey there, Spartan!',
        subtitle: 'Join your fellow Norfolk State students',
        notice: 'Use your NSU email for the best experience',
        buttonText: 'Continue as Student',
      };
    case 'guest':
      return {
        color: COLORS.guestColor,
        title: 'Welcome to NYTHC',
        subtitle: 'Explore Norfolk State homecoming',
        notice: 'Upgrade to Alumni or Student for exclusive features',
        buttonText: 'Continue as Guest',
      };
  }
};

// Form Input Component
const FormInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  error?: string;
  required?: boolean;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          isFocused && styles.textInputFocused,
          error && styles.textInputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessible={true}
        accessibilityLabel={label}
        accessibilityRequired={required}
      />
      {error && (
        <Text style={styles.errorText} accessible={true} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

// Social Login Button Component
const SocialLoginButton: React.FC<{
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}> = ({ provider, onPress, disabled = false }) => {
  const config = {
    google: {
      icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
      text: 'Continue with Google',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
    },
    apple: {
      icon: 'logo-apple' as keyof typeof Ionicons.glyphMap,
      text: 'Continue with Apple',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.socialButton,
        { backgroundColor: config[provider].backgroundColor },
        disabled && styles.socialButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={config[provider].text}
    >
      <Ionicons
        name={config[provider].icon}
        size={20}
        color={config[provider].textColor}
      />
      <Text style={[styles.socialButtonText, { color: config[provider].textColor }]}>
        {config[provider].text}
      </Text>
    </TouchableOpacity>
  );
};

// Main Authentication Screen Component
const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({
  userRole,
  onAuthenticationComplete,
  onBack,
}) => {
  // Hooks
  const insets = useSafeAreaInsets();
  const roleConfig = getRoleConfig(userRole);

  // State
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Animation values
  const tabIndicator = useSharedValue(0);

  // Animated styles
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(tabIndicator.value, [0, 1], [0, 120]) }],
  }));

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    // Sign-up specific validations
    if (mode === 'signup') {
      if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleModeChange = useCallback((newMode: 'signin' | 'signup') => {
    if (newMode === mode) return;

    setMode(newMode);
    setErrors({});
    tabIndicator.value = withSpring(newMode === 'signin' ? 0 : 1);

    AccessibilityInfo.announceForAccessibility(`Switched to ${newMode === 'signin' ? 'sign in' : 'sign up'} mode`);
  }, [mode, tabIndicator]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleAuthentication = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock user creation
      const user: AuthUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        role: userRole,
        firstName: formData.firstName,
        lastName: formData.lastName,
        needsVerification: userRole === 'alumni', // Alumni need LinkedIn verification
      };

      AccessibilityInfo.announceForAccessibility(
        `${mode === 'signin' ? 'Signed in' : 'Account created'} successfully`
      );

      onAuthenticationComplete(user);
    } catch (error) {
      setErrors({ general: 'Authentication failed. Please try again.' });
      AccessibilityInfo.announceForAccessibility('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [formData, mode, userRole, validateForm, onAuthenticationComplete]);

  const handleSocialLogin = useCallback((provider: 'google' | 'apple') => {
    Alert.alert(
      'Social Login',
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} login will be implemented in a future update.`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleBack = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Going back to role selection');
    onBack();
  }, [onBack]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          accessibilityLabel="Go back to role selection"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{roleConfig.title}</Text>
          <Text style={styles.headerSubtitle}>{roleConfig.subtitle}</Text>
          <View style={[styles.roleIndicator, { backgroundColor: `${roleConfig.color}20` }]}>
            <Text style={[styles.roleText, { color: roleConfig.color }]}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode Selector */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <Animated.View style={[styles.tabIndicator, { backgroundColor: roleConfig.color }, tabIndicatorStyle]} />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleModeChange('signin')}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'signin' }}
            >
              <Text style={[styles.tabText, mode === 'signin' && { color: COLORS.backgroundDark }]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleModeChange('signup')}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'signup' }}
            >
              <Text style={[styles.tabText, mode === 'signup' && { color: COLORS.backgroundDark }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Sign-up specific fields */}
          {mode === 'signup' && (
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <FormInput
                  label="First Name"
                  value={formData.firstName || ''}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Enter first name"
                  autoCapitalize="words"
                  error={errors.firstName}
                  required
                />
              </View>
              <View style={styles.nameField}>
                <FormInput
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Enter last name"
                  autoCapitalize="words"
                  error={errors.lastName}
                  required
                />
              </View>
            </View>
          )}

          {/* Email */}
          <FormInput
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
            required
          />

          {/* Password */}
          <FormInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
            required
          />

          {/* Confirm Password (Sign-up only) */}
          {mode === 'signup' && (
            <FormInput
              label="Confirm Password"
              value={formData.confirmPassword || ''}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
              required
            />
          )}

          {/* Role-specific notice */}
          <Text style={styles.notice}>{roleConfig.notice}</Text>

          {/* General error */}
          {errors.general && (
            <Text style={styles.generalError} accessible={true} accessibilityRole="alert">
              {errors.general}
            </Text>
          )}

          {/* Authentication Button */}
          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: roleConfig.color },
              isLoading && styles.authButtonDisabled,
            ]}
            onPress={handleAuthentication}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={roleConfig.buttonText}
          >
            <Text style={[styles.authButtonText, { color: userRole === 'guest' ? COLORS.textPrimary : COLORS.backgroundDark }]}>
              {isLoading ? 'Please wait...' : roleConfig.buttonText}
            </Text>
            {!isLoading && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color={userRole === 'guest' ? COLORS.textPrimary : COLORS.backgroundDark}
              />
            )}
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <SocialLoginButton
              provider="google"
              onPress={() => handleSocialLogin('google')}
              disabled={isLoading}
            />
            <SocialLoginButton
              provider="apple"
              onPress={() => handleSocialLogin('apple')}
              disabled={isLoading}
            />
          </View>

          {/* Footer Links */}
          {mode === 'signin' && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.linkText}>Forgot your password?</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  roleIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  tabContainer: {
    marginBottom: 32,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: 120,
    height: '100%',
    borderRadius: 8,
    margin: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  formContainer: {
    paddingBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nameField: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  requiredMark: {
    color: COLORS.error,
  },
  textInput: {
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textInputFocused: {
    borderColor: COLORS.primaryGold,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 4,
  },
  notice: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  generalError: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: `${COLORS.error}20`,
    borderRadius: 8,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.textTertiary,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  socialContainer: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textTertiary,
    gap: 12,
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: COLORS.primaryGold,
    textDecorationLine: 'underline',
  },
});

export default AuthenticationScreen;