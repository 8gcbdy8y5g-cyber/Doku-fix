# Versionen von Doku-Fix

Hier steht jede Version der App mit Datum und Änderungen. Zu jeder Version gehört eine Commit-Nummer im Repository. Mit ihr lässt sich die App jederzeit auf genau diesen Stand zurücksetzen.

Neue Versionen kommen oben dazu.

| Version | Datum | Commit | Was sich geändert hat |
|---|---|---|---|
| v29 | 15.10.2026 | db4907a | Dienstplan: Lücken ohne Patient orange markiert, getrennt von der Pause |
| v28 | 15.10.2026 | af84008 | Kopierter Verlaufstext ohne Datum |
| v27 | 15.10.2026 | 6b70402 | VKB-Pfad anlegen: Eingaben bleiben gespeichert, Knopf nie mehr ausgegraut, Plastik und mitverletzte oder mitoperierte Strukturen einmal abfragen |
| v26 | 15.10.2026 | f37376a | VKB-Reha-Pfad auch im Erstbefund, direkt nach der Region |
| v25 | 15.10.2026 | 62090d4 | Testdatenbank zum Durchblättern und Suchen |
| v24 | 15.10.2026 | 0cf7590 | VKB-Reha-Pfad im Verlauf (operiert und konservativ) mit Kriterien, Aufrücken und Text, neue Tests in der Testdatenbank |
| v23 | 14.10.2026 | 5ef44d5 | Weiter mit nächstem Patient, Alles wie letztes Mal, Übungsfundus mit Kategorien, Dosierung je Übung |
| v22 | 14.10.2026 | 43e0f6e | Querformat auf dem iPad: Liste scrollt wieder bis ganz unten |
| v21 | 14.10.2026 | 1d22970 | praxxo-Screenshots und Papierfotos besser lesen, Notizen aus dem Plan, Hausbesuch-Abgleich mit der Fahrtkostenabrechnung |
| v20 | 14.10.2026 | 85fe641 | Behandlung beenden mit Doku-Status im Dienstplan, Hausbesuche aus Fahrzeit-Lücken erkennen, Termine verschieben |
| v19 | 14.10.2026 | 7556fc7 | Verlaufstext beginnt nur mit dem Datum |
| v18 | 14.10.2026 | 13202e2 | Dienstplan: Screenshot aus praxxo einlesen, verschobene Zeiten werden übernommen |
| v17 | 14.10.2026 | 9fd42c1 | Prüfbericht umgesetzt: Reizbarkeit, Kraft, PSFS, Reaktion und Heimübungen, Bericht als PDF |
| v16 | 13.10.2026 | 8a7d893 | Dienstplan-Kopf größer und mittig, Hinweiszeile entfernt |
| v15 | 13.10.2026 | b89ee14 | Dienstplan-Termine farbig nach Therapieart, mit Legende |
| v14 | 13.10.2026 | 90707d8 | Neuro-Tests als Kacheln (mit MS), Körperfigur bei Neuro, KGG eigener Punkt, Übungssuche überall, Dienstplan in Sicherung |
| v13 | 13.10.2026 | a2b5002 | Fahrzeit und Pause im Dienstplan, bessere Fotoerkennung |
| v12 | 13.10.2026 | 3cb2405 | Dienstplan landet am richtigen Tag, Aufräumen, Tag leeren, Import zurücknehmen |
| v11 | 13.10.2026 | e9e34b2 | Dienstplan-Import per Foto überarbeitet, Prüfliste vor dem Übernehmen |
| v10 | 13.10.2026 | ae909b7 | Dienstplan, neue Reiter-Reihenfolge, Diagnose-Vorschläge, Mobilisation bei Gesamter Körper, Eigenmobilisation |
| v9 | 13.10.2026 | 9ac8010 | Fehlerbehebung: Wischen bei „Bisherige Dokumentation“ |
| v8 | 13.10.2026 | 0997cf9 | Übungssuche und Hausbesuche, Kurztext bei Einheiten, Wischen zwischen Seiten, Bisherige Dokumentation |
| v7 | 13.10.2026 | 2a6f648 | Leiste nur Patienten und Schnell Doku, Behandlung nur noch im Verlauf |
| v6 | 13.10.2026 | 813202c | Übungen bei Gesamter Körper mit KGG, KGG-Bereiche und Dosierung als Kacheln |
| v5 | 13.10.2026 | 1331216 | Reiter Behandlung und Schnell Doku, Gesamter Körper, Befinden-Regler, Namensvorschläge |
| v4 | 13.10.2026 | 7a90664 | Orthopädische Tests als Kacheln, Jahresrad, farbige Schmerzregler, Therapieziele vorgezogen, Behandlung als Kacheln |
| v3 | 13.10.2026 | 1577076 | Änderungen aus der Testversion übernommen (siehe unten) |
| v2 | 11.10.2026 | f6f5fb3 | Knopf „Behandlung abgeschlossen“ mit Bericht und Nur Verlauf |
| v1 | 11.10.2026 | 1db82ca | Erste Version mit Offline-Betrieb |

## v29, 15.10.2026

Commit `db4907a`

- Zeiten ohne geplanten Patienten stehen im Dienstplan jetzt als „Lücke bis … · kein Patient geplant“ (orange), an der richtigen Stelle nach Uhrzeit.
- „Pause“ (grün) heißt nur noch, was wirklich Pause ist: die Pause laut Plan, eine Zeile „p“ oder „Pause“ im Plan. Gibt es dazu keine Angabe, gilt die längste freie Zeit ab 45 Minuten als Pause.
- Fahrzeit vor und nach Hausbesuchen bleibt wie bisher.
- Cache: `doku-fix-v28`

## v28, 15.10.2026

Commit `af84008`

- Beim Kopieren einer einzelnen Einheit (Fertig zum Kopieren, Knopf in der Liste der Einheiten, Textleiste unten bei offener Einheit) fällt die Datumszeile weg. Gilt für Verlauf und Schnell Doku.
- In der Anzeige und in der Übersicht aller Einheiten bleibt das Datum stehen, dort wird auch mit Datum kopiert.
- Cache: `doku-fix-v27`

## v27, 15.10.2026

Commit `6b70402`

- Beim Anlegen des VKB-Pfads wird jede Eingabe sofort am Patienten gespeichert. Nichts geht verloren, wenn man den Schritt verlässt.
- Der Knopf heißt „Speichern und weiter“ und ist nie ausgegraut. Fehlt das OP- oder Verletzungsdatum, erscheint ein roter Hinweis und das Feld wird markiert.
- Abgefragt wird einmal: Art der Plastik (Transplantat), mitoperierte Strukturen (Meniskusnaht, Meniskusteilresektion, Knorpeleingriff, Innenband, laterale Tenodese / ALL) und mitverletzte Strukturen (Innen- und Außenmeniskus, Innen- und Außenband, Knorpel, Knochenmarködem, hinteres Kreuzband). Danach geht es direkt im Ablauf weiter, der Pfad fragt das nicht noch einmal.
- Mitverletzt und mitoperiert stehen im Kopf des Pfads und im Verlaufstext. Bei Knochenmarködem erscheint der Hinweis, Stoßbelastungen mindestens 4 Wochen zu meiden (AWMF S1).
- Cache: `doku-fix-v26`

## v26, 15.10.2026

Commit `f37376a`

- Steht in der Diagnose Kreuzband, VKB oder ACL, kommt im Erstbefund nach „Betroffener Bereich“ der Schritt „VKB-Reha-Pfad“. Dort wird der Pfad angelegt und die Phase eingeordnet. Danach zeigt der Schritt die Kriterien für die nächste Phase als Vorschau. Gemessen und geprüft wird ab der ersten Verlaufseinheit.
- Cache: `doku-fix-v25`

## v25, 15.10.2026

Commit `62090d4`

- Neuer Knopf „Testdatenbank“ unten in der Patientenliste. Dort stehen alle 169 Tests, nach Orthopädie (je Region), VKB-Reha und Neurologie sortiert.
- Suchfeld (Name und was der Test prüft) und Filter nach Bereich. Jeder Test klappt auf mit Kurzbeschreibung, Ziel, Position, Richtwerten, Durchführung und Quellen.
- Cache: `doku-fix-v24`

## v24, 15.10.2026

Commit `0cf7590`

- VKB-Reha-Pfad: Steht in der Diagnose Kreuzband, VKB oder ACL, kommt im Verlauf nach „Datum und Befinden“ der Schritt „VKB-Reha-Pfad“. Bei anderen Kniepatienten gibt es dort den Knopf „VKB-Reha-Pfad anlegen“.
- Anlegen: operiert oder konservativ, OP- oder Verletzungsdatum, Seite, Transplantat, Begleiteingriffe, Vorgaben vom Arzt. Die App schlägt eine Phase nach Zeit vor, die Phase wird von Hand bestätigt.
- Phasen operiert: 0 Vor der OP, 1 Früh nach der OP, 2 Kraft und Kontrolle, 3 Laufen, Sprünge, Agilität, 4 Rückkehr zum Sport, 5 Prävention. Konservativ: 0 Akutphase, 1 Screening Stabilität (Delaware), dann wie operiert.
- Kriterien für die nächste Phase nach Kategorien (Gelenk und Erguss, Schmerz, Ansteuerung und Gang, Kraft im Seitenvergleich, Kontrolle und Gleichgewicht, Sprünge, Kopf und Fragebögen) mit Ampel. Seitenvergleich überall ab 90 % LSI, die App rechnet den LSI aus betroffen und gesund (bei Zeiten gesund durch betroffen). Kraft ohne Messgerät über Wiederholungstests und Sprünge, Beinpresse optional.
- Mindestzeiten: Laufen ab Woche 12, sportartspezifisch ab 6 Monaten, Wettkampf nach VKB-Plastik ab 9 Monaten. Sind alle Kriterien erfüllt, fragt die App „In Phase X aufrücken?“. Fehlt nur die Zeit, steht dort das Datum.
- Werte aus früheren Einheiten gelten weiter und stehen mit „zuletzt“ und Datum da. Beweglichkeit (Pro-Modus), Schmerz und „keine Schwellung“ aus der Einheit werden übernommen.
- ACL-RSI (12 Fragen oder Gesamtwert, über 56 Punkte) und IKDC (Gesamtwert) in der App.
- Verlaufstext: Phase, Woche nach OP, heute gemessene Werte, Stand der Kriterien oder Aufstieg.
- Testdatenbank: Stroke-Test, Beinheben, einbeinige Kniebeuge, Brücke, Wadenheben, Stuhl, Seitstütz, Beinpresse, Einbeinstand, Y-Balance, Single, Triple, Crossover und 6-m-Hop, Side Hop, ACL-RSI, IKDC, Giving-way, Selbsteinschätzung, jeweils mit Durchführung, Richtwerten und Quellen.
- Quelle Q19 (AWMF S1 Vordere Kreuzbandruptur) als abgelaufen markiert, Wissenseintrag KN04 an den Pfad angepasst.
- Cache: `doku-fix-v23`

## v23, 14.10.2026

Commit `5ef44d5`

- Dienstplan: Oben steht „Weiter mit“ bzw. „Als Nächstes“ mit dem nächsten Patienten, der noch keine fertige Doku hat, und ein Knopf, der direkt die Einheit von heute öffnet. Offene Dokus von vorhin werden gezählt. Die Knöpfe auf den Karten öffnen heute ebenfalls gleich die heutige Einheit.
- „Alles wie am …“: übernimmt Maßnahmen, Übungen und Heimprogramm der letzten Einheit und springt direkt zu „Fertig zum Kopieren“. „Nur Maßnahmen wie am …“ gibt es weiterhin.
- Reizbarkeit: Die Erklärung steht jetzt unter jeder der drei Kacheln.
- Übungsfundus: Beim Suchen erscheinen auch Übungen aus anderen Regionen und Bereichen, Treffer blau markiert. Neue Übungen fragen nach der Kategorie, eigene Übungen stehen nach Kategorie gruppiert. Bei Gesamter Körper hat jede Kategorie ein eigenes Suchfeld.
- Suchfeld steht unter den Ziel-Chips. Die Kacheln „Übungen aus der Liste“, „Eigene Übung“ und „Dosierung“ sind weg.
- Dosierung je Übung mit Vorschlägen (3 × 8, 3 × 10, 3 × 15 Wiederholungen). Die App merkt sich häufig genutzte Angaben auf dem Gerät. Die Dosierung steht im Text hinter der Übung.
- Cache: `doku-fix-v22`

## v22, 14.10.2026

Commit `43e0f6e`

- Im Querformat (zweispaltige Ansicht ab 900 px Breite) war die Zeile des Rasters so hoch wie der Inhalt. Safari auf dem iPad hat dadurch das Ende der Liste abgeschnitten. Die Zeile ist jetzt auf die Bildschirmhöhe begrenzt, die Liste scrollt in sich bis ganz unten.
- Cache: `doku-fix-v21`

## v21, 14.10.2026

Commit `1d22970`

- Texterkennung: Tabellenlinien und große schwarze Flächen werden vor dem Lesen entfernt, kleine Screenshots vergrößert. Schatten auf Papierfotos bleiben erhalten.
- praxxo-Liste: Datum aus der linken Spalte, Spalten nach linker Kante, verlesene Uhrzeiten (3/8, 1/7) und Behandlungsnummern werden korrigiert, Behandlung mit festem Wortlaut zur Nummer. Neue Nummern 20537 (KGG) und 20205 (MLD).
- Zeilen ohne Patient: „p“ wird Pause, Notizen in Lücken stehen im Pausen- oder Fahrzeit-Block, Notizen über einem Termin stehen als Notiz auf der Karte (bearbeitbar). Nachnamen in Notizen werden gekürzt.
- Gedruckter Plan: Uhrzeiten werden in Reihenfolge geprüft und auf 5-Minuten-Schritte gesetzt, Zeilen mit HB und Adresse ohne lesbaren Namen bleiben Termine.
- Hausbesuch-Abgleich mit der Fahrtkostenabrechnung: Die App kennt die Nachnamen der bisherigen Hausbesuchspatienten nur als kurze Prüfsumme (keine Namen im Code) und markiert passende Termine als „HB?“. Mehrere Termine desselben Patienten zählen als ein Besuch, die Zeile „Fahrzeit“ überbrückt längere Lücken.
- Cache: `doku-fix-v20`

## v20, 14.10.2026

Commit `85fe641`

- „Behandlung beenden“ am Ende jeder Einheit (Befund, Verlauf, Schnell Doku). Erst danach steht im Dienstplan beim Patienten „✓ Doku fertig“, vorher „Doku offen“.
- Hausbesuche ohne gedruckten Plan: Mehrere 10-Minuten-Lücken hintereinander im Hausbesuchs-Zeitraum (Mo/Di 7:00–13:30, Do/Fr 11:00–17:30) gelten als Fahrzeit. In der Prüfliste steht dann „HB?“. Einzelne Lücken zählen nicht.
- Bekannte Hausbesuchs-Patienten merkt sich die App nur auf dem Gerät, ohne Namen im Klartext (nur ein Kurzcode), mit Adresse und Telefon. Nach 180 Tagen ohne Termin wird der Eintrag gelöscht. Nicht in der Sicherung enthalten.
- praxxo: Zeile „Fahrzeit“ wird nicht mehr als Patient gelesen. Behandlungsnummern 20106 (KMT) und 20535 (KG) ergänzt.
- Bearbeiten: Termin um −10, −5, +5 oder +10 Minuten verschieben. Beim Verschieben nach hinten rücken die folgenden Termine mit, bis eine Lücke den Versatz aufnimmt. Gibt es bis Tagesende keine Lücke, rückt niemand nach, und die Termine werden überlappend angezeigt (mit „x min Überschneidung“).
- Cache: `doku-fix-v19`

## v19, 14.10.2026

Commit `7556fc7`

- Der Text jeder Einheit beginnt nur mit dem Datum, z. B. „14.10.2026:“. Vorher stand dort „Verlauf vom …“ bzw. „Behandlung am Tag des Erstbefunds (…)“.
- Cache: `doku-fix-v18`

## v18, 14.10.2026

Commit `13202e2`

- Dienstplan: Screenshots der Terminliste aus praxxo IntraWeb werden als Tabelle gelesen (Spalten Uhrzeit, min, Behandlung, Vorname, Nachname, GebDat).
- Das Datum kommt aus „Termine am … “ bzw. der Datumsspalte. Die Datumsleiste oben (Woche-, Tag-) wird nicht mehr als Plandatum genommen.
- Verschobene Termine landen auf der neuen Uhrzeit. Hausbesuch, offenes Rezept, Adresse und Telefon aus dem gedruckten Plan bleiben erhalten.
- Liest die Texterkennung einen Vornamen falsch, bleibt der Name aus dem bisherigen Plan stehen.
- Zeile „p“ wird als Pause übernommen. Notizzeilen wie „10 min später“ oder „gedruckt“ werden übersprungen.
- Therapieart aus der Positionsnummer (20501 KG, 21201 MT, 20507 KGG, 20712 KGP) oder dem Behandlungstext.
- Cache: `doku-fix-v17`

## v17, 14.10.2026

Commit `9fd42c1`

- Erstbefund: Funktionstests stehen vor den Therapiezielen.
- Schmerz-Schritt: Reizbarkeit (niedrig, mittel, hoch). Die Mobilisation zeigt dazu die passenden Grade.
- Schritt „Schwellung und Kraft“: Kraftgrade 0 bis 5 je Bewegung und Region, im Text und als Vorschlag bei den Funktionszielen.
- Therapieziele: Patientenspezifische Funktionsskala (PSFS) mit bis zu drei Tätigkeiten, 0 bis 10, mit Mittelwert im Befund.
- Kurzzusammenfassung: Hinweis, wenn Nachtschmerz erfasst, die Red Flag aber verneint ist, und wenn die Reizbarkeit fehlt.
- Verlauf und Schnell Dokumentation: neuer Schritt „Reaktion und Heimübungen“ mit Reaktion, Heimübungen, Beratung und Besonderheiten.
- Heimübungen: Suchfeld mit Vorschlägen ab den ersten Buchstaben aus allen Übungen. Neue Übungen merkt sich die App.
- Verlauf-Start: PSFS des Tages, Knopf „Maßnahmen wie am …“ übernimmt die letzte Behandlung.
- Warnung, wenn im Verlaufstext nur das Datum steht. Übungsvorschläge im Verlauf nutzen den Erstbefund.
- Therapiebericht: „Formular als PDF“ und „Nur Text als PDF“ (A4) statt JPEG. PSFS und Kraft im Vergleich zum Erstbefund.
- Red und Yellow Flags „abgefragt“ als Haken mit Erklärung. Baustellen-Hinweise aus dem Arbeitsablauf entfernt. Schritt-Menü und Umschalter größer.
- Cache: `doku-fix-v16`

## v16, 13.10.2026

Commit `8a7d893`

- Wochentag und Datum im Dienstplan sind größer und stehen in der Mitte, die Pfeile sind größer.
- Arbeitszeit, Pause, Termine, Fahrzeit und die Farblegende stehen mittig und etwas größer.
- Die blaue Hinweiszeile zum Beispielplan ist entfernt.
- Cache: `doku-fix-v15`

## v15, 13.10.2026

Commit `b89ee14`

- Termine im Dienstplan sind nach Therapieart eingefärbt: KG blau, KG ZNS violett, MT türkis, KGG rosa. KGP (PNF) zählt als KG ZNS.
- Über der Liste steht eine Legende mit der Anzahl je Therapieart.
- Mit einer Doku verknüpfte Termine haben jetzt eine dünne Kontur statt des blauen Rands.
- Der Foto-Import erkennt auch das Kürzel MT.
- Cache: `doku-fix-v14`

## v14, 13.10.2026

- Neurologische Tests als Kacheln mit nummerierten Testclustern, sortiert nach Beleglage: Kernset Neurologie, Schlaganfall, Parkinson und neu Multiple Sklerose. Quellen in jeder Kachel.
- Neue Tests für MS: Timed 25-Foot Walk, MSWS-12, MFIS, MSIS-29.
- Körperfigur auch bei neurologischen Patienten, mit Schnellwahl (Körperhälfte, beide Arme, beide Beine, Rumpf, ganzer Körper) und lila Markierung; Vorauswahl aus der Diagnose in der Figur.
- Behandlung neurologisch: KGG als eigener Punkt, nicht mehr unter Krafttraining.
- Übungen: Suchfeld „Übungen suchen oder hinzufügen“ in allen Regionen; Hilfsmittel („Womit?“) für eigene Übungen in allen Regionen, auch im Text.
- Sicherung enthält jetzt den Dienstplan; beim Einlesen kommen nur fehlende Tage dazu.
- Offline-Speicher auf `doku-fix-v13`.

## v13, 13.10.2026

- Freie Zeit im Dienstplan wird benannt: neben einem Hausbesuch als Fahrzeit (grau, Länge aus „R: 10min“ im Plan, sonst 10 Minuten), zwischen Praxisterminen als Pause (grün).
- Die längste Pause steht oben in der Kopfzeile. Weicht sie von der gedruckten Pause ab, steht „laut Plan …“ daneben. Dazu ein Chip mit der Fahrzeit des Tages.
- Die Pause aus dem Kopf des Plans wird auch bei schrägem Foto oder verlesenem Wort erkannt.
- Fotoaufbereitung vor der Texterkennung: Schatten und Knicke werden ausgeglichen. Störzeichen an Uhrzeiten werden entfernt, ein als Strich gelesenes „!“ zählt als offenes Rezept.
- Hängt die Texterkennung 40 Sekunden, kommt eine Meldung.
- Offline-Speicher auf `doku-fix-v12`.

## v12, 13.10.2026

- Das Datum wird jetzt aus dem Kopf des Plans gelesen. Die Druckzeit oben rechts wird nicht mehr mit dem Plandatum verwechselt.
- Ist kein Datum lesbar, legt die App den Plan nach Feierabend automatisch auf den nächsten Arbeitstag (sonntags übersprungen) und zeigt einen Hinweis.
- Die Prüfliste zeigt oben „Plan für Mittwoch (morgen)“. Das Datum lässt sich dort ändern.
- Wurde ein Plan vorher am falschen Tag eingemischt, räumt die App das beim richtigen Import auf und nimmt diese Termine aus dem falschen Tag heraus.
- Ein neuer Plan ersetzt den Tag im abgedeckten Zeitraum. Abgesagte Termine fallen dabei weg.
- Unter „Plan aktualisieren“: „Letzten Import zurücknehmen“ und „Tag leeren“ (mit Rückfrage).
- Offline-Speicher auf `doku-fix-v11`.

## v11, 13.10.2026

- Dienstplan-Import neu gebaut. Die Texterkennung liest jetzt Zeile für Zeile über die Position der Wörter auf dem Foto. Ein leicht schräges Foto bringt die Zeilen nicht mehr durcheinander.
- Uhrzeit, Dauer, Name, Geburtsjahr, KG/KGP/KGG, Hausbesuch und „!“ (Rezept offen) werden pro Termin getrennt erkannt. Falsch gelesene Uhrzeiten korrigiert die App über den vorherigen Termin plus Dauer.
- Datum wird aus dem Kopf des Plans gelesen.
- Ähnlich geschriebene Vornamen werden vorhandenen Patienten zugeordnet.
- Neu: Liste „Erkannte Termine“ vor dem Übernehmen. Uhrzeit, Dauer, Name, Hausbesuch und „!“ lassen sich dort korrigieren oder Termine löschen. Der Rohtext ist zuschaltbar.
- Offline-Speicher auf `doku-fix-v10`.

## v10, 13.10.2026

- Neuer Reiter „Dienstplan“. Reihenfolge unten: Dienstplan, Patienten Dokumentation, Schnell Dokumentation.
- Dienstplan: Tagesansicht mit Arbeitszeit, Pause, Terminen, Hausbesuchen und „Rezept offen“. Eine rote Linie zeigt die aktuelle Uhrzeit, Vergangenes ist ausgegraut, der laufende Termin hat einen Fortschrittsbalken. Doppeltermine sind mit einer Klammer verbunden.
- Plan hinzufügen per Foto oder Screenshot mit automatischer Texterkennung (lädt beim ersten Mal aus dem Internet) oder per eingefügtem Text. Namen werden als Vorname und Anfangsbuchstabe gespeichert. Für einen Tag mit vorhandenem Plan ersetzt die App nur geänderte Termine und markiert sie mit „neu“ oder „geändert“.
- Termine mit passender Dokumentation (Vorname N.) öffnen den Patienten. Ohne Dokumentation: „Erstbefund anlegen“ oder „Schnell Dokumentation“.
- Diagnose: Vorschläge beim Tippen aus häufigen Diagnosen, ICD-10-Katalog und eigenen Diagnosen. Unbekannte Diagnosen merkt sich die App beim Tippen auf „Weiter“ (auch in der Sicherung).
- Mobilisation bei „Gesamter Körper“ nach Bereich, Region und Gelenk.
- Eigenmobilisation für HWS, BWS und LWS.
- Offline-Speicher auf `doku-fix-v9`.

## v9, 13.10.2026

- Fehlerbehebung: Das Feld „Bisherige Dokumentation“ öffnet und schließt wieder per Wisch. In v8 fehlte eine Zeile, die das Wischen dort braucht. Die Wischerkennung reagiert jetzt schon während der Bewegung und verhindert dabei, dass die Seite mitscrollt.
- Offline-Speicher auf `doku-fix-v8`.

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
