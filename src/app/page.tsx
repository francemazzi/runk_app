"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useAuth } from "@/providers/auth-provider";
import {
  MapIcon,
  TrophyIcon,
  UsersIcon,
  TargetIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, connecting, login } = useAuth();
  console.log("isAuthenticated", isAuthenticated, "user", user);

  // Debug cookies
  useEffect(() => {
    console.log("🍪 Cookies disponibili:", document.cookie);
  }, []);

  const handleStravaConnect = () => {
    login();
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Componente di loading per l'autenticazione
  const AuthLoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md mx-4 apple-card apple-shadow dark:apple-shadow-dark">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Connessione a Strava
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Ti stiamo reindirizzando alla pagina di autorizzazione di Strava...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen apple-gradient dark:apple-gradient-dark">
      {/* Overlay di loading per autenticazione Strava */}
      {connecting && <AuthLoadingOverlay />}
      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <AnimatedSection>
          <div className="space-y-8">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium tracking-wide"
            >
              Integrazione Strava
            </Badge>

            <div className="space-y-6">
              <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight">
                <span className="apple-text-gradient dark:apple-text-gradient-dark">
                  RUNK
                </span>
              </h1>

              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-700 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Corri, conquista, domina.
              </p>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Trasforma ogni corsa in una sfida strategica: chiudi i tuoi
                percorsi, conquista territori reali e sfida altri runner per il
                controllo della mappa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold rounded-full border-2 hover:bg-slate-50 dark:hover:bg-slate-800 apple-button"
                    onClick={handleStravaConnect}
                    disabled={connecting}
                  >
                    {connecting ? "Connessione..." : "Connetti Strava"}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
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
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      Connesso come {user?.firstName || user?.name || "Runner"}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 apple-button apple-shadow dark:apple-shadow-dark"
                    onClick={handleGoToDashboard}
                  >
                    Vai alla Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Non è solo corsa.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              È territorio, strategia e conquista. Ogni chilometro conta. Ogni
              curva è una mossa.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatedSection delay={200}>
            <Card className="group apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Conquista Territori
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Chiudi i tuoi percorsi e trasforma le strade in territorio
                  conquistato. Ogni loop completato espande il tuo regno.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <Card className="group apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrophyIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Sfide Strategiche
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ogni corsa è una mossa strategica. Pianifica i tuoi percorsi
                  per massimizzare la conquista e dominare la mappa.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <Card className="group apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Sfida Altri Runner
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Compete per il controllo della mappa. Difendi i tuoi territori
                  e conquista quelli degli avversari.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={800}>
            <Card className="group apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TargetIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Obiettivi Mirati
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Definisci obiettivi strategici e raggiungi traguardi che
                  espandono il tuo dominio sulla mappa.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={1000}>
            <Card className="group apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Analisi Avanzate
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Studia le tue performance e quelle degli avversari per
                  sviluppare strategie di conquista vincenti.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={1200}>
            <Card className="group apple-card border-0 bg-white/70 dark:bg-slate-800/70 apple-blur apple-shadow dark:apple-shadow-dark">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Difesa del Regno
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Proteggi i tuoi territori conquistati e costruisci un impero
                  di corsa inespugnabile.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Strava Integration */}
      <section className="px-6 py-24 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-900">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium tracking-wide"
              >
                Integrazione Perfetta
              </Badge>

              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">
                Connesso con Strava
              </h2>

              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Sincronizza automaticamente le tue corse e trasformale in
                conquiste territoriali. Nessuna doppia registrazione, solo pura
                strategia.
              </p>

              <div className="flex justify-center pt-8">
                {!isAuthenticated ? (
                  <Button
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold rounded-full bg-orange-600 hover:bg-orange-700 text-white apple-button apple-shadow dark:apple-shadow-dark"
                    onClick={handleStravaConnect}
                    disabled={connecting}
                  >
                    {connecting
                      ? "Connessione..."
                      : "Connetti il tuo Account Strava"}
                  </Button>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 px-6 py-3 rounded-full mb-4">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>
                      <span className="text-orange-700 dark:text-orange-300 font-medium">
                        Account Strava già collegato!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-32 max-w-4xl mx-auto text-center">
        <AnimatedSection>
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">
              Preparati a correre per il tuo regno.
            </h2>

            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Scarica Runk oggi e inizia la tua conquista. Ogni passo è una
              strategia, ogni corsa è una battaglia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="px-12 py-6 text-xl font-bold rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 apple-button apple-shadow dark:apple-shadow-dark"
                onClick={
                  isAuthenticated ? handleGoToDashboard : handleStravaConnect
                }
                disabled={connecting}
              >
                {isAuthenticated
                  ? "Vai alla Dashboard"
                  : connecting
                  ? "Connessione..."
                  : "Scarica Runk"}
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              RUNK
            </div>

            <div className="flex space-x-8">
              <a
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Termini
              </a>
              <a
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Supporto
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
            © 2024 Runk. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}
