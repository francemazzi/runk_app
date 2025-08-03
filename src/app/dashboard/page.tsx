"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { useSync } from "@/hooks/use-sync";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import {
  MapIcon,
  TrophyIcon,
  TargetIcon,
  RefreshCwIcon,
  LogOutIcon,
  ShieldCheckIcon,
  CircleIcon,
} from "lucide-react";
import dynamic from "next/dynamic";

// Importazione dinamica della mappa per evitare errori SSR
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <div className="text-slate-600 dark:text-slate-400">
        Caricamento mappa...
      </div>
    </div>
  ),
});

interface Territory {
  areaId: number;
  area: number;
  coordinates: [number, number][];
  centerPoint: [number, number];
  status: "conquered" | "defended";
  conqueredAt: string;
  lastActivityDate: string;
}

interface TerritoriesResponse {
  userId: number;
  territories: Territory[];
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { mutate: syncTerritories, isPending: isSyncing } = useSync();
  const [mapView, setMapView] = useState<"satellite" | "street">("satellite");
  const [userId, setUserId] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [canSync, setCanSync] = useState(false);

  // Funzione per ottenere l'ID utente dai cookie
  const getUserIdFromCookies = () => {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.userId;
  };

  // Leggi l'ID utente dai cookie e controlla la sincronizzazione solo lato client
  useEffect(() => {
    const cookieUserId = getUserIdFromCookies();
    console.log("🍪 Dashboard - ID utente dai cookie:", cookieUserId);
    setUserId(cookieUserId || null);

    // Controlla se può sincronizzare oggi
    if (typeof window !== "undefined") {
      const storedLastSync = localStorage.getItem(`lastSync_${cookieUserId}`);
      const today = new Date().toDateString();

      console.log("🔄 Dashboard - Controllo sincronizzazione:", {
        storedLastSync,
        today,
        canSyncToday: storedLastSync !== today,
      });

      setLastSyncDate(storedLastSync);
      setCanSync(storedLastSync !== today);
    }
  }, []);

  console.log("🏠 Dashboard - Stato autenticazione:", {
    isAuthenticated,
    user,
    userIdFromCookies: userId,
    userIdFromUser: user?.id,
    stravaUserId: (user as { stravaUserId?: number })?.stravaUserId,
  });

  // Reindirizza se non autenticato
  useEffect(() => {
    console.log("🔄 Dashboard - Controllo autenticazione:", {
      isAuthenticated,
      user,
    });

    if (!isAuthenticated) {
      console.log(
        "❌ Non autenticato, reindirizzamento alla home tra 2 secondi..."
      );
      // Aggiungi un delay per dare tempo all'autenticazione di stabilizzarsi
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  // Query per ottenere i territori dell'utente
  const {
    data: territoriesData,
    isLoading: isLoadingTerritories,
    refetch: refetchTerritories,
  } = useQuery({
    queryKey: ["territories", userId],
    queryFn: async (): Promise<TerritoriesResponse> => {
      console.log("🌍 Dashboard - Chiamata API territori per user ID:", userId);
      if (!userId) throw new Error("User ID not available");

      // Usa il client API che gestisce automaticamente la variabile d'ambiente
      return apiClient.get<TerritoriesResponse>(
        `/api/territories/user/${userId}`,
        true
      );
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 0, // Sempre fresh
    refetchOnWindowFocus: false,
  });

  console.log("🌍 Dashboard - Stato query territori:", {
    userId: userId,
    enabled: !!userId && isAuthenticated,
    isLoading: isLoadingTerritories,
    data: territoriesData,
  });

  const handleSync = () => {
    if (!canSync) {
      alert("Puoi sincronizzare solo una volta al giorno. Riprova domani!");
      return;
    }

    syncTerritories(undefined, {
      onSuccess: () => {
        // Salva la data di sincronizzazione
        const today = new Date().toDateString();
        if (typeof window !== "undefined" && userId) {
          localStorage.setItem(`lastSync_${userId}`, today);
          setLastSyncDate(today);
          setCanSync(false);
        }

        refetchTerritories();
        alert("Sincronizzazione completata con successo!");
      },
      onError: (error) => {
        console.error("Errore durante la sincronizzazione:", error);
        alert("Errore durante la sincronizzazione. Riprova più tardi.");
      },
    });
  };

  // Funzione di test per chiamare l'API con ID fisso
  const handleTestAPI = async () => {
    console.log("🧪 Test API con ID fisso 123");
    try {
      const data = await apiClient.get<TerritoriesResponse>(
        `/api/territories/user/123`,
        true
      );
    } catch (error) {
      console.error("🧪 Test API - Errore:", error);
      alert(`Errore: ${error}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Funzione per resettare la sincronizzazione (solo per test)
  const handleResetSync = () => {
    if (typeof window !== "undefined" && userId) {
      localStorage.removeItem(`lastSync_${userId}`);
      setLastSyncDate(null);
      setCanSync(true);
      alert("Sincronizzazione resettata!");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const totalArea =
    territoriesData?.territories.reduce(
      (sum, territory) => sum + territory.area,
      0
    ) || 0;

  return (
    <div className="min-h-screen apple-gradient dark:apple-gradient-dark">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                RUNK Dashboard
              </h1>
              <Badge variant="secondary" className="px-3 py-1">
                {user?.firstName || user?.name || "Runner"}
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <MapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Territori Conquistati
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {territoriesData?.territories.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Area Totale
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {(totalArea / 1000000).toFixed(2)} km²
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {totalArea.toLocaleString()} m²
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500">
                    <span>
                      ⚽️ ≈ {Math.round(totalArea / 7140)} campi da calcio
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                  <TargetIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conquiste
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user?.conquests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Difese
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user?.defenses || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              I Tuoi Territori
            </h2>
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-800/70 rounded-lg p-1">
              <Button
                variant={mapView === "satellite" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMapView("satellite")}
                className="text-xs"
              >
                Satellite
              </Button>
              <Button
                variant={mapView === "street" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMapView("street")}
                className="text-xs"
              >
                Strada
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {lastSyncDate && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Ultima sincronizzazione:{" "}
                {new Date(lastSyncDate).toLocaleDateString("it-IT")}
              </div>
            )}
            <Button
              onClick={handleSync}
              disabled={isSyncing || !canSync}
              className={`flex items-center space-x-2 ${
                canSync
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-slate-400 text-white cursor-not-allowed"
              }`}
            >
              <RefreshCwIcon
                className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>
                {isSyncing
                  ? "Sincronizzazione..."
                  : canSync
                  ? "Sincronizzazione"
                  : "Già sincronizzato oggi"}
              </span>
            </Button>
          </div>
        </div>

        {/* Map */}
        <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark mb-8">
          <CardContent className="p-0">
            <div className="w-full h-96 rounded-lg overflow-hidden">
              <MapComponent
                territories={territoriesData?.territories || []}
                mapView={mapView}
                isLoading={isLoadingTerritories}
              />
            </div>
          </CardContent>
        </Card>

        {/* Territories List */}
        {territoriesData?.territories &&
          territoriesData.territories.length > 0 && (
            <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Dettagli Territori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {territoriesData.territories.map((territory) => (
                    <div
                      key={territory.areaId}
                      className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          Territorio #{territory.areaId}
                        </h4>
                        <Badge
                          variant={
                            territory.status === "conquered"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {territory.status === "conquered"
                            ? "Conquistato"
                            : "Difeso"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p>Area: {territory.area.toLocaleString()} m²</p>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <span>
                            ⚽️ ≈ {Math.round(territory.area / 7140)} campi da
                            calcio
                          </span>
                        </div>
                        <p>
                          Conquistato:{" "}
                          {new Date(territory.conqueredAt).toLocaleDateString(
                            "it-IT"
                          )}
                        </p>
                        <p>
                          Ultima attività:{" "}
                          {new Date(
                            territory.lastActivityDate
                          ).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {!isLoadingTerritories &&
          (!territoriesData?.territories ||
            territoriesData.territories.length === 0) && (
            <Card className="apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-12 text-center">
                <MapIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Nessun territorio ancora conquistato
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Inizia a correre e chiudi i tuoi percorsi per conquistare i
                  tuoi primi territori!
                </p>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <RefreshCwIcon
                    className={`w-4 h-4 mr-2 ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                  />
                  Sincronizza Attività
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
