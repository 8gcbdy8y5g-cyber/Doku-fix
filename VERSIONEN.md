# Versionen von Doku-Fix

Hier steht jede Version der App mit Datum und Änderungen. Jede Version hat eine Markierung (Tag) im Repository. Damit lässt sich die App jederzeit auf genau diesen Stand zurücksetzen.

Neue Versionen kommen oben dazu.

| Version | Datum | Commit | Was sich geändert hat |
|---|---|---|---|
| v3 | 13.10.2026 | 1577076 | Änderungen aus der Testversion übernommen (siehe unten) |
| v2 | 11.10.2026 | f6f5fb3 | Knopf „Behandlung abgeschlossen“ mit Bericht und Nur Verlauf |
| v1 | 11.10.2026 | 1db82ca | Erste Version mit Offline-Betrieb |

## v3, 13.10.2026

- Körperschema auf der Seite „Welcher Bereich ist betroffen?“: Jede Stelle der Figur ist antippbar, vorne und hinten, Finger und Zehen einzeln. Vorschläge aus der Diagnose leuchten orange.
- Schmerzverlauf mit dem Finger einzeichnen. Die App schreibt den Verlauf als Text in die Doku.
- Diagnoselisten (neurologisch, orthopädisch, innere Medizin) nach Häufigkeit in Deutschland sortiert.
- Bereichsauswahl (Kopf, Extremitäten, Wirbelsäule, anderer Körperteil) hinter einer aufklappbaren Fläche.
- Befundhistorie: „Vorliegende Befunde“ entfernt. „Bisherige Maßnahmen“ und „Bekannte Nebendiagnosen“ als Kacheln. „Orthopädische Vorstellung“ heißt jetzt „Ärztliche Vorstellung“. Jede gewählte Nebendiagnose bekommt eine eigene Zeile im Detailfeld.
- Sozialanamnese als Kacheln: Soziales (mit Haustieren), Arbeit und Beruf, Sport, Hilfsmittel.
- Vorschläge passend zur Stelle bei „Wobei tritt der Schmerz am meisten auf?“ und bei der Region der Schwellung.
- Schritt-Menü oben rechts: Zu jeder Seite springen, vor und zurück. Ausgefüllte Seiten sind blau markiert.
- Beweglichkeit „Schnell“: Standard ist „nicht geprüft“, neu ist die Stufe „mäßig reduziert“.
- Offline-Speicher auf `doku-fix-v2`, damit installierte Apps die neue Version laden.

## v2, 11.10.2026

- Knopf „Behandlung abgeschlossen“ für den Therapiebericht und den Bereich „Nur Verlauf“.

## v1, 11.10.2026

- Erste Version der App auf GitHub Pages, installierbar auf dem Home-Bildschirm und offline nutzbar.

## Eine alte Version wiederherstellen

Am einfachsten sagst du Claude zum Beispiel: „Stelle Doku-Fix auf Version v2 zurück.“ Claude holt dann die Dateien aus diesem Stand, erhöht die Nummer des Offline-Speichers in `sw.js` und lädt das Ganze als neue Version hoch. Die späteren Versionen gehen dabei nicht verloren und lassen sich genauso zurückholen.

Wer es selbst machen will, nimmt diese Befehle im Repository:

```
git checkout v2 -- index.html
git commit -m "Zurück auf Version v2"
git push
```

Danach in `sw.js` die Cache-Nummer um eins erhöhen, sonst zeigt die installierte App eventuell noch den alten Stand.

Die Patientendaten auf dem Gerät hängen nicht an der Version. Sie bleiben beim Zurücksetzen erhalten.
