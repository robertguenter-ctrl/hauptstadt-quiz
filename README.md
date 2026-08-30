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

## Spiel starten

### TV (Host)
1. [hauptstadt-quiz.vercel.app](https://hauptstadt-quiz.vercel.app) öffnen
2. **Spiel hosten (TV)** — Raumcode + QR-Code erscheint
3. Spieler joinen per Handy, dann **Manuell starten** oder nach 3 Sekunden auto-start

### Handy (Spieler)
1. QR-Code scannen oder Raumcode auf der Startseite eingeben
2. Namen eingeben → **Spiel beitreten**
3. In der Buzzer-Phase: großen **BUZZ**-Knopf drücken
4. Wer dran ist: Kachel antippen + **Antwort bestätigen**

## Supabase einrichten

1. Neues Supabase-Projekt anlegen (oder bestehendes nutzen)
2. SQL ausführen:
   - `supabase/countries.sql`
   - `supabase/game-rooms.sql`
3. `.env.example` → `.env.local` kopieren und Keys eintragen
4. Dev-Server neu starten

Ohne Supabase funktioniert das Spiel nicht (Multiplayer benötigt Realtime).

## Android TV

1. Chrome auf dem TV → URL der Vercel-Deployment
2. **Spiel hosten (TV)** wählen
3. Spieler joinen per Handy (QR-Code auf dem TV)

**Hinweis:** Controller-Modus (`/test/gamepad`) ist optional — der Hauptmodus ist Handy-Buzzer.

## Deployment (Vercel)

1. Repo auf GitHub pushen
2. In Vercel importieren
3. `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` setzen
4. Deployen
