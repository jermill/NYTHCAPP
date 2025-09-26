import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

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

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
    // Navigate to Role Selection screen (to be implemented)
    console.log('Navigate to Role Selection');
  };

  const handleSkip = () => {
    setShowWelcome(false);
    // Navigate to Role Selection screen (to be implemented)
    console.log('Skip to Role Selection');
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

  // Main app navigation will go here
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
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            initialParams={{
              onGetStarted: handleGetStarted,
              onSkip: handleSkip
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}