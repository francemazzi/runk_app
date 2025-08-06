export interface StravaUser {
  id: number;
  name: string;
  avatar: string;
}

export interface StravaAuthResponse {
  url: string;
}

export interface StravaCallbackResponse {
  message: string;
  user: StravaUser;
  sessionId?: string;
}

export interface StravaAuthState {
  isAuthenticated: boolean;
  user: StravaUser | null;
  accessToken?: string;
}

export interface SyncResponse {
  message: string;
  syncedData?: unknown;
  territories?: unknown[];
  activities?: unknown[];
}
