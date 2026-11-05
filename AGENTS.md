# Mémora

Application de révision en français pour le master Expert réseaux. Stack : React, TypeScript, Vite, Capacitor Android. Le web et l’APK utilisent la même interface. Préserver le fonctionnement hors connexion.

## Ajouter un cours fourni par l’utilisateur

1. Lire le cours réellement fourni. Ne pas prétendre avoir extrait un PDF qui n’a pas été lu.
2. Classer selon le contenu : CCNA 1 (fondations, modèles, Ethernet, adressage, transport), CCNA 2 (commutation, VLAN, STP, routage, DHCP, WLAN), JavaFX (interfaces Java). Ajouter une matière si le contenu ne correspond pas aux trois existantes. Demander seulement lorsque le classement reste réellement ambigu.
3. Produire une synthèse française originale par chapitre, des points à retenir, des exemples utiles et des références. Distinguer les compléments ajoutés du cours source.
4. Chaque chapitre possède sections, takeaway, cartes avec 4 choix plausibles et 1 seule réponse correcte, explication, et au moins un sujet rédigé avec corrigé et critères d’autoévaluation. Les cartes servent aussi aux quiz et au mode questions/réponses.
5. Maintenir les identifiants existants : ils relient les favoris et les révisions. Pour changer substantiellement une question, lui donner un nouvel identifiant afin de ne pas conserver artificiellement sa maîtrise.
6. Les sources éditoriales vivent dans `content/`. `scripts/generate-content.ts` produit `public/courses/catalog.json`. Augmenter la version entière du catalogue et la date quand le contenu change.
7. Exécuter `npm run courses:validate`, `npm test`, `npm run build`. Tester un parcours concerné dans le navigateur si l’interface change.

## Données et interface

- Ne pas ajouter de faux résultats, séries ou taux de réussite : toutes les statistiques proviennent des actions enregistrées.
- Les examens sont des réponses rédigées chronométrées avec autoévaluation explicite. Ne pas présenter une simple recherche de mots-clés comme une correction intelligente.
- Couleurs douces, accent vert forêt, typographies locales Outfit et DM Sans, mascotte CSS Mimo. Préserver accessibilité clavier, petits écrans et réduction des animations.
- Ne jamais supprimer la progression lors d’une mise à jour de contenu.
- Ne pas exposer des clés de signature ou des secrets. `.signing/` et les keystores restent hors Git.
- Le mode Classe utilise `server/` et les fonctions Netlify. Préserver les écritures conditionnelles par salle, l’autorité serveur des scores, et la distinction entre QR public et secret privé du profil. Les tests locaux utilisent uniquement `memory-store`, jamais la production.
- L’aide IA est facultative et passe exclusivement par le serveur avec `OPENROUTER_API_KEY` ; ne jamais préfixer une clé par `VITE_`. Le modèle est gratuit sans repli payant. Une suggestion IA ne coche la grille que sur action explicite et reste modifiable.

## Android et releases

`npm run android:sync` prépare Android. Une release augmente `package.json` version, `APP_VERSION`, `versionName` et surtout `versionCode` Android. La même clé doit signer toutes les mises à jour. Le workflow GitHub crée `memora.apk`. L’application vérifie origine, SHA-256, identité du package, certificat et version avant d’ouvrir l’installateur système.
