import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { stravaApi } from "@/api/strava";

export interface UserInfo {
  id: number;
  firstName?: string;
  name?: string;
  avatar?: string;
  totalTerritories?: number;
  totalConqueredArea?: number;
  conquests?: number;
  defenses?: number;
}

export function useStravaAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Funzione per verificare i cookie di autenticazione
  const checkCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    console.log("🍪 Cookies letti:", cookies);
    return cookies.authenticated === 'true' && cookies.userId;
  };

  // Query per verificare lo stato di autenticazione
  const { data: authStatus, isLoading, refetch: refetchAuth } = useQuery({
    queryKey: ["auth-status"],
    queryFn: stravaApi.checkAuthStatus,
    retry: false,
    staleTime: 0, // Sempre fresh
  });

  // Query per ottenere info utente (solo se autenticato)
  const { data: userInfo, refetch: refetchUser } = useQuery({
    queryKey: ["user-info"],
    queryFn: stravaApi.getUserInfo,
    enabled: authStatus === true,
    retry: false,
    staleTime: 0, // Sempre fresh
  });

  // Mutation per ottenere l'URL di autenticazione
  const stravaAuthMutation = useMutation({
    mutationFn: stravaApi.getAuthUrl,
    onSuccess: (data) => {
      // Redirect automatico dopo aver ottenuto l'URL
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Errore nell'ottenere l'URL di autenticazione:", error);
    },
  });

  // Effetto per verificare l'autenticazione all'avvio e quando cambiano i cookie
  useEffect(() => {
    const hasCookies = checkCookies();
    console.log("🔍 Verifica autenticazione:", { hasCookies, authStatus, userInfo });
    
    if (hasCookies && authStatus === true) {
      setIsAuthenticated(true);
      setUser(userInfo || null);
    } else if (hasCookies && authStatus === undefined) {
      // Se abbiamo i cookie ma non abbiamo ancora verificato l'auth, prova a refetch
      console.log("🔄 Refetch auth status...");
      refetchAuth();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [authStatus, userInfo, refetchAuth]);

  const login = () => {
    // Usa la mutation per ottenere l'URL e poi fare il redirect
    stravaAuthMutation.mutate();
  };

  const logout = () => {
    // Rimuovi i cookie di autenticazione
    document.cookie =
      "authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Reset dello stato locale
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading: isLoading,
    connecting: stravaAuthMutation.isPending,
    login,
    logout,
  };
}
