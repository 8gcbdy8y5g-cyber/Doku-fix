# Versionen von Doku-Fix

Hier steht jede Version der App mit Datum und Änderungen. Zu jeder Version gehört eine Commit-Nummer im Repository. Mit ihr lässt sich die App jederzeit auf genau diesen Stand zurücksetzen.

Neue Versionen kommen oben dazu.

| Version | Datum | Commit | Was sich geändert hat |
|---|---|---|---|
| v8 | 13.10.2026 | 0997cf9 | Übungssuche und Hausbesuche, Kurztext bei Einheiten, Wischen zwischen Seiten, Bisherige Dokumentation |
| v7 | 13.10.2026 | 2a6f648 | Leiste nur Patienten und Schnell Doku, Behandlung nur noch im Verlauf |
| v6 | 13.10.2026 | 813202c | Übungen bei Gesamter Körper mit KGG, KGG-Bereiche und Dosierung als Kacheln |
| v5 | 13.10.2026 | 1331216 | Reiter Behandlung und Schnell Doku, Gesamter Körper, Befinden-Regler, Namensvorschläge |
| v4 | 13.10.2026 | 7a90664 | Orthopädische Tests als Kacheln, Jahresrad, farbige Schmerzregler, Therapieziele vorgezogen, Behandlung als Kacheln |
| v3 | 13.10.2026 | 1577076 | Änderungen aus der Testversion übernommen (siehe unten) |
| v2 | 11.10.2026 | f6f5fb3 | Knopf „Behandlung abgeschlossen“ mit Bericht und Nur Verlauf |
| v1 | 11.10.2026 | 1db82ca | Erste Version mit Offline-Betrieb |

## v8, 13.10.2026

- Übungen bei „Gesamter Körper“: blaues Feld „Übungen suchen oder hinzufügen“ durchsucht alle Übungen. Gibt es eine Übung noch nicht, fragt die App vor dem Speichern nach dem Bereich. Darunter „Oder nach Bereich suchen“ mit den Bereichen als Kacheln.
- Neuer Bereich „Hausbesuche“ (ganz unten) für eigene Übungen, mit der Auswahl Ball, Loop, Theraband, am Stuhl, am Bett, an der Wand, mit Wasserflaschen, an der Treppe. Eigene Übungen werden samt Bereich gespeichert und sind in der Sicherung enthalten.
- Bisherige Einheiten zeigen unter dem Datum eine Kurzzeile mit Befinden, Angaben, NAS und Behandlung.
- Wischen nach links oder rechts blättert eine Seite vor oder zurück. Die Seite folgt dem Finger. In der Patientenliste, der Schnell-Doku-Liste und der Verlauf-Übersicht wechselt das Wischen zwischen diesen Bereichen.
- Das Feld unten heißt „Bisherige Dokumentation“ und öffnet und schließt mit einem Wisch nach oben oder unten.
- Offline-Speicher auf `doku-fix-v7`.

## v7, 13.10.2026

- Leiste unten nur noch mit „Patienten“ und „Schnell Doku“. Ein Tipp auf einen Patienten zeigt die Auswahl Erstbefund oder Verlauf. Oben auf der Seite schaltet ein Umschalter zwischen beiden.
- Den Bereich „Behandlung“ gibt es nicht mehr. Der Erstbefund endet mit der Kurzzusammenfassung. „Weiter zur Behandlung“ legt im Verlauf die erste Einheit mit dem Datum des Erstbefunds an. Sie beginnt direkt mit Detonisierung, Mobilisation und Übungen und heißt „Tag des Erstbefunds“.
- Schon im Erstbefund eingetragene Behandlungen übernimmt die App in diese erste Einheit.
- Offline-Speicher auf `doku-fix-v6`.

## v6, 13.10.2026

- Übungen bei „Gesamter Körper“: Die KGG-Bereiche (Untere Extremität, Obere Extremität, Rumpf, Gleichgewicht, Mobilisation allgemein) stehen direkt auf der Seite, darunter „Eigene Übung“ als Eingabefeld. Filterleiste und Kachel „Dosierung“ fallen dort weg.
- KGG-Bereiche überall als Kacheln, von denen immer nur eine offen ist.
- Abfrage zu jeder KGG-Übung (Griff bzw. Ausführung, Gewicht, Sätze, Wiederholungen) als kleine Kacheln, die sich nach der Auswahl schließen und die nächste öffnen. Anmerkung als freies Textfeld.
- Ein zweiter Tipp auf eine eingetragene Übung klappt die Abfrage zu, die Werte bleiben. Neu sind die Knöpfe „Fertig“ und „Übung entfernen“.
- Offline-Speicher auf `doku-fix-v5`.

## v5, 13.10.2026

- Neuer Reiter „Behandlung“ in der Leiste unten: Detonisierung, Mobilisation, Übungen (bei neurologischen Diagnosen auch Behandlung neurologisch) und die Ausgabe. Der Erstbefund endet mit der Kurzzusammenfassung, dort steht jetzt auch „Erstbefund neu beginnen“.
- Reiter „Nur Verlauf“ heißt jetzt „Schnell Doku“. Er startet immer mit der Patientenliste. Die Übersicht beginnt mit „Neue Einheit“, „Therapiebericht“ und „Frühere Einheiten einfügen“, Diagnose oder Region ändern und Neuer Patient stehen klein darunter. „Behandlung abgeschlossen“ steht am Ende des Therapieberichts.
- Bereich „Gesamter Körper“ auf der Seite „Welcher Bereich ist betroffen?“. Bei der Detonisierung gibt es dafür ein Menü nach Körperregion, Gelenk und umgebender Muskulatur.
- Befinden seit der letzten Behandlung als Regler von „deutlich schlechter“ über „unverändert“ bis „deutlich besser“, mit Satz im Verlaufstext und im Therapiebericht. Das Freitextfeld bleibt darunter.
- Schritt-Menü oben rechts auch in den Einheiten von Verlauf und Schnell Doku.
- Beim Eintippen eines Namens zeigen Patienten und Schnell Doku passende Patienten zum Öffnen an.
- Offline-Speicher auf `doku-fix-v4`.

## v4, 13.10.2026

- Orthopädische Tests als aufklappbare Kacheln, nach Körperregion in Clustern und in sinnvoller Reihenfolge. Grundlage ist eine Recherche zu 103 Tests mit Quellen; zu einigen Tests fehlen belastbare Genauigkeitswerte.
- Nebendiagnosen: Beim Antippen erscheint ein Rad zur Jahresauswahl, das Jahr steht direkt hinter der Diagnose.
- Schmerzregler laufen farblich von grün (0) über gelb nach rot (10), die Farbe ändert sich beim Ziehen.
- Schwellung mit stufenlosem Schieberegler.
- „Wobei tritt der Schmerz auf?“ und die Region der Schwellung: Vorschläge sichtbar, alle weiteren Kacheln erst nach Antippen.
- Beweglichkeit: Die Bewegungsrichtungen (Flexion, Extension usw.) sind je Paar als Kachel zusammengefasst.
- Neue Reihenfolge: Therapieziele (Schritt 10), dann Funktionstests, dann Befund. Die Ziele erscheinen in der Kurzzusammenfassung, der Knopf „Weiter zum Ziel“ ist weg.
- Therapieziele als Kacheln mit Vorschlägen aus den vorherigen Schritten, grüner Haken bei Auswahl, Kachel schließt sich danach und die nächste öffnet sich.
- Behandlung (Detonisierung, Mobilisation, Übungen) im selben Kachelmuster.
- Offline-Speicher auf `doku-fix-v3`.

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

Am einfachsten sagst du Claude zum Beispiel: „Stelle Doku-Fix auf Version v2 zurück.“ Claude holt dann über die Commit-Nummer die Dateien aus diesem Stand, erhöht die Nummer des Offline-Speichers in `sw.js` und lädt das Ganze als neue Version hoch. Die späteren Versionen gehen dabei nicht verloren und lassen sich genauso zurückholen.

Wer es selbst machen will, nimmt diese Befehle im Repository (Beispiel v2, die Nummer steht in der Tabelle):

```
git checkout f6f5fb3 -- index.html
git commit -m "Zurück auf Version v2"
git push
```

Danach in `sw.js` die Cache-Nummer um eins erhöhen, sonst zeigt die installierte App eventuell noch den alten Stand.

Die Patientendaten auf dem Gerät hängen nicht an der Version. Sie bleiben beim Zurücksetzen erhalten.
