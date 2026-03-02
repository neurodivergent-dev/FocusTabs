import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { authConfig } from '../config/authConfig';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  givenName?: string;
  familyName?: string;
}

// Google OAuth 2.0 endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

class GoogleAuthService {
  // Create auth request
  createRequest = () => {
    return AuthSession.useAuthRequest(
      {
        clientId: Platform.select({
          web: authConfig.google.webClientId,
          ios: authConfig.google.iosClientId,
          android: authConfig.google.webClientId,
        }) || '',
        responseType: AuthSession.ResponseType.Token,
        redirectUri: AuthSession.makeRedirectUri(),
        scopes: ['profile', 'email'],
      },
      discovery
    );
  };

  // Parse user info from Google response
  getUserInfo = async (accessToken: string): Promise<GoogleUser | null> => {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      
      const userInfo = await response.json();
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name || '',
        photoUrl: userInfo.picture,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name
      };
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      return null;
    }
  };
}

export default new GoogleAuthService(); 