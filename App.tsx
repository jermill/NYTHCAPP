import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Types
import { UserRole } from './src/types/navigation';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';

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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

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
    // Navigate to authentication or next screen
    console.log('Role selected:', role);
  };

  const handleBackToWelcome = () => {
    setShowRoleSelection(false);
    setShowWelcome(true);
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

  // Main app navigation will go here (after role selection)
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