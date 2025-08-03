import { useMutation } from "@tanstack/react-query";
import { stravaApi } from "@/api/strava";

export function useSync() {
  return useMutation({
    mutationFn: stravaApi.syncTerritories,
    onSuccess: (data) => {
      console.log("Sincronizzazione completata:", data);
      // Mostra un messaggio di successo
    },
    onError: (error) => {
      console.error("Errore durante la sincronizzazione:", error);
      // Mostra un messaggio di errore
    },
  });
}
