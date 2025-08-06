"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StravaCallbackResponse } from "@/types/strava";
import { UserInfo } from "@/providers/auth-provider";
import { useAuth } from "@/providers/auth-provider";
import { useSync } from "@/hooks/use-sync";
import { config } from "@/lib/config";

function StravaCallbackContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const sync = useSync();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevenire chiamate multiple
      if (isProcessing || user || error) {
        return;
      }

      const code = searchParams.get("code");
      if (!code) {
        setLoading(false);
        return; // Non c'è codice, non fare nulla
      }

      setIsProcessing(true);

      try {
        const state = searchParams.get("state");
        const scope = searchParams.get("scope");

        // Usa il nostro API client per la consistenza
        const params = new URLSearchParams();
        params.set("code", code);
        if (state) params.set("state", state);
        if (scope) params.set("scope", scope);

        const endpoint = `/auth/strava/callback?${params.toString()}`;
        console.log("🔧 Callback URL:", `${config.backendUrl}${endpoint}`);

        const response = await fetch(`${config.backendUrl}${endpoint}`, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
          // IMPORTANTE: includi credentials per salvare i cookies di sessione
          credentials: "include",
          mode: "cors",
        });

        console.log("🔍 Response status:", response.status);
        console.log(
          "🔍 Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        // Controlla specificamente i cookie nella risposta
        const setCookieHeader = response.headers.get("set-cookie");
        console.log("🍪 Set-Cookie header:", setCookieHeader);

        const responseText = await response.text();
        console.log("🔍 Response body:", responseText);

        // Prova a parsare la risposta
        let data: StravaCallbackResponse;
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Errore nel parsing della risposta: ${responseText}`);
        }

        // Se abbiamo dati validi, usali anche se c'è stato un errore 500
        if (data.user && data.message) {
          console.log(
            "✅ Dati validi ricevuti, procedo anche con status:",
            response.status
          );
        } else if (!response.ok) {
          console.error("❌ Backend error response:", responseText);
          throw new Error(`Errore HTTP: ${response.status} - ${responseText}`);
        }
        console.log("✅ Callback riuscito:", data);

        // Verifica i cookie dopo la richiesta
        const cookiesAfterRequest = document.cookie;
        console.log("🍪 Cookie dopo la richiesta:", cookiesAfterRequest);

        // Se non ci sono cookie, c'è un problema con il backend
        if (!cookiesAfterRequest.includes("authenticated")) {
          console.error(
            "❌ ERRORE: Il backend non ha impostato i cookie di autenticazione!"
          );
          console.error("🔍 Set-Cookie header mancante o malformato");
          console.error("🔧 Il backend deve impostare i cookie con:");
          console.error("   - SameSite=None");
          console.error("   - Secure=true");
          console.error("   - Domain appropriato per cross-origin");
        }

        setUser(data.user);
        // L'auth provider gestirà automaticamente l'autenticazione tramite i cookie o localStorage

        // Reindirizza automaticamente alla dashboard dopo 2 secondi
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } catch (err) {
        console.error("Errore nel callback Strava:", err);

        // Gestione specifica degli errori di connessione
        if (err instanceof TypeError && err.message.includes("fetch")) {
          setError(
            `Errore di connessione al backend. Verifica che il server sia attivo su ${config.backendUrl}`
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Errore sconosciuto durante l'autenticazione");
        }
      } finally {
        setLoading(false);
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, login, isProcessing, user, error]);

  const handleSync = async () => {
    try {
      await sync.mutateAsync();
      setSynced(true);
    } catch (error) {
      console.error("Errore durante la sincronizzazione:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Connessione in corso...
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Stiamo completando la connessione con Strava
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="w-full max-w-md mx-4 border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              Errore di Connessione
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>

            {/* Informazioni di debug per la produzione */}
            {config.isProduction && (
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                <p>
                  <strong>Ambiente:</strong> Produzione
                </p>
                <p>
                  <strong>Frontend:</strong> {config.frontendUrl}
                </p>
                <p>
                  <strong>Backend:</strong> {config.backendUrl}
                </p>
                <p>
                  <strong>Callback:</strong> {config.stravaCallbackUrl}
                </p>
              </div>
            )}

            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="w-full max-w-md mx-4 border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
              Connessione Riuscita!
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-6">
              Il tuo account Strava è stato collegato con successo
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm mb-4">
              Reindirizzamento alla dashboard in corso...
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                {user.avatar && (
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {user.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    ID: {user.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {!synced ? (
                <Button
                  onClick={handleSync}
                  disabled={sync.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                >
                  {sync.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sincronizzazione in corso...
                    </>
                  ) : (
                    "Sincronizza Dati"
                  )}
                </Button>
              ) : (
                <div className="text-center py-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Dati sincronizzati con successo!
                  </p>
                </div>
              )}
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Vai alla Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Torna alla Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default function StravaCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Caricamento...
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Stiamo preparando la pagina
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <StravaCallbackContent />
    </Suspense>
  );
}
