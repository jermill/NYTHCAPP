// Navigation type definitions for NYTHC Mobile App

export type RootStackParamList = {
  // Foundation Screens
  Splash: undefined;
  Welcome: undefined;
  RoleSelection: undefined;
  Authentication: undefined;
  LinkedInVerification: { userRole: 'alumni' | 'student' | 'guest' };
  Permissions: undefined;

  // Main App Screens (to be added as we develop)
  Home: undefined;
  EventDetail: { eventId: string };
  TicketSelection: { eventId: string };
  Checkout: { eventId: string; ticketType: string };
  Community: undefined;
  ChatRoom: { roomId: string };
  FriendFinder: undefined;
  Profile: undefined;
  Settings: undefined;

  // Add more as screens are developed
};

export type UserRole = 'alumni' | 'student' | 'guest';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    graduationYear?: number;
    major?: string;
    avatar?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'failed';
  linkedInConnected: boolean;
}