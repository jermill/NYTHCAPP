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

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  needsVerification: boolean;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  education: LinkedInEducation[];
  profilePicture?: string;
}

export interface LinkedInEducation {
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