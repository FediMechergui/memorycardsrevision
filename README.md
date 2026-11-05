# Mémora

Application française de révision, disponible comme site installable et application Android. Les révisions et leur progression restent utilisables hors connexion. Le salon multijoueur et l’avis IA utilisent un backend Netlify, sans compte ni mot de passe.

Site et API : [memora-revision-fedi.netlify.app](https://memora-revision-fedi.netlify.app).

Dépôt : [FediMechergui/memorycardsrevision](https://github.com/FediMechergui/memorycardsrevision). Les APK sont distribués dans les [releases GitHub](https://github.com/FediMechergui/memorycardsrevision/releases).

## Fonctionnalités

- CCNA 1, CCNA 2 et JavaFX : **18 chapitres**, **180 flashcards / questions de quiz**, **18 sujets rédigés**, schémas et formules.
- Lecture : synthèses, exemples de commandes/code, points à retenir, suivi des chapitres.
- Flashcards : format portrait, retournement 3D (désactivé avec réduction des animations), identité et couleur de matière, favoris, prononciation et répétition espacée.
- Quiz : quatre choix, correction expliquée, score réel.
- Questions/réponses : rappel écrit et comparaison avec la réponse attendue.
- Examen : cinq minutes par question, brouillon conservé, échéance conservée à la fermeture, corrigé et grille d’autoévaluation. Aucune note IA n’est simulée.
- Objectif quotidien, activité, série, historique et export/restauration de progression.
- Rangs de révision calculés à partir des actions enregistrées : 10 XP par notion travaillée ; ce ne sont pas des certifications.
- Salon Mimo : profils personnalisables, QR personnel, invitations acceptées sur l’appareil du joueur, 2 à 12 joueurs, dix manches sur chapitre/matière/mashup, Sprint ou Dés du savoir.
- Avis IA facultatif sur chaque réponse d’examen : modèle gratuit OpenRouter, critères expliqués, report des suggestions uniquement sur demande. La grille finale reste une autoévaluation modifiable.
- Packs de cours JSON validés ; classement indicatif d’un texte ou Markdown selon ses mots-clés. Les PDF sont préparés avec l’assistant avant import, sans faux extracteur PDF ni génération automatique annoncée.
- Hors connexion : ressources embarquées dans l’APK ; cache du site après une première visite réussie et l’activation de son service worker.

Les fiches sont des synthèses originales d’introduction, pas une reproduction de cours payants ni un programme complet de certification. Les références Cisco, IETF et OpenJFX sont dans chaque matière.

## Développement web

Prérequis : Node.js 22.12+ ou 24, npm.

```sh
npm ci
npm run dev
# Dans un autre terminal, pour le salon local :
npm run dev:api
```

Ouvrir l’adresse affichée par Vite, habituellement http://127.0.0.1:5173.

```sh
npm run courses:validate
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`dist/` contient le site ; `netlify/functions/` contient le backend. Le serveur de développement local utilise une mémoire volatile explicite, jamais le stockage de production. Vite redirige `/api` vers le port 8788. Sur Netlify, les fonctions servent `/api/*` avec le stockage persistant Netlify Blobs. L’APK utilise l’URL HTTPS publique ; `VITE_API_BASE_URL` permet de la remplacer au build.

## Salon, hébergement et IA

L’hôte crée une salle, choisit son périmètre et scanne les QR des joueurs. Chaque invité accepte sur son appareil ; seuls les joueurs prêts sont inclus au lancement. Le meneur tourne à chaque manche. Il lit le corrigé privé, ouvre 45 secondes de saisie, valide manuellement le sens de chaque réponse et révèle le résultat. L’hôte peut passer une manche si le meneur est absent, sans points. Un rechargement conserve le profil et la salle.

Une seule réponse par joueur et par manche. Les bonnes réponses valent 1 000, 800, 600, 400 puis au moins 200 points dans l’ordre de réception serveur ; les égalités temporelles partagent la place. Le meneur ne marque pas à son tour. En mode dés, un lancer serveur commun ajoute : paire +50, brelan/carré +100, full +150, grande suite +200, quinte +300. C’est une adaptation pédagogique, pas le jeu Yahtzee complet. Le classement est propre à la partie, sans classement mondial de profils anonymes.

Les profils sont identifiés par un secret opaque local, distinct du QR public d’invitation. Le serveur n’en conserve que l’empreinte. Les transitions d’une salle utilisent un document unique et des écritures conditionnelles avec ETag, lecture forte et reprises bornées : deux réponses concurrentes ne s’écrasent pas. Aucun corrigé n’est envoyé aux adversaires avant la révélation. Les supports de cours restent consultables par ailleurs ; ce jeu convivial n’est pas un examen surveillé. La synchronisation utilise des requêtes périodiques (environ 1,5 s en salle), pas des WebSockets ; la vitesse dépend donc aussi de la connexion. Les salles expirent après six heures, avec nettoyage quotidien des données temporaires.

Le workflow `.github/workflows/netlify.yml` teste et publie le site et ses fonctions depuis Linux. Il utilise le secret GitHub `NETLIFY_AUTH_TOKEN` et l’identifiant public du site. Ne jamais committer de jetons. Le CLI Netlify local peut rencontrer une erreur `readlink/EISDIR` sur certains volumes Windows ; le workflow évite ce problème de packaging.

Configurer `OPENROUTER_API_KEY` uniquement dans l’environnement Netlify, **jamais** avec le préfixe `VITE_`. La fonction d’examen impose `openrouter/free`, sans repli vers un modèle payant, avec validation du JSON, délai limite, cinq demandes par IP et par jour et quarante demandes au total par jour. Une copie déjà corrigée est mise en cache 24 h. Les quotas du fournisseur peuvent être plus restrictifs. L’écran informe avant tout envoi à OpenRouter ; un échec ne modifie aucune note. La clé de test fournie pour ce déploiement reste un secret serveur et devrait être remplacée avant un usage durable.

## Android

Prérequis : JDK 21, Android SDK, outils de compilation et plateforme indiqués dans `android/variables.gradle`. `JAVA_HOME` doit pointer vers le JDK, pas vers Java 8. Le wrapper Gradle 8.14.3 est conservé pour le plugin Android 8.13 ; Gradle 9.7.1 supprime une API interne dont ce plugin dépend.

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

Sous Windows : `gradlew.bat assembleDebug`. Le fichier se trouve dans `android/app/build/outputs/apk/debug/app-debug.apk`. `npm run android:open` ouvre le projet dans Android Studio.

Le script Windows `./scripts/build-android.ps1 -Release` prépare le web, synchronise Android, réutilise (ou crée au premier lancement) la clé locale et produit `artifacts/memora-release.apk`. Il détecte certains emplacements courants du JDK 21 ; sinon définir `JAVA_HOME` et `ANDROID_HOME` explicitement.

Pour une release, définir `MEMORA_KEYSTORE`, `MEMORA_STORE_PASSWORD`, `MEMORA_KEY_ALIAS` et `MEMORA_KEY_PASSWORD`, puis lancer `assembleRelease`. La compilation release exige une signature ; elle n’utilise jamais implicitement la clé debug. Une éventuelle clé locale générée est conservée dans `.signing/`, ignoré par Git : sauvegarder ce dossier en lieu sûr. Sa perte empêche les mises à jour des installations déjà signées avec cette clé.

## Mises à jour depuis GitHub

1. Le dépôt `FediMechergui/memorycardsrevision` est préconfiguré à partir de 1.1.0. Dans l’APK 1.0.0, le renseigner dans **Réglages → Dépôt GitHub** avant de chercher la mise à jour.
2. Les cours sont lus dans `public/courses/catalog.json` sur la branche par défaut découverte via l’API GitHub. Augmenter `version` à chaque publication du catalogue. Les chapitres locaux sont préservés lors de la fusion ; les chapitres identiques sont actualisés par identifiant. Cette mise à jour n’exécute aucun code téléchargé.
3. Pour l’APK : configurer les secrets GitHub `ANDROID_KEYSTORE_BASE64`, `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` avec la **même clé durable**.
4. Augmenter `package.json` version, `src/lib/updates.ts` APP_VERSION, `android/app/build.gradle` versionName et versionCode. Créer un tag `vX.Y.Z` correspondant : le workflow `.github/workflows/release.yml` compile et publie `memora.apk` avec les checksums et le catalogue.
5. Dans **Réglages → Vérifier la version Android**, l’app interroge la dernière release stable. Sur Android, elle télécharge l’asset `memora.apk` si GitHub fournit son empreinte SHA-256, vérifie les octets, le package, la signature et une versionCode supérieure, puis ouvre l’installateur Android. Si l’autorisation d’installation manque, elle ouvre les réglages système ; autoriser Mémora et retoucher le bouton.
6. À partir de 1.1.0, une vérification au démarrage/retour en ligne, au plus toutes les douze heures, propose les nouvelles versions. L’installation reste confirmée par Android ; les données locales sont conservées.

Le téléchargement vérifié exige le champ `digest` de l’asset GitHub. Si celui-ci manque, le lien de release permet un téléchargement manuel. Le web affiche le lien de release. GitHub doit être joignable ; les erreurs et limites de débit sont affichées sans effacer les données. Les dépôts privés et leurs jetons ne sont pas pris en charge dans le client.

La release initiale `v1.0.0` distribue l’APK local déjà vérifié, sous le nom `memora.apk`, sans le recompiler. Le workflow automatique ignore ce premier tag ; les tags suivants utilisent la compilation signée après configuration des secrets. Les clés et mots de passe de `.signing/` ne sont pas publiés.

Une application debug et une application release ont des signatures différentes : elles ne se mettent pas à jour l’une sur l’autre. Exporter la progression avant de changer de canal. Aucune installation silencieuse n’est tentée.

## Ajouter tes futurs cours

Les sources de contenu sont dans `content/ccna1.ts`, `content/ccna2.ts`, `content/javafx.ts` et `content/enrichment.ts` (compléments originaux du catalogue v2). Aucun PDF utilisateur n’a été utilisé pour ces ajouts. Les conventions de préparation sont documentées dans `AGENTS.md`. Donner le cours à l’assistant, puis :

```sh
npx tsx scripts/generate-content.ts
npm run courses:validate
```

Le format de pack est défini par `src/lib/content.ts`. Un exemple complet se télécharge depuis **Ajouter un cours**. Un import est prévisualisé avant application. Les identifiants doivent être uniques et stables. L’import texte/Markdown propose uniquement un classement et un export du texte source à préparer.

## Données et limites

La progression est stockée dans le stockage local du navigateur/WebView, sans synchronisation entre appareils. Les examens et le profil du salon ont des entrées séparées ; l’export de progression ne contient ni examens en cours ni secret du profil multijoueur. L’effacement des données du navigateur ou la désinstallation peut supprimer ces informations. Exporter régulièrement la progression via les réglages. Les réponses de jeu sont transmises à Netlify ; les réponses d’examen sont envoyées à OpenRouter uniquement lorsque tu demandes un avis. Aucun PDF n’est envoyé par cet outil.

Les fonctionnalités d’installation et de signature Android doivent être vérifiées sur un appareil réel avec deux releases signées par la même clé avant distribution à grande échelle. Les tests navigateur vérifient les parcours ; ils ne remplacent pas ce test système.

## Vérification

La suite couvre les cours, la progression, les examens avec brouillon/expiration, les contrôles d’accès, les scores et dix manches, les arrivées concurrentes, les limites et le cache IA. Le parcours multijoueur Chromium utilise deux contextes isolés et une image du QR réellement décodée, puis vérifie la reprise de salle et le classement. Les tests mobiles couvrent le portrait, le retournement et le rechargement hors ligne. L’installation système, le scan par caméra réelle et la mise à jour entre APK doivent encore être vérifiés sur un téléphone Android connecté.
