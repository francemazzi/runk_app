// Configurazione per gli URL in base all'ambiente
export const config = {
  // URL di base per il frontend
  frontendUrl:
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000"),

  // URL di base per il backend
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_SERVER || "http://localhost:8090",

  // URL di callback per Strava
  stravaCallbackUrl: process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/strava/callback`
    : "http://localhost:3000/auth/strava/callback",

  // Determina se siamo in produzione
  isProduction: process.env.NODE_ENV === "production",

  // Determina se siamo su Vercel
  isVercel: process.env.VERCEL === "1",
};

// Log della configurazione (solo in sviluppo)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔧 Configurazione ambiente:", {
    frontendUrl: config.frontendUrl,
    backendUrl: config.backendUrl,
    stravaCallbackUrl: config.stravaCallbackUrl,
    isProduction: config.isProduction,
    isVercel: config.isVercel,
  });
}
