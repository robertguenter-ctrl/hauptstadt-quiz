# Hauptstadt-Quiz

Weltquiz für den Wohnzimmer-TV mit Nintendo Pro Controllern. Vier Spieler buzzern, wählen aus 9 Kacheln, wer zuerst 10 Punkte hat gewinnt.

## Stack

- **Next.js** (Vercel)
- **Supabase** (Länder-Datenbank, optional — eingebaute Fallback-Daten vorhanden)
- **Gamepad API** (Controller am Android TV)

## Spielregeln

- 4 Spieler, je ein Controller
- 4 Fragetypen: Flagge→Land, Land→Flagge, Land→Hauptstadt, Hauptstadt→Land
- 9 Antwort-Kacheln (3×3)
- Buzzer: Wer zuerst drückt, darf antworten (10 Sekunden)
- Richtig: +1 Punkt · Falsch: −1 Punkt, andere dürfen buzzern
- Wer zuerst **10 Punkte** hat, gewinnt

## Lokal starten

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000). Controller-Test: [http://localhost:3000/test/gamepad](http://localhost:3000/test/gamepad)

## Supabase einrichten

1. Neues Supabase-Projekt anlegen
2. `supabase/countries.sql` im SQL Editor ausführen
3. `.env.example` → `.env.local` kopieren und Keys eintragen
4. Dev-Server neu starten

Ohne Supabase funktioniert das Spiel mit den eingebauten Länderdaten.

## Android TV

1. Controller per Bluetooth mit dem TV verbinden
2. Chrome auf dem TV öffnen → URL der Vercel-Deployment
3. Einmal einen Controller-Knopf drücken (Browser-Berechtigung)
4. Zuerst `/test/gamepad` testen, ob alle 4 Controller erkannt werden

**Hinweis Mac:** Der Nintendo Pro Controller funktioniert in Chrome am Mac oft nur per USB, nicht per Bluetooth. Das ist eine macOS/Browser-Einschränkung — am Android TV ist Bluetooth der normale Weg.

## Deployment (Vercel)

1. Repo auf GitHub pushen
2. In Vercel importieren
3. `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` setzen
4. Deployen
