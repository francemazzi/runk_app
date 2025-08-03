# Configurazione Vercel per RUNK

## Problema
L'applicazione è deployata su [https://runk-fe.vercel.app/](https://runk-fe.vercel.app/) ma la callback di Strava reindirizza a `localhost:3000` invece che all'URL di produzione.

## Soluzione

### 1. Configurare le Variabili d'Ambiente su Vercel

Vai nelle impostazioni del progetto su Vercel e aggiungi queste variabili d'ambiente:

```bash
NEXT_PUBLIC_FRONTEND_URL=https://runk-fe.vercel.app
NEXT_PUBLIC_BACKEND_SERVER=https://tuo-backend.vercel.app
```

### 2. Configurare Strava OAuth

Nel pannello di controllo di Strava, aggiorna l'URL di callback:

**URL di Callback:**
```
https://runk-fe.vercel.app/auth/strava/callback
```

### 3. Verificare la Configurazione

Dopo aver configurato le variabili d'ambiente, l'applicazione dovrebbe:

1. **Rilevare automaticamente l'ambiente di produzione**
2. **Usare l'URL corretto per le callback**
3. **Mostrare informazioni di debug in caso di errore**

### 4. Testare

1. Vai su [https://runk-fe.vercel.app/](https://runk-fe.vercel.app/)
2. Clicca "Connetti Strava"
3. Completa l'autorizzazione
4. Dovresti essere reindirizzato correttamente alla dashboard

### 5. Troubleshooting

Se continui ad avere problemi:

1. **Controlla i log di Vercel** per vedere gli errori
2. **Verifica le variabili d'ambiente** nelle impostazioni di Vercel
3. **Controlla la console del browser** per i messaggi di debug
4. **Verifica che il backend sia accessibile** dall'URL configurato

### Note Importanti

- Il backend deve essere deployato e accessibile dall'URL configurato in `NEXT_PUBLIC_BACKEND_SERVER`
- Le variabili d'ambiente devono essere configurate nelle impostazioni di Vercel, non nel file `.env.local`
- Dopo aver modificato le variabili d'ambiente, è necessario fare un nuovo deploy 