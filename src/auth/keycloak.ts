import Keycloak from 'keycloak-js';
import { setKeycloakToken, clearKeycloakToken } from '@/db/repo';

// ============================================
// Keycloak Configuration
// ============================================
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'rag-chat';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'rag-chat-app';

// ============================================
// Keycloak Instance
// ============================================
let keycloakInstance: Keycloak | null = null;

export function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: KEYCLOAK_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
    });
  }
  return keycloakInstance;
}

// ============================================
// Initialization
// ============================================
export async function initKeycloak(): Promise<boolean> {
  const keycloak = getKeycloak();
  
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    if (authenticated && keycloak.token) {
      await setKeycloakToken(keycloak.token);
      
      // Setup token refresh
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).then(async (refreshed) => {
          if (refreshed && keycloak.token) {
            await setKeycloakToken(keycloak.token);
          }
        }).catch(() => {
          console.error('Failed to refresh token');
          keycloakLogout();
        });
      };
    }

    return authenticated;
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error);
    return false;
  }
}

// ============================================
// Authentication Functions
// ============================================
export async function keycloakLogin(): Promise<void> {
  const keycloak = getKeycloak();
  await keycloak.login({
    redirectUri: window.location.origin + '/admin',
  });
}

export async function keycloakLogout(): Promise<void> {
  const keycloak = getKeycloak();
  await clearKeycloakToken();
  await keycloak.logout({
    redirectUri: window.location.origin + '/',
  });
}

export function isKeycloakAuthenticated(): boolean {
  const keycloak = getKeycloak();
  return !!keycloak.authenticated;
}

export function getKeycloakToken(): string | undefined {
  const keycloak = getKeycloak();
  return keycloak.token;
}

export function getKeycloakTokenParsed(): Keycloak.KeycloakTokenParsed | undefined {
  const keycloak = getKeycloak();
  return keycloak.tokenParsed;
}

// ============================================
// Role Checking
// ============================================
export function hasKeycloakRole(role: string): boolean {
  const keycloak = getKeycloak();
  
  // Check realm roles
  if (keycloak.hasRealmRole(role)) {
    return true;
  }
  
  // Check client roles
  if (keycloak.hasResourceRole(role, KEYCLOAK_CLIENT_ID)) {
    return true;
  }
  
  return false;
}

export function isKeycloakAdmin(): boolean {
  return hasKeycloakRole('admin') || hasKeycloakRole('ADMIN');
}

export function getKeycloakUsername(): string | undefined {
  const tokenParsed = getKeycloakTokenParsed();
  return tokenParsed?.preferred_username || tokenParsed?.name || tokenParsed?.email;
}

export function getKeycloakUserId(): string | undefined {
  const tokenParsed = getKeycloakTokenParsed();
  return tokenParsed?.sub;
}

// ============================================
// Token Management
// ============================================
export async function refreshToken(minValidity = 30): Promise<boolean> {
  const keycloak = getKeycloak();
  try {
    const refreshed = await keycloak.updateToken(minValidity);
    if (refreshed && keycloak.token) {
      await setKeycloakToken(keycloak.token);
    }
    return refreshed;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

export async function ensureTokenValid(): Promise<string | null> {
  const keycloak = getKeycloak();
  
  if (!keycloak.authenticated) {
    return null;
  }
  
  try {
    await keycloak.updateToken(30);
    return keycloak.token || null;
  } catch {
    return null;
  }
}
