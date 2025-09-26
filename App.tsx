import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Types
import { UserRole, AuthUser, LinkedInProfile } from './src/types/navigation';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import AuthenticationScreen from './src/screens/AuthenticationScreen';
import LinkedInVerificationScreen from './src/screens/LinkedInVerificationScreen';

// Types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  RoleSelection: undefined;
  // Add more screen types as we develop them
};

const Stack = createStackNavigator<RootStackParamList>();

// Main App Component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showAuthentication, setShowAuthentication] = useState(false);
  const [showLinkedInVerification, setShowLinkedInVerification] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
    setShowRoleSelection(true);
  };

  const handleSkip = () => {
    setShowWelcome(false);
    setShowRoleSelection(true);
  };

  const handleRoleSelected = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelection(false);
    setShowAuthentication(true);
  };

  const handleBackToWelcome = () => {
    setShowRoleSelection(false);
    setShowWelcome(true);
  };

  const handleBackToRoleSelection = () => {
    setShowAuthentication(false);
    setShowRoleSelection(true);
  };

  const handleAuthenticationComplete = (user: AuthUser) => {
    setAuthenticatedUser(user);
    setShowAuthentication(false);

    if (user.needsVerification && user.role === 'alumni') {
      // Alumni need LinkedIn verification
      setShowLinkedInVerification(true);
    } else {
      // Students and guests go directly to main app
      console.log('User authenticated, proceeding to main app:', user);
    }
  };

  const handleBackToAuthentication = () => {
    setShowLinkedInVerification(false);
    setShowAuthentication(true);
  };

  const handleLinkedInVerificationComplete = (verified: boolean, linkedInData?: LinkedInProfile) => {
    setShowLinkedInVerification(false);

    if (verified && linkedInData) {
      // Update user with LinkedIn data and proceed to main app
      console.log('LinkedIn verification successful:', { user: authenticatedUser, linkedInData });
    } else {
      // User chose to skip or verification failed - still proceed to main app
      console.log('LinkedIn verification skipped or failed, proceeding to main app');
    }
  };

  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showWelcome) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000100" />
        <WelcomeScreen
          onGetStarted={handleGetStarted}
          onSkip={handleSkip}
        />
      </SafeAreaProvider>
    );
  }

  if (showRoleSelection) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000100" />
        <RoleSelectionScreen
          onRoleSelected={handleRoleSelected}
          onBack={handleBackToWelcome}
        />
      </SafeAreaProvider>
    );
  }

  if (showAuthentication && selectedRole) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000100" />
        <AuthenticationScreen
          userRole={selectedRole}
          onAuthenticationComplete={handleAuthenticationComplete}
          onBack={handleBackToRoleSelection}
        />
      </SafeAreaProvider>
    );
  }

  if (showLinkedInVerification && authenticatedUser) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000100" />
        <LinkedInVerificationScreen
          user={authenticatedUser}
          onVerificationComplete={handleLinkedInVerificationComplete}
          onSkip={() => handleLinkedInVerificationComplete(false)}
          onBack={handleBackToAuthentication}
        />
      </SafeAreaProvider>
    );
  }

  // Main app navigation will go here (after authentication/verification)
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#000100" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#000100' },
          }}
        >
          {/* Future screens will be added here */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}