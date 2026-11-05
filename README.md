# Mémora

Application française de révision, disponible comme site installable et application Android. Les données restent sur l’appareil ; aucun compte ni serveur applicatif n’est nécessaire.

## Fonctionnalités

- CCNA 1, CCNA 2 et JavaFX : **18 chapitres**, **72 flashcards / questions de quiz**, **18 sujets rédigés**.
- Lecture : synthèses, exemples de commandes/code, points à retenir, suivi des chapitres.
- Flashcards : recto/verso, favoris, prononciation lorsque disponible et répétition espacée.
- Quiz : quatre choix, correction expliquée, score réel.
- Questions/réponses : rappel écrit et comparaison avec la réponse attendue.
- Examen : cinq minutes par question, brouillon conservé, échéance conservée à la fermeture, corrigé et grille d’autoévaluation. Aucune note IA n’est simulée.
- Objectif quotidien, activité, série, historique et export/restauration de progression.
- Packs de cours JSON validés ; classement indicatif d’un texte ou Markdown selon ses mots-clés. Les PDF sont préparés avec l’assistant avant import, sans faux extracteur PDF ni génération automatique annoncée.
- Hors connexion : ressources embarquées dans l’APK ; cache du site après une première visite réussie et l’activation de son service worker.

Les fiches sont des synthèses originales d’introduction, pas une reproduction de cours payants ni un programme complet de certification. Les références Cisco, IETF et OpenJFX sont dans chaque matière.

## Développement web

Prérequis : Node.js 22.12+ ou 24, npm.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite, habituellement http://127.0.0.1:5173.

```sh
npm run courses:validate
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`dist/` est le site statique à déployer sur un hébergeur HTTPS. Les routes utilisent le fragment URL : pas de règle de réécriture côté serveur nécessaire. Pour un sous-répertoire, adapter `base`, `start_url` et `scope` dans Vite avant la compilation ; la configuration fournie vise la racine d’un domaine.

## Android

Prérequis : JDK 21, Android SDK, outils de compilation et plateforme indiqués dans `android/variables.gradle`. `JAVA_HOME` doit pointer vers le JDK, pas vers Java 8.

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

Sous Windows : `gradlew.bat assembleDebug`. Le fichier se trouve dans `android/app/build/outputs/apk/debug/app-debug.apk`. `npm run android:open` ouvre le projet dans Android Studio.

Le script Windows `./scripts/build-android.ps1 -Release` prépare le web, synchronise Android, réutilise (ou crée au premier lancement) la clé locale et produit `artifacts/memora-release.apk`. Il détecte certains emplacements courants du JDK 21 ; sinon définir `JAVA_HOME` et `ANDROID_HOME` explicitement.

Pour une release, définir `MEMORA_KEYSTORE`, `MEMORA_STORE_PASSWORD`, `MEMORA_KEY_ALIAS` et `MEMORA_KEY_PASSWORD`, puis lancer `assembleRelease`. La compilation release exige une signature ; elle n’utilise jamais implicitement la clé debug. Une éventuelle clé locale générée est conservée dans `.signing/`, ignoré par Git : sauvegarder ce dossier en lieu sûr. Sa perte empêche les mises à jour des installations déjà signées avec cette clé.

## Mises à jour depuis GitHub

1. Créer un dépôt GitHub public avec ce projet, puis renseigner `propriétaire/dépôt` dans **Réglages**, ou définir `VITE_GITHUB_REPOSITORY` au moment de compiler.
2. Les cours sont lus dans `public/courses/catalog.json` sur la branche par défaut découverte via l’API GitHub. Augmenter `version` à chaque publication du catalogue. Les chapitres locaux sont préservés lors de la fusion ; les chapitres identiques sont actualisés par identifiant. Cette mise à jour n’exécute aucun code téléchargé.
3. Pour l’APK : configurer les secrets GitHub `ANDROID_KEYSTORE_BASE64`, `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` avec la **même clé durable**.
4. Augmenter `package.json` version, `src/lib/updates.ts` APP_VERSION, `android/app/build.gradle` versionName et versionCode. Créer un tag `vX.Y.Z` correspondant : le workflow `.github/workflows/release.yml` compile et publie `memora.apk` avec les checksums et le catalogue.
5. Dans **Réglages → Vérifier la version Android**, l’app interroge la dernière release stable. Sur Android, elle télécharge l’asset `memora.apk` si GitHub fournit son empreinte SHA-256, vérifie les octets, le package, la signature et une versionCode supérieure, puis ouvre l’installateur Android. Si l’autorisation d’installation manque, elle ouvre les réglages système ; autoriser Mémora et retoucher le bouton.

Le téléchargement vérifié exige le champ `digest` de l’asset GitHub. Si celui-ci manque, le lien de release permet un téléchargement manuel. Le web affiche le lien de release. GitHub doit être joignable ; les erreurs et limites de débit sont affichées sans effacer les données. Les dépôts privés et leurs jetons ne sont pas pris en charge dans le client.

Une application debug et une application release ont des signatures différentes : elles ne se mettent pas à jour l’une sur l’autre. Exporter la progression avant de changer de canal. Aucune installation silencieuse n’est tentée.

## Ajouter tes futurs cours

Les sources de contenu sont dans `content/ccna1.ts`, `content/ccna2.ts` et `content/javafx.ts`. Les conventions de préparation sont documentées dans `AGENTS.md`. Donner le cours à l’assistant, puis :

```sh
npx tsx scripts/generate-content.ts
npm run courses:validate
```

Le format de pack est défini par `src/lib/content.ts`. Un exemple complet se télécharge depuis **Ajouter un cours**. Un import est prévisualisé avant application. Les identifiants doivent être uniques et stables. L’import texte/Markdown propose uniquement un classement et un export du texte source à préparer.

## Données et limites

La progression est stockée dans le stockage local du navigateur/WebView, sans synchronisation entre appareils. Les examens gardent leur brouillon dans des entrées séparées ; l’export de progression ne contient pas les examens en cours. L’effacement des données du navigateur ou la désinstallation peut supprimer ces informations. Exporter régulièrement via les réglages. Aucun PDF ni document utilisateur n’est transmis à un service externe par cette application.

Les fonctionnalités d’installation et de signature Android doivent être vérifiées sur un appareil réel avec deux releases signées par la même clé avant distribution à grande échelle. Les tests navigateur vérifient les parcours ; ils ne remplacent pas ce test système.

## Vérification de cette première version

9 tests unitaires et 10 tests de parcours Chromium passent : cours, quiz, examens avec brouillon/expiration, favoris, restauration, mise à jour de catalogue simulée, navigation mobile et rechargement hors ligne. Le build web et le build Android release réussissent. L’APK est signé avec la clé locale ignorée par Git. Aucun téléphone Android n’était connecté : l’installation système et une mise à jour réelle entre deux APK restent à vérifier sur appareil. Le dépôt GitHub distant et la première release ne sont pas encore publiés.
