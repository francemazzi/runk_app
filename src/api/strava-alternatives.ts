// ALTERNATIVE IMPLEMENTATIONS per gestire l'autenticazione Strava
// Scegli quella più adatta alla tua architettura backend

import { apiClient } from "./client";

export interface StravaAuthResponse {
  url: string;
}

// ========================================
// OPZIONE 1: Endpoint generico (CONSIGLIATA)
// Il backend determina l'utente da token/sessione
// ========================================
export const stravaApiOption1 = {
  getAuthUrl: async (): Promise<StravaAuthResponse> => {
    return apiClient.get<StravaAuthResponse>(`/api/strava/auth`);
  },
};

// ========================================
// OPZIONE 2: ID dinamico dall'utente loggato
// Usando un sistema di autenticazione
// ========================================
export const stravaApiOption2 = {
  getAuthUrl: async (userId: string): Promise<StravaAuthResponse> => {
    return apiClient.get<StravaAuthResponse>(`/api/territories/user/${userId}`);
  },
};

// Hook corrispondente per Opzione 2:
/*
export function useStravaAuth() {
  const { user } = useAuth(); // Supponiamo di avere un hook per l'utente corrente
  
  return useMutation({
    mutationFn: () => stravaApi.getAuthUrl(user.id),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Error getting Strava auth URL:", error);
      alert("Errore durante la connessione a Strava. Riprova più tardi.");
    },
  });
}
*/

// ========================================
// OPZIONE 4: Gestione con localStorage
// Per salvare l'ID utente localmente
// ========================================
export const stravaApiOption4 = {
  getAuthUrl: async (): Promise<StravaAuthResponse> => {
    const userId = localStorage.getItem("userId") || "default-user";
    return apiClient.get<StravaAuthResponse>(`/api/territories/user/${userId}`);
  },
};
