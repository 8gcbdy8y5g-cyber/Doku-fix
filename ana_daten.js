// Doku-Fix Anatomie: Namen, Regionen, Erklär-Szenen, Bewegungen
// Fachinhalte: Entwurf, fachlich prüfen.

export const ORD = {first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10,eleventh:11,twelfth:12};

// Muskeln, Sehnen, Bänder: [Muster, Schlüssel, Deutsch, Fachbegriff, Funktion, oberflächlich(1/0), Klasse]
export const WEICH = [
  [/deltoid/, 'deltoid', 'Deltamuskel', 'M. deltoideus', 'Hebt den Arm nach vorn, zur Seite und nach hinten.', 1],
  [/supraspinatus/, 'supraspinatus', 'Obergrätenmuskel', 'M. supraspinatus', 'Startet das seitliche Armheben und hält den Oberarmkopf mittig in der Pfanne. Seine Sehne läuft unter dem Schulterdach hindurch.', 0],
  [/infraspinatus/, 'infraspinatus', 'Untergrätenmuskel', 'M. infraspinatus', 'Dreht den Arm nach außen und stabilisiert das Schultergelenk.', 0],
  [/teres minor/, 'teresminor', 'Kleiner Rundmuskel', 'M. teres minor', 'Dreht den Arm nach außen, Teil der Rotatorenmanschette.', 0],
  [/subscapularis/, 'subscapularis', 'Unterschulterblattmuskel', 'M. subscapularis', 'Dreht den Arm nach innen, Teil der Rotatorenmanschette.', 0],
  [/teres major/, 'teresmajor', 'Großer Rundmuskel', 'M. teres major', 'Zieht den Arm nach hinten und innen.', 1],
  [/descending part of trapezius/, 'trapdesc', 'Oberer Kapuzenmuskel', 'M. trapezius, Pars descendens', 'Hebt die Schulter und hält den Nacken. Oft verspannt bei Nackenschmerz.', 1],
  [/transverse part of trapezius/, 'traptrans', 'Mittlerer Kapuzenmuskel', 'M. trapezius, Pars transversa', 'Zieht die Schulterblätter zur Wirbelsäule.', 1],
  [/ascending part of trapezius/, 'trapasc', 'Unterer Kapuzenmuskel', 'M. trapezius, Pars ascendens', 'Zieht das Schulterblatt nach unten und dreht es beim Armheben mit.', 1],
  [/levator scapulae/, 'levscap', 'Schulterblattheber', 'M. levator scapulae', 'Hebt das Schulterblatt und neigt den Hals zur Seite.', 0],
  [/rhomboid/, 'rhomboid', 'Rautenmuskeln', 'Mm. rhomboidei', 'Halten das Schulterblatt am Brustkorb und ziehen es zur Wirbelsäule.', 0],
  [/serratus anterior/, 'serrant', 'Vorderer Sägemuskel', 'M. serratus anterior', 'Hält das Schulterblatt am Brustkorb und dreht es beim Armheben nach oben.', 1],
  [/pectoralis major/, 'pecmaj', 'Großer Brustmuskel', 'M. pectoralis major', 'Zieht den Arm vor den Körper und dreht ihn nach innen.', 1],
  [/pectoralis minor/, 'pecmin', 'Kleiner Brustmuskel', 'M. pectoralis minor', 'Zieht das Schulterblatt nach vorn unten.', 0],
  [/latissimus/, 'latdorsi', 'Breiter Rückenmuskel', 'M. latissimus dorsi', 'Zieht den Arm nach unten und hinten, etwa beim Hochziehen.', 1],
  [/subclavius/, 'subclav', 'Unterschlüsselbeinmuskel', 'M. subclavius', 'Stabilisiert das Schlüsselbein.', 0],
  [/coracobrachialis/, 'coracobr', 'Hakenarmmuskel', 'M. coracobrachialis', 'Hebt den Arm nach vorn.', 0],
  [/biceps brachii/, 'biceps', 'Bizeps', 'M. biceps brachii', 'Beugt den Ellenbogen und dreht den Unterarm nach außen.', 1],
  [/brachialis$/, 'brachialis', 'Armbeuger', 'M. brachialis', 'Hauptbeuger des Ellenbogens.', 0],
  [/triceps/, 'triceps', 'Trizeps', 'M. triceps brachii', 'Streckt den Ellenbogen.', 1],
  [/anconeus/, 'anconeus', 'Knorrenmuskel', 'M. anconeus', 'Hilft beim Strecken des Ellenbogens.', 0],
  [/brachioradialis/, 'brachiorad', 'Oberarmspeichenmuskel', 'M. brachioradialis', 'Beugt den Ellenbogen, vor allem mit dem Daumen nach oben.', 1],
  [/pronator teres/, 'prontere', 'Runder Einwärtsdreher', 'M. pronator teres', 'Dreht den Unterarm nach innen.', 1],
  [/pronator quadratus/, 'pronquad', 'Viereckiger Einwärtsdreher', 'M. pronator quadratus', 'Dreht den Unterarm nach innen.', 0],
  [/supinator/, 'supinator', 'Auswärtsdreher', 'M. supinator', 'Dreht den Unterarm nach außen.', 0],
  [/extensor carpi radialis longus/, 'ecrl', 'Langer speichenseitiger Handstrecker', 'M. extensor carpi radialis longus', 'Streckt das Handgelenk und kippt die Hand zur Daumenseite.', 1],
  [/extensor carpi radialis brevis/, 'ecrb', 'Kurzer speichenseitiger Handstrecker', 'M. extensor carpi radialis brevis', 'Streckt das Handgelenk beim Greifen. Seine Sehne setzt am äußeren Ellenbogenknochen an.', 1],
  [/extensor digitorum$/, 'extdig', 'Fingerstrecker', 'M. extensor digitorum', 'Streckt die Finger.', 1],
  [/extensor digiti minimi/, 'extdm', 'Kleinfingerstrecker', 'M. extensor digiti minimi', 'Streckt den kleinen Finger.', 1],
  [/extensor carpi ulnaris/, 'ecu', 'Ellenseitiger Handstrecker', 'M. extensor carpi ulnaris', 'Streckt die Hand und kippt sie zur Kleinfingerseite.', 1],
  [/abductor pollicis longus/, 'apl', 'Langer Daumenabspreizer', 'M. abductor pollicis longus', 'Spreizt den Daumen ab.', 0],
  [/extensor pollicis/, 'extpol', 'Daumenstrecker', 'M. extensor pollicis', 'Strecken den Daumen.', 0],
  [/extensor indicis/, 'extind', 'Zeigefingerstrecker', 'M. extensor indicis', 'Streckt den Zeigefinger.', 0],
  [/flexor carpi radialis/, 'fcr', 'Speichenseitiger Handbeuger', 'M. flexor carpi radialis', 'Beugt das Handgelenk.', 1],
  [/palmaris longus/, 'palmaris', 'Langer Hohlhandmuskel', 'M. palmaris longus', 'Spannt die Hohlhand und beugt das Handgelenk.', 1],
  [/flexor carpi ulnaris/, 'fcu', 'Ellenseitiger Handbeuger', 'M. flexor carpi ulnaris', 'Beugt die Hand und kippt sie zur Kleinfingerseite.', 1],
  [/flexor digitorum superficialis/, 'fds', 'Oberflächlicher Fingerbeuger', 'M. flexor digitorum superficialis', 'Beugt die Finger. Seine Sehnen laufen durch den Karpaltunnel.', 0],
  [/flexor digitorum profundus/, 'fdp', 'Tiefer Fingerbeuger', 'M. flexor digitorum profundus', 'Beugt die Fingerendglieder. Seine Sehnen laufen durch den Karpaltunnel.', 0],
  [/flexor pollicis longus/, 'fpl', 'Langer Daumenbeuger', 'M. flexor pollicis longus', 'Beugt das Daumenendglied.', 0],
  [/(abductor|flexor) pollicis brevis|opponens pollicis|adductor pollicis/, 'thenar', 'Daumenballenmuskeln', 'Mm. thenares', 'Bewegen und stabilisieren den Daumen beim Greifen.', 1],
  [/digiti minimi(?: brevis)? of hand|opponens digiti minimi of hand/, 'hypothenar', 'Kleinfingerballenmuskeln', 'Mm. hypothenares', 'Bewegen den kleinen Finger.', 1],
  [/lumbricals of hand|interossei of hand/, 'handklein', 'Kleine Handmuskeln', 'Mm. lumbricales et interossei', 'Feinsteuerung der Finger.', 0],
  [/flexor retinaculum of wrist/, 'retinac', 'Dach des Karpaltunnels', 'Retinaculum musculorum flexorum', 'Festes Band über der Handwurzel. Darunter liegt der Karpaltunnel.', 1, 'band'],
  [/interosseous membrane of forearm/, 'membua', 'Zwischenknochenmembran (Unterarm)', 'Membrana interossea antebrachii', 'Verbindet Elle und Speiche.', 0, 'band'],
  [/sternocleidomastoid/, 'scm', 'Kopfwender', 'M. sternocleidomastoideus', 'Dreht und neigt den Kopf.', 1],
  [/scalenus/, 'scaleni', 'Treppenmuskeln', 'Mm. scaleni', 'Neigen den Hals zur Seite und heben beim Atmen die oberen Rippen.', 0],
  [/splenius/, 'splenius', 'Riemenmuskel', 'M. splenius capitis et cervicis', 'Streckt und dreht Kopf und Hals.', 0],
  [/semispinalis (capitis|cervicis)/, 'semisphals', 'Halbdornmuskel (Hals)', 'M. semispinalis capitis et cervicis', 'Streckt den Kopf.', 0],
  [/semispinalis thoracis/, 'semispbr', 'Halbdornmuskel (Brust)', 'M. semispinalis thoracis', 'Streckt und dreht die Brustwirbelsäule.', 0],
  [/longissimus (capitis|cervicis)/, 'longhals', 'Langer Kopf- und Halsmuskel', 'M. longissimus capitis et cervicis', 'Streckt und neigt Kopf und Hals.', 0],
  [/rectus capitis posterior|obliquus capitis/, 'subocc', 'Kurze Nackenmuskeln', 'Mm. suboccipitales', 'Steuern feine Kopfbewegungen. Häufig beteiligt, wenn Kopfschmerz vom Nacken ausgeht.', 0],
  [/longus colli|longus capitis|rectus capitis (anterior|lateralis)/, 'tiefhalsb', 'Tiefe Halsbeuger', 'M. longus colli et capitis', 'Stabilisieren die Halswirbelsäule von vorn.', 0],
  [/cervical intertransversarii|interspinales cervicis|cervical rotator/, 'halsklein', 'Kleine Halswirbelmuskeln', 'Mm. intertransversarii, interspinales, rotatores cervicis', 'Halten die Halswirbel Segment für Segment.', 0],
  [/iliocostalis/, 'iliocost', 'Darmbein-Rippen-Muskel', 'M. iliocostalis', 'Teil des Rückenstreckers: richtet den Rumpf auf.', 0],
  [/longissimus thoracis/, 'longthor', 'Langer Rückenmuskel', 'M. longissimus thoracis', 'Teil des Rückenstreckers: richtet den Rumpf auf.', 0],
  [/spinalis (cervicis|thoracis)/, 'spinalis', 'Dornmuskel', 'M. spinalis', 'Teil des Rückenstreckers.', 0],
  [/multifidus/, 'multifidus', 'Vielgespaltener Muskel', 'M. multifidus', 'Kleine, tiefe Stabilisatoren direkt an den Wirbeln.', 0],
  [/thoracic rotator|lumbar rotator|interspinales (lumborum|thoracis)|lumbar intertransversarius|levatores costarum/, 'wirbelklein', 'Kleine Wirbelmuskeln', 'Mm. rotatores, interspinales, intertransversarii', 'Halten die Wirbel Segment für Segment.', 0],
  [/quadratus lumborum/, 'qlumb', 'Quadratischer Lendenmuskel', 'M. quadratus lumborum', 'Neigt den Rumpf zur Seite und stabilisiert Becken und Lendenwirbelsäule.', 0],
  [/serratus posterior/, 'serrpost', 'Hinterer Sägemuskel', 'M. serratus posterior', 'Unterstützt die Atmung.', 0],
  [/intercostal|transversus thoracis/, 'intercost', 'Zwischenrippenmuskeln', 'Mm. intercostales', 'Bewegen die Rippen beim Atmen.', 0],
  [/diaphragm/, 'diaphragm', 'Zwerchfell', 'Diaphragma', 'Wichtigster Atemmuskel.', 0],
  [/rectus abdominis|pyramidalis/, 'rectabd', 'Gerader Bauchmuskel', 'M. rectus abdominis', 'Beugt den Rumpf nach vorn.', 1],
  [/external oblique/, 'obliext', 'Äußerer schräger Bauchmuskel', 'M. obliquus externus abdominis', 'Dreht und beugt den Rumpf.', 1],
  [/internal oblique/, 'obliint', 'Innerer schräger Bauchmuskel', 'M. obliquus internus abdominis', 'Dreht und beugt den Rumpf.', 0],
  [/transversus abdominis/, 'transabd', 'Querer Bauchmuskel', 'M. transversus abdominis', 'Spannt den Bauch wie ein Gürtel und gibt dem Rumpf Halt.', 0],
  [/linea alba|inguinal ligament/, 'bauchband', 'Bauchsehnenplatte und Leistenband', 'Linea alba, Lig. inguinale', 'Sehnige Verbindungen der Bauchmuskeln.', 1, 'band'],
  [/gluteus maximus/, 'glutmax', 'Großer Gesäßmuskel', 'M. gluteus maximus', 'Streckt die Hüfte, etwa beim Aufstehen und Treppensteigen.', 1],
  [/gluteus medius/, 'glutmed', 'Mittlerer Gesäßmuskel', 'M. gluteus medius', 'Hält das Becken beim Gehen waagerecht.', 0],
  [/gluteus minimus/, 'glutmin', 'Kleiner Gesäßmuskel', 'M. gluteus minimus', 'Hilft, das Becken beim Gehen zu halten.', 0],
  [/piriformis/, 'piriformis', 'Birnenförmiger Muskel', 'M. piriformis', 'Dreht das Bein nach außen.', 0],
  [/gemellus|obturator|quadratus femoris/, 'aussenrot', 'Kleine Hüftaußendreher', 'Mm. gemelli, obturatorii, quadratus femoris', 'Drehen das Bein nach außen und zentrieren den Hüftkopf.', 0],
  [/iliacus/, 'iliacus', 'Darmbeinmuskel', 'M. iliacus', 'Beugt die Hüfte, zusammen mit dem großen Lendenmuskel.', 0],
  [/psoas/, 'psoas', 'Großer Lendenmuskel', 'M. psoas major', 'Beugt die Hüfte und hält die Lendenwirbelsäule.', 0],
  [/tensor fasciae latae/, 'tfl', 'Schenkelbindenspanner', 'M. tensor fasciae latae', 'Spannt das Iliotibialband und hilft beim Abspreizen.', 1],
  [/iliotibial tract/, 'itb', 'Iliotibialband', 'Tractus iliotibialis', 'Kräftige Sehnenplatte an der Außenseite des Oberschenkels.', 1, 'band'],
  [/sartorius/, 'sartorius', 'Schneidermuskel', 'M. sartorius', 'Beugt Hüfte und Knie.', 1],
  [/rectus femoris/, 'rectfem', 'Gerader Oberschenkelmuskel', 'M. rectus femoris', 'Teil des Quadrizeps: streckt das Knie und beugt die Hüfte.', 1],
  [/vastus lateralis/, 'vastlat', 'Äußerer Schenkelmuskel', 'M. vastus lateralis', 'Teil des Quadrizeps: streckt das Knie.', 1],
  [/vastus medialis/, 'vastmed', 'Innerer Schenkelmuskel', 'M. vastus medialis', 'Teil des Quadrizeps: streckt das Knie und führt die Kniescheibe.', 1],
  [/vastus intermedius/, 'vastint', 'Mittlerer Schenkelmuskel', 'M. vastus intermedius', 'Teil des Quadrizeps: streckt das Knie.', 0],
  [/gracilis/, 'gracilis', 'Schlanker Muskel', 'M. gracilis', 'Zieht das Bein heran und beugt das Knie.', 1],
  [/adductor (longus|brevis|magnus|minimus)|pectineus/, 'adduktor', 'Adduktoren', 'Mm. adductores', 'Ziehen das Bein zur Mitte.', 1],
  [/biceps femoris/, 'bicfem', 'Zweiköpfiger Oberschenkelmuskel', 'M. biceps femoris', 'Beugt das Knie und streckt die Hüfte.', 1],
  [/semitendinosus/, 'semiten', 'Halbsehnenmuskel', 'M. semitendinosus', 'Beugt das Knie und streckt die Hüfte. Seine Sehne wird oft für die Kreuzbandplastik genutzt.', 1],
  [/semimembranosus/, 'semimem', 'Plattensehnenmuskel', 'M. semimembranosus', 'Beugt das Knie und streckt die Hüfte.', 1],
  [/gastrocnemius/, 'gastro', 'Zwillingswadenmuskel', 'M. gastrocnemius', 'Hebt die Ferse und beugt das Knie.', 1],
  [/soleus/, 'soleus', 'Schollenmuskel', 'M. soleus', 'Hebt die Ferse, wichtig beim Gehen und Stehen.', 0],
  [/plantaris/, 'plantaris', 'Fußsohlenspanner', 'M. plantaris', 'Kleiner Wadenmuskel.', 0],
  [/calcaneal tendon/, 'achilles', 'Achillessehne', 'Tendo calcaneus', 'Kräftigste Sehne des Körpers: verbindet die Wadenmuskeln mit der Ferse.', 1, 'band'],
  [/popliteus/, 'popliteus', 'Kniekehlenmuskel', 'M. popliteus', 'Entriegelt das gestreckte Knie.', 0],
  [/tibialis anterior/, 'tibant', 'Vorderer Schienbeinmuskel', 'M. tibialis anterior', 'Hebt den Fuß an.', 1],
  [/tibialis posterior/, 'tibpost', 'Hinterer Schienbeinmuskel', 'M. tibialis posterior', 'Stützt das Fußgewölbe.', 0],
  [/extensor digitorum longus|fibularis tertius/, 'edl', 'Langer Zehenstrecker', 'M. extensor digitorum longus', 'Hebt Zehen und Fuß.', 1],
  [/extensor hallucis longus/, 'ehl', 'Langer Großzehenstrecker', 'M. extensor hallucis longus', 'Hebt die Großzehe.', 0],
  [/fibularis longus/, 'fiblong', 'Langer Wadenbeinmuskel', 'M. fibularis longus', 'Stabilisiert das Sprunggelenk gegen Umknicken.', 1],
  [/fibularis brevis/, 'fibbrev', 'Kurzer Wadenbeinmuskel', 'M. fibularis brevis', 'Stabilisiert das Sprunggelenk gegen Umknicken.', 0],
  [/flexor digitorum longus/, 'fdl', 'Langer Zehenbeuger', 'M. flexor digitorum longus', 'Beugt die Zehen.', 0],
  [/flexor hallucis longus/, 'fhl', 'Langer Großzehenbeuger', 'M. flexor hallucis longus', 'Beugt die Großzehe und stützt das Gewölbe.', 0],
  [/extensor (digitorum|hallucis) brevis|hallucis|flexor accessorius|flexor digitorum brevis|digiti minimi(?: brevis)? of foot|lumbrical of foot|interosse.* of foot/, 'fussklein', 'Kurze Fußmuskeln', 'Mm. pedis', 'Halten das Fußgewölbe und bewegen die Zehen.', 1],
  [/long plantar ligament/, 'langplant', 'Langes Sohlenband', 'Lig. plantare longum', 'Stützt das Längsgewölbe.', 0, 'band'],
  [/interosseous membrane of leg/, 'membub', 'Zwischenknochenmembran (Unterschenkel)', 'Membrana interossea cruris', 'Verbindet Schienbein und Wadenbein.', 0, 'band'],
  [/masseter/, 'masseter', 'Kaumuskel', 'M. masseter', 'Schließt den Kiefer beim Kauen. Spannt sich oft beim Zähnepressen an.', 1],
  [/temporalis/, 'temporalis', 'Schläfenmuskel', 'M. temporalis', 'Schließt den Kiefer.', 1],
  [/pterygoid/, 'pterygoid', 'Flügelmuskeln', 'Mm. pterygoidei', 'Bewegen den Unterkiefer nach vorn und zur Seite.', 0],
  // schematische Zusatzstrukturen
  [/^Innenmeniskus/, 'innenmen', 'Innenmeniskus', 'Meniscus medialis', 'Stoßdämpfer zwischen Ober- und Unterschenkel auf der Innenseite.', 0, 'menisk'],
  [/^Außenmeniskus/, 'aussenmen', 'Außenmeniskus', 'Meniscus lateralis', 'Stoßdämpfer auf der Außenseite des Knies.', 0, 'menisk'],
  [/^Vorderes Kreuzband/, 'vkb', 'Vorderes Kreuzband', 'Lig. cruciatum anterius', 'Verhindert, dass der Unterschenkel nach vorn gleitet, und stabilisiert bei Drehungen.', 0, 'band'],
  [/^Hinteres Kreuzband/, 'hkb', 'Hinteres Kreuzband', 'Lig. cruciatum posterius', 'Verhindert, dass der Unterschenkel nach hinten gleitet.', 0, 'band'],
  [/^Innenband/, 'innenband', 'Innenband', 'Lig. collaterale mediale', 'Hält das Knie gegen X-Bein-Stress.', 0, 'band'],
  [/^Außenband Knie/, 'aussenbandk', 'Außenband (Knie)', 'Lig. collaterale laterale', 'Hält das Knie gegen O-Bein-Stress.', 0, 'band'],
  [/^Patellasehne/, 'patsehne', 'Patellasehne', 'Lig. patellae', 'Verbindet die Kniescheibe mit dem Schienbein und überträgt die Kraft des Quadrizeps.', 1, 'band'],
  [/ATFL/, 'atfl', 'Vorderes Außenband (Sprunggelenk)', 'Lig. talofibulare anterius', 'Häufigstes verletztes Band beim Umknicken.', 1, 'band'],
  [/CFL/, 'cfl', 'Mittleres Außenband (Sprunggelenk)', 'Lig. calcaneofibulare', 'Stabilisiert das Sprunggelenk an der Außenseite.', 1, 'band'],
  [/^Plantarfaszie/, 'plantfasz', 'Plantarfaszie', 'Aponeurosis plantaris', 'Sehnenplatte unter der Fußsohle, spannt das Längsgewölbe.', 0, 'band'],
];

const FINGER = {thumb:'Daumen','index finger':'Zeigefinger','middle finger':'Mittelfinger','ring finger':'Ringfinger','little finger':'Kleinfinger','big toe':'Großzehe','second toe':'2. Zehe','third toe':'3. Zehe','fourth toe':'4. Zehe','little toe':'Kleinzehe'};
const ROEM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const FINGER_LAT = {thumb:'pollicis','index finger':'digiti II manus','middle finger':'digiti III manus','ring finger':'digiti IV manus','little finger':'digiti V manus','big toe':'hallucis','second toe':'digiti II pedis','third toe':'digiti III pedis','fourth toe':'digiti IV pedis','little toe':'digiti V pedis'};
const GLIED = {proximal:'Grundglied',middle:'Mittelglied',distal:'Endglied'};
const EINZEL = {
  sacrum:['Kreuzbein','Os sacrum'], 'hip bone':['Beckenknochen','Os coxae'], femur:['Oberschenkelknochen','Femur'], patella:['Kniescheibe','Patella'],
  tibia:['Schienbein','Tibia'], fibula:['Wadenbein','Fibula'], talus:['Sprungbein','Talus'], calcaneus:['Fersenbein','Calcaneus'],
  'navicular bone of foot':['Kahnbein (Fuß)','Os naviculare'], 'cuboid bone':['Würfelbein','Os cuboideum'], 'medial cuneiform bone':['Inneres Keilbein','Os cuneiforme mediale'],
  'intermediate cuneiform bone':['Mittleres Keilbein','Os cuneiforme intermedium'], 'lateral cuneiform bone':['Äußeres Keilbein','Os cuneiforme laterale'], 'sesamoid bone of foot':['Sesambein','Ossa sesamoidea pedis'],
  humerus:['Oberarmknochen','Humerus'], scapula:['Schulterblatt','Scapula'], clavicle:['Schlüsselbein','Clavicula'], radius:['Speiche','Radius'], ulna:['Elle','Ulna'],
  scaphoid:['Kahnbein (Hand)','Os scaphoideum'], lunate:['Mondbein','Os lunatum'], triquetral:['Dreiecksbein','Os triquetrum'], pisiform:['Erbsenbein','Os pisiforme'],
  trapezium:['Großes Vieleckbein','Os trapezium'], trapezoid:['Kleines Vieleckbein','Os trapezoideum'], capitate:['Kopfbein','Os capitatum'], hamate:['Hakenbein','Os hamatum'],
  mandible:['Unterkiefer','Mandibula'], 'temporal bone':['Schläfenbein','Os temporale'], 'hyoid bone':['Zungenbein','Os hyoideum'],
  'occipital bone':['Hinterhauptbein','Os occipitale'], atlas:['1. Halswirbel (Atlas)','Atlas'], axis:['2. Halswirbel (Axis)','Axis'],
  manubrium:['Brustbein','Sternum'], 'body of sternum':['Brustbein','Sternum'], 'xiphoid process':['Brustbein','Sternum'],
};
const SCHAEDEL = /frontal bone|parietal bone|sphenoid|ethmoid|nasal bone|lacrimal|maxilla|zygomatic bone|palatine|vomer|concha/;

// Liefert {key, de, lat, fn, sup, cls}
const ZAHN = {'central secondary incisor':[1,'mittlerer Schneidezahn','Dens incisivus medialis'],'lateral secondary incisor':[2,'seitlicher Schneidezahn','Dens incisivus lateralis'],'secondary canine':[3,'Eckzahn','Dens caninus'],'first secondary premolar':[4,'erster kleiner Backenzahn','Dens premolaris primus'],'second secondary premolar':[5,'zweiter kleiner Backenzahn','Dens premolaris secundus'],'first secondary molar':[6,'erster Backenzahn','Dens molaris primus'],'second secondary molar':[7,'zweiter Backenzahn','Dens molaris secundus']};
export function benenne(base, seite) {
  let z;
  if ((z = base.match(/^(upper|lower) (.+) tooth$/))) {
    const t = ZAHN[z[2]] || [0, 'Zahn', 'Dens'], oben = z[1] === 'upper', q = oben ? (seite === 'r' ? 1 : 2) : (seite === 'r' ? 4 : 3), fdi = `${q}${t[0]}`;
    return {key:'zahn:' + fdi, de:`Zahn ${fdi}, ${t[1]} ${oben ? 'oben' : 'unten'} ${seite === 'r' ? 'rechts' : 'links'}`, lat:`${t[2]} (${fdi})`, fn:oben ? 'Zahn des Oberkiefers.' : 'Zahn des Unterkiefers.', sup:0, cls:'zahn'};
  }
  for (const w of WEICH) if (w[0].test(base)) return {key:w[1], de:w[2], lat:w[3], fn:w[4], sup:w[5], cls:w[6] || 'muskel'};
  let m;
  if ((m = base.match(/^intervertebral disk of (axis|(\w+) (cervical|thoracic|lumbar) vertebra)$/))) {
    const lab = segName(m[1] === 'axis' ? ['cervical', 2] : [m[3], ORD[m[2]]]);
    return {key:'disk:' + lab, de:'Bandscheibe ' + lab, lat:'Discus intervertebralis ' + lab, fn:'Puffer zwischen zwei Wirbeln. Gibt der Wirbelsäule Beweglichkeit.', sup:0, cls:'disk'};
  }
  if ((m = base.match(/^(\w+) (cervical|thoracic|lumbar) vertebra$/))) {
    const n = ORD[m[1]], k = {cervical:['Halswirbel','C'], thoracic:['Brustwirbel','Th'], lumbar:['Lendenwirbel','L']}[m[2]];
    const lt = {C:'cervicalis', Th:'thoracica', L:'lumbalis'}[k[1]];
    return {key:'wirbel:' + k[1] + n, de:`${n}. ${k[0]} (${k[1]}${n})`, lat:`Vertebra ${lt} ${ROEM[n]} (${k[1]}${n})`, fn:'', sup:0, cls:'knochen'};
  }
  if ((m = base.match(/^(\w+) rib$/))) return {key:'rippe' + ORD[m[1]], de:`${ORD[m[1]]}. Rippe`, lat:`Costa ${ROEM[ORD[m[1]]]}`, fn:'', sup:0, cls:'knochen'};
  if (/costal cartilage/.test(base)) return {key:'rippenknorpel', de:'Rippenknorpel', lat:'Cartilago costalis', fn:'Elastische Verbindung der Rippen zum Brustbein.', sup:0, cls:'knorpel'};
  if ((m = base.match(/^(\w+) (metacarpal|metatarsal) bone$/))) {
    const hand = m[2] === 'metacarpal';
    return {key:m[2] + ORD[m[1]], de:`${ORD[m[1]]}. ${hand ? 'Mittelhandknochen' : 'Mittelfußknochen'}`, lat:`Os ${m[2] === 'metacarpal' ? 'metacarpale' : 'metatarsale'} ${ROEM[ORD[m[1]]]}`, fn:'', sup:0, cls:'knochen'};
  }
  if ((m = base.match(/^(proximal|middle|distal) phalanx of (.+)$/))) {
    const f = FINGER[m[2]] || m[2];
    return {key:'phal:' + m[1] + ':' + m[2], de:`${f}, ${GLIED[m[1]]}`, lat:`Phalanx ${m[1] === 'proximal' ? 'proximalis' : m[1] === 'middle' ? 'media' : 'distalis'} ${FINGER_LAT[m[2]] || ''}`.trim(), fn:'', sup:0, cls:'knochen'};
  }
  if (SCHAEDEL.test(base)) return {key:'schaedel', de:'Schädel', lat:'Cranium', fn:'', sup:0, cls:'knochen'};
  const e = EINZEL[base];
  if (e) return {key:e[1], de:e[0], lat:e[1], fn:'', sup:0, cls:'knochen'};
  return {key:base, de:base, lat:base, fn:'', sup:0, cls:'knochen'};
}
function segName([reg, n]) {
  if (reg === 'cervical') return n === 7 ? 'C7/Th1' : `C${n}/C${n + 1}`;
  if (reg === 'thoracic') return n === 12 ? 'Th12/L1' : `Th${n}/Th${n + 1}`;
  return n === 5 ? 'L5/S1' : `L${n}/L${n + 1}`;
}

const BEIN_K = /femur|patella|tibia|fibula|talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|toe|sesamoid/;
const ARM_K = /humerus|radius|ulna|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|thumb|finger/;

// Regionen. b = Knochen-Muster (Basisname), m = Schlüssel der Weichteile, seite = rechts/links wählbar
export const REGIONEN = [
  {k:'koerper', t:'Ganzer Körper', alles:true, blick:[0, 0.05, 1]},
  {k:'kiefer', t:'Kiefer', b:/tooth|mandible|temporal bone|maxilla|zygomatic|sphenoid|frontal bone|parietal|occipital|ethmoid|nasal bone|lacrimal|palatine|vomer|concha|hyoid|^atlas$|^axis$/, m:['masseter','temporalis','pterygoid','scm'], blick:[0.75, 0.1, 0.65]},
  {k:'hws', t:'HWS', b:/cervical vertebra|^atlas$|^axis$|occipital bone|disk of (axis|\w+ cervical)|first thoracic vertebra|^first rib|clavicle|temporal bone|mandible|parietal/, m:['trapdesc','levscap','scm','scaleni','splenius','semisphals','longhals','subocc','tiefhalsb','halsklein','multifidus','iliocost','spinalis'], blick:[0.45, 0.15, -1]},
  {k:'schulter', t:'Schulter', seite:true, b:/scapula|clavicle|humerus|manubrium|^first rib|^second rib|^radius$|^ulna$/, m:['deltoid','supraspinatus','infraspinatus','teresminor','subscapularis','teresmajor','trapdesc','traptrans','trapasc','levscap','rhomboid','serrant','pecmaj','pecmin','latdorsi','subclav','coracobr','biceps','triceps'], blick:[0.85, 0.25, 0.75]},
  {k:'ellenbogen', t:'Ellenbogen', seite:true, b:/humerus|radius|ulna/, m:['biceps','brachialis','triceps','anconeus','brachiorad','prontere','supinator','ecrl','ecrb','extdig','extdm','ecu','fcr','palmaris','fcu','fds','fdp','apl','membua'], blick:[0.9, 0.1, 0.45], zoom:0.9},
  {k:'hand', t:'Hand', seite:true, b:/radius|ulna|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|thumb|finger/, m:['fcr','palmaris','fcu','fds','fdp','fpl','thenar','hypothenar','handklein','retinac','extdig','ecu','ecrl','ecrb','apl','extpol','extind','extdm','pronquad','membua'], blick:[0.15, 0.2, 1], ausschnitt:'hand'},
  {k:'bws', t:'BWS', b:/thoracic vertebra|disk of \w+ thoracic|rib$|sternum|manubrium|xiphoid|scapula/, m:['traptrans','trapasc','rhomboid','iliocost','longthor','spinalis','semispbr','multifidus','wirbelklein','serrpost','intercost','latdorsi'], blick:[0.3, 0.2, -1]},
  {k:'lws', t:'LWS', b:/lumbar vertebra|disk of (\w+ lumbar|twelfth thoracic)|twelfth thoracic|sacrum|hip bone|^eleventh rib|^twelfth rib/, m:['qlumb','iliocost','longthor','multifidus','wirbelklein','psoas','iliacus','transabd','obliint','obliext','rectabd','glutmax','glutmed','latdorsi','bauchband'], blick:[0.45, 0.1, -1]},
  {k:'huefte', t:'Hüfte', seite:true, b:/hip bone|sacrum|femur|fifth lumbar vertebra/, m:['glutmax','glutmed','glutmin','piriformis','aussenrot','iliacus','psoas','tfl','itb','sartorius','rectfem','adduktor','gracilis','bicfem','semiten','semimem','vastlat'], blick:[0.9, 0.05, 0.5]},
  {k:'knie', t:'Knie', seite:true, b:/femur|patella|tibia|fibula/, m:['rectfem','vastlat','vastmed','vastint','sartorius','gracilis','bicfem','semiten','semimem','gastro','plantaris','popliteus','itb','innenmen','aussenmen','vkb','hkb','innenband','aussenbandk','patsehne'], blick:[0.5, 0.15, 1], ausschnitt:'knie'},
  {k:'fuss', t:'Fuß', seite:true, b:/tibia|fibula|talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|toe|sesamoid/, m:['gastro','soleus','plantaris','achilles','tibant','tibpost','edl','ehl','fiblong','fibbrev','fdl','fhl','fussklein','langplant','membub','atfl','cfl','plantfasz'], blick:[1, 0.3, 0.6], ausschnitt:'fuss'},
];

// Behandlungstexte aus Doku-Fix (Detonisierung) auf Strukturen abbilden
export const BEH_MAP = [
  [/supraspinatus/, ['supraspinatus']], [/infraspinatus/, ['infraspinatus']], [/teres minor/, ['teresminor']], [/teres major/, ['teresmajor']],
  [/subscapularis/, ['subscapularis']], [/rotatorenmanschette/, ['supraspinatus','infraspinatus','teresminor','subscapularis']],
  [/trapezius.*descend/, ['trapdesc']], [/trapezius.*transvers/, ['traptrans']], [/trapezius.*ascend/, ['trapasc']], [/trapezius$/, ['trapdesc','traptrans','trapasc']],
  [/levator scapulae/, ['levscap']], [/rhomboid/, ['rhomboid']], [/pectoralis major/, ['pecmaj']], [/pectoralis minor/, ['pecmin']],
  [/latissimus/, ['latdorsi']], [/deltoideus/, ['deltoid']], [/biceps brachii|bizeps/, ['biceps']], [/triceps/, ['triceps']], [/brachioradialis/, ['brachiorad']],
  [/sternocleidomastoideus/, ['scm']], [/scaleni/, ['scaleni']], [/splenius/, ['splenius']], [/suboccipital/, ['subocc']], [/semispinalis/, ['semisphals']],
  [/erector spinae.*(lumbal|lws)/, ['iliocost','longthor','multifidus']], [/erector spinae/, ['iliocost','longthor','spinalis']], [/multifidus/, ['multifidus']],
  [/quadratus lumborum/, ['qlumb']], [/iliopsoas|psoas/, ['psoas','iliacus']], [/piriformis/, ['piriformis']], [/gluteus maximus/, ['glutmax']], [/gluteus medius/, ['glutmed']],
  [/gluteus minimus/, ['glutmin']], [/tensor fasciae/, ['tfl']], [/tractus iliotib/, ['itb']], [/rectus femoris/, ['rectfem']], [/vastus lateralis/, ['vastlat']], [/vastus medialis/, ['vastmed']],
  [/quadri[cz]eps/, ['rectfem','vastlat','vastmed','vastint']], [/ischiokrural|hamstring/, ['bicfem','semiten','semimem']], [/biceps femoris/, ['bicfem']], [/adduktor|adductor/, ['adduktor']],
  [/gastrocnemius/, ['gastro']], [/soleus/, ['soleus']], [/triceps surae|wade/, ['gastro','soleus']], [/tibialis anterior/, ['tibant']], [/tibialis posterior/, ['tibpost']],
  [/fibularis|peroneus/, ['fiblong','fibbrev']], [/extensor carpi radialis/, ['ecrl','ecrb']], [/extensor carpi ulnaris/, ['ecu']], [/extensor digitorum/, ['extdig']],
  [/flexor carpi radialis/, ['fcr']], [/flexor carpi ulnaris/, ['fcu']], [/pronator teres/, ['prontere']], [/masseter/, ['masseter']], [/temporalis/, ['temporalis']], [/pterygoid/, ['pterygoid']],
];

// Erklär-Szenen. p = Problem (rot), b = woran wir arbeiten (blau), extra = Zusatzdarstellung
export const SZENEN = [
  {k:'impingement', schicht:'tief', blick:[0.75, 0.55, 0.5], t:'Engpass unter dem Schulterdach', fach:'Subakromiales Schmerzsyndrom (Impingement)', r:'schulter', such:/impingement|subakromi|engpass/,
    p:['supraspinatus'], b:['infraspinatus','teresminor','subscapularis','trapasc','serrant'], bew:'schulter_abd', bogen:[60, 120],
    was:'Die Sehne des Obergrätenmuskels läuft unter dem Schulterdach hindurch. Ist sie gereizt, schmerzt vor allem das Armheben zwischen etwa 60 und 120 Grad. Die Sehne ist nicht kaputt, sie ist empfindlich geworden.',
    wir:'Wir kräftigen die Muskeln, die den Oberarmkopf in der Pfanne zentrieren, und trainieren das Schulterblatt, damit beim Heben mehr Platz bleibt. Die Belastung steigern wir Schritt für Schritt.'},
  {k:'rotatoren', schicht:'tief', blick:[0.75, 0.55, 0.5], t:'Rotatorenmanschette', fach:'Rotatorenmanschettenläsion / Z. n. Naht', r:'schulter', such:/rotatorenmanschette|rm-naht|rm naht|supraspinatusl/,
    p:['supraspinatus'], b:['infraspinatus','teresminor','subscapularis','deltoid'], bew:'schulter_abd',
    was:'Die Rotatorenmanschette ist eine Gruppe aus vier Muskeln, die den Oberarmkopf wie eine Manschette umgreifen. Meist ist die Sehne des Obergrätenmuskels betroffen.',
    wir:'Wir schützen die Sehne, solange sie heilt, und bauen dann Beweglichkeit und Kraft in festen Stufen auf. Die übrigen Muskeln der Manschette übernehmen dabei viel Arbeit.'},
  {k:'frozen', schicht:'knochen', blick:[0.8, 0.2, 0.8], t:'Schultersteife', fach:'Adhäsive Kapsulitis (Frozen Shoulder)', r:'schulter', such:/frozen|kapsulitis|schultersteife/,
    p:[], b:['infraspinatus','subscapularis'], arthrose:'schulter', bew:'schulter_abd',
    was:'Die Kapsel des Schultergelenks ist entzündlich verändert und zieht sich zusammen. Das Gelenk wird steif, vor allem das Drehen nach außen. Der Verlauf ist lang, bildet sich aber fast immer zurück.',
    wir:'Wir bewegen die Schulter im schmerzarmen Bereich, mobilisieren das Gelenk sanft und halten die Muskulatur aktiv. Mit der Zeit wird der Bewegungsraum wieder größer.'},
  {k:'tennis', blick:[1, 0.15, 0.15], t:'Tennisellenbogen', fach:'Epicondylitis humeri radialis', r:'ellenbogen', such:/epicondylitis.*radial|tennis|epikondylitis.*lat/,
    p:['ecrb'], b:['ecrl','ecrb','extdig','ecu'], bew:'ellenbogen_flex',
    was:'Am äußeren Ellenbogenknochen setzen die Handstrecker an. Durch viel Greifen oder Tippen ist die Sehne des kurzen Handstreckers überlastet und reagiert empfindlich.',
    wir:'Wir dosieren die Belastung, kräftigen die Unterarmstrecker gezielt und langsam steigernd und lockern die Muskulatur. Sehnen brauchen Zeit, gewöhnen sich aber gut an Training.'},
  {k:'golfer', blick:[-0.9, 0.1, 0.5], t:'Golferellenbogen', fach:'Epicondylitis humeri ulnaris', r:'ellenbogen', such:/epicondylitis.*ulnar|golfer|epikondylitis.*med/,
    p:['fcr','prontere'], b:['fcr','fcu','prontere','palmaris'], bew:'ellenbogen_flex',
    was:'Am inneren Ellenbogenknochen setzen die Handbeuger an. Ihre gemeinsame Sehne ist überlastet und reagiert empfindlich.',
    wir:'Wir kräftigen die Handbeuger dosiert, lockern die Muskulatur und passen die Belastung im Alltag an.'},
  {k:'karpal', schicht:'tief', blick:[0, 0.3, 1], t:'Karpaltunnelsyndrom', fach:'Karpaltunnelsyndrom', r:'hand', such:/karpaltunnel|carpaltunnel|cts/,
    p:['retinac'], b:['fds','fdp','thenar'], nerv:'medianus',
    was:'Unter dem festen Band an der Handwurzel laufen die Beugesehnen und der Mittelnerv. Wird es dort eng, drückt das auf den Nerv. Typisch ist nächtliches Kribbeln in Daumen bis Mittelfinger.',
    wir:'Wir verbessern das Gleiten von Nerv und Sehnen, entlasten die Hand im Alltag und in der Nacht und kräftigen die Hand, wenn die Beschwerden ruhiger sind.'},
  {k:'nacken', blick:[0.4, 0.3, -1], t:'Nackenschmerz', fach:'Zervikalsyndrom', r:'hws', such:/zervikal|cervikal|hws|nacken|cervical/,
    p:['trapdesc','levscap'], b:['tiefhalsb','subocc','traptrans','trapasc'],
    was:'Die Nackenmuskeln sind angespannt und empfindlich geworden. Das ist unangenehm, aber kein Zeichen für einen Schaden an der Wirbelsäule.',
    wir:'Wir lockern die verspannten Muskeln, trainieren die tiefen Halsbeuger und die Haltemuskeln der Schulterblätter und bringen wieder mehr Bewegung in die Halswirbelsäule.'},
  {k:'kreuz', schicht:'tief', blick:[0.4, 0.15, -1], t:'Kreuzschmerz', fach:'Nicht spezifischer Kreuzschmerz (Lumbalgie)', r:'lws', such:/lumbalgie|kreuzschmerz|lumbago|lws-syndrom|lws syndrom|rückenschmerz/,
    p:['iliocost','longthor','qlumb'], b:['multifidus','transabd','glutmax','glutmed'],
    was:'Der Rücken ist robust. Meist steckt hinter Kreuzschmerz keine Verletzung, sondern ein empfindlich gewordenes System aus Muskeln, Gelenken und Nerven. Bewegung hilft, Schonung eher nicht.',
    wir:'Wir bringen den Rücken in Bewegung, kräftigen Rumpf und Gesäß und steigern die Belastung so, dass der Alltag wieder leichter geht.'},
  {k:'bandscheibe', aus:['Os coxae'], schicht:'knochen', blick:[1, 0.12, -0.3], fokus:'disk', t:'Bandscheibenvorfall', fach:'Bandscheibenvorfall L5/S1 mit Wurzelreizung', r:'lws', such:/bandscheibe|prolaps|protrusion|nukleus|nucleus|bsv|radikul|ischialgie|lumboischialgie/,
    p:['disk:L5/S1'], b:['multifidus','transabd'], prolaps:'L5/S1',
    was:'Ein Teil des Bandscheibenkerns ist nach hinten ausgewichen und reizt die benachbarte Nervenwurzel. Deshalb kann der Schmerz ins Bein ausstrahlen. Viele Vorfälle bilden sich von selbst zurück.',
    wir:'Wir suchen Bewegungen, die den Beinschmerz lindern, bauen schrittweise Belastung auf und kräftigen die tiefen Rumpfmuskeln. Der Nerv wird sanft mobilisiert.'},
  {k:'gonarthrose', schicht:'knochen', blick:[-0.6, 0.15, 1], t:'Kniearthrose', fach:'Gonarthrose', r:'knie', such:/gonarthrose|kniearthrose|arthrose.*knie/,
    p:['innenmen'], b:['rectfem','vastmed','vastlat','vastint','glutmed'], arthrose:'knie', bew:'knie_flex',
    was:'Der Knorpel an den Gelenkflächen ist dünner geworden, meist auf der Innenseite. Das gehört oft zum Älterwerden dazu. Wie stark es schmerzt, hängt viel davon ab, wie kräftig die Muskeln sind und wie das Knie belastet wird.',
    wir:'Wir kräftigen Oberschenkel und Hüfte, verbessern die Beweglichkeit und dosieren die Belastung. Bewegung ernährt den Knorpel.'},
  {k:'vkb', aus:['Patella','patsehne'], schicht:'knochen', blick:[-0.45, 0.1, 1], t:'Vorderes Kreuzband', fach:'VKB-Ruptur / Z. n. VKB-Plastik', r:'knie', such:/vkb|kreuzband|acl/,
    p:['vkb'], b:['rectfem','vastmed','vastlat','bicfem','semiten','semimem'], bew:'knie_flex',
    was:'Das vordere Kreuzband sichert das Knie bei Drehungen und Stopps. Nach einer Plastik wächst das Ersatzband ein und wird über Monate belastbar.',
    wir:'Wir bauen Kraft im Oberschenkel und im Gesäß auf, trainieren Gleichgewicht und Sprünge in Stufen und prüfen vor der Rückkehr in den Sport, ob das Knie bereit ist.'},
  {k:'meniskus', aus:['Patella','patsehne'], schicht:'knochen', blick:[-0.4, 0.75, 0.8], t:'Meniskus', fach:'Meniskusläsion', r:'knie', such:/menisk/,
    p:['innenmen'], b:['rectfem','vastmed','vastlat'], bew:'knie_flex',
    was:'Die Menisken sind Stoßdämpfer zwischen Ober- und Unterschenkel. Ein Einriss kann bei tiefem Beugen und Drehen Schmerzen machen.',
    wir:'Wir kräftigen die Beinmuskulatur, verbessern die Kontrolle des Knies und steigern die Beugung und das Drehen dosiert.'},
  {k:'patellasehne', blick:[0.3, 0.1, 1], t:'Patellasehne', fach:'Patellaspitzensyndrom (Patellatendinopathie)', r:'knie', such:/patellaspitz|patellasehne|jumper|patellatendin/,
    p:['patsehne'], b:['rectfem','vastmed','vastlat','vastint','glutmax'], bew:'knie_flex',
    was:'Die Sehne unter der Kniescheibe ist durch Springen oder Sprinten überlastet. Sie reagiert empfindlich, ist aber belastbar, wenn man sie richtig dosiert.',
    wir:'Wir trainieren den Quadrizeps mit gezielter Belastung der Sehne und steigern Sprünge und Sport schrittweise.'},
  {k:'coxarthrose', schicht:'knochen', blick:[0.3, 0.1, 1], t:'Hüftarthrose', fach:'Coxarthrose', r:'huefte', such:/coxarthrose|hüftarthrose|arthrose.*hüft/,
    p:[], b:['glutmed','glutmin','glutmax','psoas'], arthrose:'huefte', bew:'huefte_flex',
    was:'Der Knorpel im Hüftgelenk ist dünner geworden. Das Gelenk wird steifer, besonders morgens oder nach dem Sitzen.',
    wir:'Wir halten das Gelenk beweglich, kräftigen die Gesäßmuskeln und üben ein sicheres, ausdauerndes Gehen.'},
  {k:'tep', schicht:'knochen', blick:[0.3, 0.1, 1], t:'Künstliches Hüftgelenk', fach:'Z. n. Hüft-TEP', r:'huefte', such:/tep|endoprothese|hüftprothese/,
    p:[], b:['glutmed','glutmin','glutmax'], arthrose:'huefte', bew:'huefte_flex',
    was:'Pfanne und Kopf des Hüftgelenks wurden ersetzt. Die Muskeln rund um die Hüfte müssen jetzt wieder lernen, das neue Gelenk zu führen.',
    wir:'Wir trainieren das Gehen, kräftigen vor allem die Gesäßmuskeln und steigern die Belastung bis zum normalen Alltag.'},
  {k:'trochanter', schicht:'tief', blick:[1, 0.15, 0.1], t:'Schmerz an der Hüftaußenseite', fach:'Gluteale Tendinopathie (Trochanterschmerz)', r:'huefte', such:/trochanter|gluteal|bursitis tro/,
    p:['glutmed','glutmin'], b:['glutmed','glutmin','glutmax'],
    was:'Die Sehnen der mittleren und kleinen Gesäßmuskeln setzen außen am Oberschenkelknochen an. Sie sind gereizt, oft durch Liegen auf der Seite oder Überschlagen der Beine.',
    wir:'Wir vermeiden Druck auf die Sehne und kräftigen die Gesäßmuskeln mit steigender Belastung.'},
  {k:'achilles', blick:[0.6, 0.2, -1], t:'Achillessehne', fach:'Achillodynie (Achillestendinopathie)', r:'fuss', such:/achill/,
    p:['achilles'], b:['gastro','soleus'], bew:'osg',
    was:'Die Achillessehne ist überlastet und reagiert empfindlich. Sehnen passen sich an Belastung an, brauchen dafür aber Wochen bis Monate.',
    wir:'Wir kräftigen die Wadenmuskeln mit langsam steigender Last und planen die Rückkehr zum Laufen gemeinsam.'},
  {k:'umknick', schicht:'knochen', blick:[1, 0.25, 0.35], t:'Umgeknickt', fach:'Supinationstrauma, Außenbandverletzung OSG', r:'fuss', such:/supination|außenband|aussenband|osg-distorsion|distorsion.*osg|umknick|bandruptur.*osg/,
    p:['atfl','cfl'], b:['fiblong','fibbrev','tibant'], bew:'osg',
    was:'Beim Umknicken wurden die Außenbänder des Sprunggelenks gedehnt oder gerissen, meist das vordere. Bänder heilen gut, wenn das Gelenk geführt belastet wird.',
    wir:'Wir kräftigen die Muskeln, die vor dem Umknicken schützen, und trainieren das Gleichgewicht. Das senkt das Risiko für erneutes Umknicken.'},
  {k:'plantar', schicht:'knochen', blick:[0.5, -0.75, 0.3], t:'Fersenschmerz', fach:'Plantarfasziitis / plantarer Fersenschmerz', r:'fuss', such:/plantar|fersensporn|fersenschmerz/,
    p:['plantfasz'], b:['gastro','soleus','fussklein'], bew:'osg',
    was:'Die Sehnenplatte unter der Fußsohle ist am Ansatz an der Ferse gereizt. Typisch sind Schmerzen bei den ersten Schritten am Morgen.',
    wir:'Wir dehnen und kräftigen Wade und Fußsohle, kräftigen die kleinen Fußmuskeln und passen die Belastung an.'},
  {k:'cmd', blick:[1, 0.1, 0.45], t:'Kieferbeschwerden', fach:'Craniomandibuläre Dysfunktion (CMD)', r:'kiefer', such:/cmd|kiefer|craniomandib|kraniomandib/,
    p:['masseter','temporalis'], b:['masseter','temporalis','pterygoid'], arthrose:'kiefer',
    was:'Kaumuskeln und Kiefergelenk arbeiten gerade unter zu viel Spannung, zum Beispiel durch Zähnepressen in Stressphasen. Das kann bis in Kopf und Nacken ausstrahlen.',
    wir:'Wir lockern die Kaumuskeln, üben entspannte Kieferbewegungen und beziehen die Nackenmuskulatur mit ein.'},
];

// Bewegungen. Winkel in Grad, Normwerte nach Neutral-Null-Methode (Richtwerte, fachlich prüfen)
export const BEWEGUNGEN = {
  schulter_abd: {t:'Arm seitlich heben', fach:'Abduktion Schulter', min:0, max:180, norm:[160, 180], r:'schulter'},
  ellenbogen_flex: {t:'Ellenbogen beugen', fach:'Flexion Ellenbogen', min:0, max:145, norm:[140, 150], r:'ellenbogen'},
  huefte_flex: {t:'Hüfte beugen', fach:'Flexion Hüfte', min:0, max:125, norm:[120, 140], r:'huefte'},
  knie_flex: {t:'Knie beugen', fach:'Flexion Knie', min:0, max:140, norm:[120, 150], r:'knie'},
  kiefer: {t:'Mund öffnen', fach:'Mundöffnung', min:0, max:30, norm:null, mm:true, r:'kiefer'},
  osg: {t:'Fuß heben und senken', fach:'Dorsalextension / Plantarflexion OSG', min:-45, max:20, norm:[-50, 20], r:'fuss', neg:'Fuß senken', pos:'Fuß heben'},
};
export const BEW_JE_REGION = {kiefer:['kiefer'], schulter:['schulter_abd'], ellenbogen:['ellenbogen_flex'], huefte:['huefte_flex'], knie:['knie_flex'], fuss:['osg']};
export {BEIN_K, ARM_K};

// Dermatome (vereinfachte Karte nach Keegan & Garrett 1948 und Lee et al. 2008). Reihenfolge = Index in anatomie-haut.wasm.
// bs: typische Bandscheibenhöhe. HWS: Wurzel tritt über ihrem Wirbel aus (C5/C6 -> C6). LWS: mediolateraler Vorfall trifft die untere Wurzel (L4/L5 -> L5), foraminaler die obere.
const T = (n) => ({k:'T' + n, farbe: n % 2 ? '#4FB98A' : '#DDEB7E', wurzel:'Th' + n, bs:n < 12 ? [`Th${n - 1}/Th${n}`] : ['Th11/Th12'], bsText:'Thorakale Bandscheibenvorfälle sind selten. Häufiger sind Gürtelschmerz bei Blockierungen, Zoster oder Ursachen innerer Organe.', km:n <= 6 ? 'Zwischenrippenmuskeln' : 'Zwischenrippen- und Bauchmuskeln', ref:n >= 7 ? 'Bauchhautreflex' : '–', gebiet:n === 4 ? 'Gürtelförmig, vorn auf Höhe der Brustwarzen.' : n === 10 ? 'Gürtelförmig, vorn auf Höhe des Bauchnabels.' : n === 7 ? 'Gürtelförmig, vorn auf Höhe des Rippenbogens.' : 'Gürtelförmiger Streifen um den Rumpf, vorn tiefer als hinten.', region:'bws'});
export const DERM = [
  {k:'V', farbe:'#D9CDBB', wurzel:'N. trigeminus (Hirnnerv V)', bs:[], bsText:'Kein Spinalnerv. Das Gesicht wird vom N. trigeminus versorgt.', km:'Kaumuskeln', ref:'Masseterreflex', gebiet:'Gesicht und vorderer Kopf.', region:'kiefer'},
  {k:'C2', farbe:'#5B8DEF', wurzel:'C2', bs:[], bsText:'Bandscheibe C1/C2 gibt es nicht. Reizungen eher durch Gelenke der oberen HWS.', km:'Kopfbeuger und -strecker', ref:'–', gebiet:'Hinterkopf bis zum Scheitel, hinter dem Ohr.', region:'hws'},
  {k:'C3', farbe:'#9DB9F7', wurzel:'C3', bs:['C2/C3'], bsText:'Selten betroffen.', km:'Seitneigung der HWS', ref:'–', gebiet:'Hals vorn und seitlich, unter dem Kiefer.', region:'hws'},
  {k:'C4', farbe:'#3E6FD8', wurzel:'C4', bs:['C3/C4'], bsText:'', km:'Zwerchfell (C3 bis C5), Schulterheber', ref:'–', gebiet:'Schulterhöhe wie ein Umhang, Bereich über dem Schlüsselbein.', region:'hws'},
  {k:'C5', farbe:'#7FB2E5', wurzel:'C5', bs:['C4/C5'], bsText:'', km:'M. deltoideus (Abduktion), M. biceps brachii', ref:'Bizepssehnenreflex', gebiet:'Außenseite Oberarm über dem Deltamuskel.', region:'hws'},
  {k:'C6', farbe:'#2FA9C9', wurzel:'C6', bs:['C5/C6'], bsText:'Zweithäufigste Höhe für Vorfälle der HWS.', km:'M. biceps brachii, M. brachioradialis, Handgelenkstrecker', ref:'Bizepssehnenreflex, Brachioradialisreflex', gebiet:'Daumenseite von Unterarm und Hand, Daumen und Zeigefinger.', region:'hws'},
  {k:'C7', farbe:'#8FD6E8', wurzel:'C7', bs:['C6/C7'], bsText:'Häufigste Höhe für Vorfälle der HWS.', km:'M. triceps brachii, Handgelenkbeuger, Fingerstrecker', ref:'Trizepssehnenreflex', gebiet:'Mittelfinger und Mitte der Hand, Rückseite Unterarm.', region:'hws'},
  {k:'C8', farbe:'#1F7FA3', wurzel:'C8', bs:['C7/Th1'], bsText:'', km:'Fingerbeuger, kleine Handmuskeln', ref:'Trömner-Reflex', gebiet:'Ring- und Kleinfinger, Kleinfingerseite von Hand und Unterarm.', region:'hws'},
  {k:'T1', farbe:'#6CC3A0', wurzel:'Th1', bs:['C7/Th1', 'Th1/Th2'], bsText:'Selten betroffen.', km:'Kleine Handmuskeln (Finger spreizen)', ref:'–', gebiet:'Innenseite Unterarm und Ellenbogen.', region:'hws'},
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(T),
  {k:'L1', farbe:'#F7B267', wurzel:'L1', bs:['Th12/L1', 'L1/L2'], bsText:'', km:'M. iliopsoas', ref:'Kremasterreflex', gebiet:'Leiste und oberer vorderer Oberschenkel.', region:'lws'},
  {k:'L2', farbe:'#F4845F', wurzel:'L2', bs:['L1/L2', 'L2/L3'], bsText:'', km:'M. iliopsoas, Adduktoren', ref:'Adduktorenreflex', gebiet:'Vorderseite und Außenseite des Oberschenkels, schräg nach innen.', region:'lws'},
  {k:'L3', farbe:'#F9C784', wurzel:'L3', bs:['L2/L3', 'L3/L4'], bsText:'', km:'M. quadriceps femoris, Adduktoren', ref:'Patellarsehnenreflex', gebiet:'Unteres Drittel Oberschenkel vorn bis zur Innenseite des Knies.', region:'lws'},
  {k:'L4', farbe:'#E76F51', wurzel:'L4', bs:['L3/L4', 'L4/L5'], bsText:'Mediolateraler Vorfall L3/L4 oder foraminaler Vorfall L4/L5.', km:'M. quadriceps femoris, M. tibialis anterior', ref:'Patellarsehnenreflex', gebiet:'Innenseite Unterschenkel bis zum Innenknöchel.', region:'lws'},
  {k:'L5', farbe:'#FFD166', wurzel:'L5', bs:['L4/L5', 'L5/S1'], bsText:'Häufigste Wurzel: mediolateraler Vorfall L4/L5 oder foraminaler Vorfall L5/S1.', km:'M. extensor hallucis longus (Großzehe heben), M. gluteus medius', ref:'Tibialis-posterior-Reflex (wenig zuverlässig)', gebiet:'Außenseite Unterschenkel, Fußrücken bis zur Großzehe.', region:'lws'},
  {k:'S1', farbe:'#C77DFF', wurzel:'S1', bs:['L5/S1'], bsText:'Sehr häufig: mediolateraler Vorfall L5/S1.', km:'M. triceps surae (Zehenstand), Mm. fibulares, M. gluteus maximus', ref:'Achillessehnenreflex', gebiet:'Fußaußenrand, Kleinzehe, Ferse und Wade hinten.', region:'lws'},
  {k:'S2', farbe:'#E0AAFF', wurzel:'S2', bs:['S1/S2'], bsText:'Selten isoliert, eher bei Kauda-Beteiligung.', km:'Zehenbeuger, kurze Fußmuskeln', ref:'–', gebiet:'Streifen an der Rückseite des Oberschenkels und der Kniekehle.', region:'lws'},
  {k:'S3', farbe:'#9D4EDD', wurzel:'S3', bs:[], bsText:'Gefühlsstörung hier zusammen mit Blasen- oder Darmstörung ist ein Alarmzeichen (Kauda-Syndrom): sofort ärztlich abklären.', km:'Beckenboden', ref:'Analreflex', gebiet:'Innerer Gesäßbereich (Reithosenregion).', region:'lws', alarm:true},
  {k:'S4-5', farbe:'#7B2CBF', wurzel:'S4 und S5', bs:[], bsText:'Gefühlsstörung hier zusammen mit Blasen- oder Darmstörung ist ein Alarmzeichen (Kauda-Syndrom): sofort ärztlich abklären.', km:'Schließmuskeln, Beckenboden', ref:'Analreflex', gebiet:'Um den After (Reithosenregion).', region:'lws', alarm:true},
];
