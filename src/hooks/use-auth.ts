import { useState, useEffect } from "react";
import { StravaUser } from "@/types/strava";

const USER_STORAGE_KEY = "strava_user";

export function useAuth() {
  const [user, setUser] = useState<StravaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carica l'utente dal localStorage all'avvio
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        "Errore nel caricamento dell'utente dal localStorage:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: StravaUser) => {
    setUser(userData);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error(
        "Errore nel salvataggio dell'utente nel localStorage:",
        error
      );
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error(
        "Errore nella rimozione dell'utente dal localStorage:",
        error
      );
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
