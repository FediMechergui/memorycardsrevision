import { chapter as c } from "./helpers";
import type { Subject } from "../src/lib/content";
export const javafx: Subject = {
  id: "javafx",
  title: "JavaFX",
  subtitle: "Des interfaces qui prennent vie",
  color: "peach",
  icon: "code",
  description:
    "Construire des interfaces Java, relier les données et maîtriser les événements.",
  sources: [
    {
      title: "OpenJFX · Guide de démarrage",
      url: "https://openjfx.io/openjfx-docs/",
    },
    { title: "OpenJFX · API JavaFX 25", url: "https://openjfx.io/javadoc/25/" },
    {
      title: "OpenJFX · Introduction à FXML",
      url: "https://openjfx.io/javadoc/25/javafx.fxml/javafx/fxml/doc-files/introduction_to_fxml.html",
    },
  ],
  chapters: [
    c(
      "fx-architecture",
      "Stage, Scene & les premiers pas",
      "Les trois briques d’une application JavaFX.",
      10,
      [
        {
          title: "Le cycle de vie",
          body: "Une application JavaFX peut étendre Application. La méthode init prépare des ressources, start reçoit le Stage principal et construit l’interface, et stop libère les ressources à la fermeture. start et stop s’exécutent sur le JavaFX Application Thread ; init n’est pas destinée à modifier une interface active.",
        },
        {
          title: "La fenêtre et son contenu",
          body: "Stage représente une fenêtre. Scene contient le graphe de scène, un arbre de nœuds visuels. Le nœud racine contient des contrôles, formes ou conteneurs. Un Node ne peut pas occuper simultanément plusieurs positions dans le graphe.",
          code: 'public class Demo extends Application {\n  @Override\n  public void start(Stage stage) {\n    var root = new StackPane(new Label("Bonjour !"));\n    stage.setScene(new Scene(root, 640, 400));\n    stage.setTitle("Ma première fenêtre");\n    stage.show();\n  }\n}',
        },
        {
          title: "Configurer le projet",
          body: "OpenJFX se déclare comme dépendance séparée dans les projets modernes. Maven ou Gradle permettent de gérer les modules et le lancement. javafx.controls est nécessaire pour les contrôles ; javafx.fxml s’ajoute si le projet utilise FXML. Choisir une version de Java compatible avec la version OpenJFX retenue.",
        },
      ],
      "Stage = fenêtre ; Scene = contenu ; Node = élément du graphe de scène.",
      [
        [
          "Que représente un Stage ?",
          "Une fenêtre",
          ["Un gestionnaire SQL", "Une propriété observable", "Un fichier CSS"],
          "Le Stage héberge une Scene et les propriétés de la fenêtre.",
        ],
        [
          "Quelle méthode reçoit le Stage principal ?",
          "start(Stage stage)",
          ["mainScene()", "renderWindow()", "initialize(Stage stage)"],
          "La plateforme appelle start après l’initialisation de l’application.",
        ],
        [
          "Que contient une Scene ?",
          "Un graphe de nœuds visuels",
          [
            "Uniquement du code SQL",
            "Toujours une seule étiquette",
            "Le compilateur Java",
          ],
          "La racine et ses descendants constituent le graphe de scène.",
        ],
        [
          "Quel module contient les contrôles JavaFX courants ?",
          "javafx.controls",
          ["java.sql uniquement", "java.net uniquement", "javafx.database"],
          "Button, Label et TableView font partie de javafx.controls.",
        ],
      ],
      [
        "Explique le chemin entre le démarrage d’une application JavaFX et l’affichage d’un bouton dans une fenêtre.",
        "La plateforme initialise Application puis appelle start avec le Stage principal. On crée un Button, on l’ajoute à un conteneur racine, on crée une Scene à partir de cette racine et on affecte la Scene au Stage. stage.show() rend la fenêtre visible. La création de l’interface se fait sur le thread JavaFX.",
        [
          "Application et start",
          "Button dans une racine",
          "Scene affectée au Stage",
          "show et thread JavaFX",
        ],
      ],
    ),
    c(
      "fx-layouts",
      "Organiser l’interface",
      "Choisir les bons conteneurs et une mise en page adaptable.",
      11,
      [
        {
          title: "Laisser le conteneur disposer les nœuds",
          body: "Les layouts calculent la taille et la position des enfants. VBox empile verticalement, HBox horizontalement, BorderPane distribue cinq régions et GridPane organise une grille. StackPane superpose ses enfants. Une disposition gérée s’adapte mieux au redimensionnement que des coordonnées absolues.",
        },
        {
          title: "Espacement et croissance",
          body: "Padding ajoute un espace intérieur au conteneur ; spacing sépare les enfants de VBox ou HBox. Les tailles minimale, préférée et maximale encadrent le redimensionnement. HBox.setHgrow et VBox.setVgrow donnent des priorités de croissance.",
          code: 'var champ = new TextField();\nvar bouton = new Button("Ajouter");\nvar ligne = new HBox(12, champ, bouton);\nligne.setPadding(new Insets(16));\nHBox.setHgrow(champ, Priority.ALWAYS);',
        },
        {
          title: "Séparer le style",
          body: "Les feuilles CSS JavaFX permettent de styliser les nœuds avec des sélecteurs de classes et d’identifiants. Elles utilisent des propriétés propres à JavaFX, souvent préfixées par -fx-. Le CSS JavaFX n’est pas le CSS complet d’un navigateur.",
          bullets: [
            "GridPane convient bien aux formulaires.",
            "BorderPane convient à une fenêtre avec en-tête et zone centrale.",
            "Tester les textes longs et le redimensionnement.",
          ],
        },
      ],
      "Le bon layout remplace la plupart des calculs de coordonnées.",
      [
        [
          "Quel conteneur empile ses enfants verticalement ?",
          "VBox",
          ["HBox", "Circle", "Timeline"],
          "VBox gère une colonne de nœuds avec espacement et alignement.",
        ],
        [
          "Quel conteneur est adapté à un formulaire en lignes et colonnes ?",
          "GridPane",
          ["MediaPlayer", "Task", "Stage"],
          "GridPane dispose les nœuds selon des indices de ligne et de colonne.",
        ],
        [
          "Quelle différence entre padding et spacing ?",
          "Padding entoure le contenu ; spacing sépare les enfants",
          [
            "Ce sont deux noms strictement identiques",
            "Padding change la police ; spacing change la couleur",
            "Spacing concerne uniquement les réseaux",
          ],
          "Ces espacements remplissent deux fonctions complémentaires dans la mise en page.",
        ],
        [
          "Quel préfixe est courant pour les propriétés CSS JavaFX ?",
          "-fx-",
          ["-html-", "-sql-", "-tcp-"],
          "Par exemple -fx-background-color et -fx-font-size.",
        ],
      ],
      [
        "Propose la structure d’une fenêtre avec barre de titre, formulaire à deux colonnes et boutons alignés en bas.",
        "Utiliser un BorderPane comme racine. Placer l’en-tête en top, un GridPane en center pour les libellés et champs, puis une HBox en bottom pour les boutons. Définir padding, espacements et contraintes de croissance pour que les champs s’adaptent à la fenêtre.",
        [
          "BorderPane racine",
          "GridPane pour le formulaire",
          "HBox pour les boutons",
          "Espacements et croissance adaptative",
        ],
      ],
    ),
    c(
      "fx-events",
      "Événements & interactions",
      "Réagir aux actions et comprendre leur propagation.",
      10,
      [
        {
          title: "Écouter une intention",
          body: "Un événement représente une action comme un clic, une touche ou une activation de contrôle. Button.setOnAction réagit à l’activation du bouton, y compris au clavier, et convient mieux qu’un simple clic de souris pour une action accessible.",
        },
        {
          title: "Filtres et gestionnaires",
          body: "La phase de capture descend vers la cible et appelle les filtres. La phase de remontée appelle les gestionnaires de la cible vers ses parents. consume() arrête la propagation ultérieure de l’événement.",
          code: 'bouton.setOnAction(event -> {\n  message.setText("Bonjour " + nom.getText());\n});\nchamp.addEventFilter(KeyEvent.KEY_PRESSED, event -> {\n  if (event.getCode() == KeyCode.ESCAPE) {\n    champ.clear();\n    event.consume();\n  }\n});',
        },
        {
          title: "Garder les actions lisibles",
          body: "Un gestionnaire doit rester court : valider l’entrée, appeler la logique métier, puis afficher le résultat. Les erreurs de saisie doivent être compréhensibles. Une opération lente doit quitter le thread graphique pour éviter de figer l’interface.",
        },
      ],
      "Filtre pendant la capture ; gestionnaire pendant la remontée.",
      [
        [
          "Quel événement privilégier pour l’activation d’un Button ?",
          "ActionEvent via setOnAction",
          [
            "Uniquement le mouvement de souris",
            "Uniquement la fermeture de fenêtre",
            "Un paquet UDP",
          ],
          "L’action du bouton peut être déclenchée au clavier comme à la souris.",
        ],
        [
          "Quand les filtres d’événements interviennent-ils ?",
          "Pendant la phase de capture",
          [
            "Après la destruction du Stage",
            "Uniquement pendant init",
            "Après tous les gestionnaires parents",
          ],
          "La capture parcourt le chemin vers la cible avant la phase de remontée.",
        ],
        [
          "Quel est le rôle de event.consume() ?",
          "Arrêter la propagation ultérieure",
          [
            "Supprimer automatiquement le bouton",
            "Fermer toujours l’application",
            "Lancer un thread réseau",
          ],
          "Un événement consommé ne poursuit pas normalement son chemin de propagation.",
        ],
        [
          "Pourquoi éviter une requête lente dans setOnAction ?",
          "Elle bloque le thread graphique",
          [
            "Elle change automatiquement le CSS",
            "Elle supprime les propriétés",
            "Elle désactive le compilateur",
          ],
          "Pendant cette opération, les interactions et le rendu peuvent rester figés.",
        ],
      ],
      [
        "Un formulaire doit être validable au clavier et à la souris. Explique comment traiter l’action et une requête réseau lente.",
        "Associer un gestionnaire setOnAction au bouton de validation, éventuellement bouton par défaut. Valider la saisie rapidement, puis exécuter le travail réseau dans une Task ou un service de fond. Afficher l’état d’attente et mettre à jour l’interface sur le thread JavaFX lors du succès ou de l’échec.",
        [
          "ActionEvent accessible",
          "Validation de saisie",
          "Réseau en arrière-plan",
          "Retour visuel sur le thread JavaFX",
        ],
      ],
    ),
    c(
      "fx-binding",
      "Propriétés & bindings",
      "Synchroniser les données et l’interface.",
      13,
      [
        {
          title: "Observer une valeur",
          body: "Une Property JavaFX représente une valeur observable et généralement modifiable. StringProperty, IntegerProperty et BooleanProperty peuvent signaler leurs changements. Un listener permet de réagir à une modification ; un binding exprime une dépendance entre des valeurs.",
        },
        {
          title: "Un sens ou deux ?",
          body: "bind crée une liaison unidirectionnelle : la propriété cible suit sa source et ne doit pas être affectée directement tant qu’elle est liée. bindBidirectional synchronise les deux côtés et convient, par exemple, à l’édition d’une valeur textuelle.",
          code: 'StringProperty nom = new SimpleStringProperty("");\nchamp.textProperty().bindBidirectional(nom);\nmessage.textProperty().bind(nom.concat(" apprend JavaFX"));\nbouton.disableProperty().bind(nom.isEmpty());',
        },
        {
          title: "Collections observables",
          body: "ObservableList notifie ses modifications structurelles aux observateurs. Des contrôles comme ListView et TableView peuvent utiliser ces collections. Observer une liste ne rend pas automatiquement tous les champs internes de ses objets observables : les propriétés des éléments doivent être exposées et reliées correctement.",
        },
      ],
      "Un binding décrit une relation durable ; un listener déclenche une réaction.",
      [
        [
          "À quoi sert une Property JavaFX ?",
          "À exposer une valeur observable",
          [
            "À ouvrir obligatoirement une fenêtre",
            "À compiler FXML en SQL",
            "À lancer automatiquement un thread",
          ],
          "Une propriété peut notifier les changements et participer à des bindings.",
        ],
        [
          "Que fait bindBidirectional ?",
          "Il synchronise les deux propriétés",
          [
            "Il copie une valeur une seule fois",
            "Il détruit la source",
            "Il rend toute l’application immuable",
          ],
          "Une modification de chaque côté est répercutée de l’autre côté.",
        ],
        [
          "Peut-on affecter directement une propriété liée par bind ?",
          "Non, il faut d’abord retirer la liaison",
          [
            "Oui, sans aucune conséquence",
            "Seulement les jours pairs",
            "Seulement si elle contient du texte",
          ],
          "Une propriété liée unidirectionnellement est pilotée par sa source ; unbind retire cette relation.",
        ],
        [
          "Que signale principalement une ObservableList ?",
          "Les modifications de la liste",
          [
            "Toutes les modifications internes de tout objet automatiquement",
            "Le débit réseau",
            "Les changements du système de fichiers",
          ],
          "Les changements internes nécessitent une observation appropriée des propriétés des éléments.",
        ],
      ],
      [
        "Un bouton doit être désactivé quand un champ est vide, et un libellé doit afficher le même texte. Propose une solution avec des bindings.",
        "Lier disableProperty du bouton à champ.textProperty().isEmpty(). Lier textProperty du libellé à champ.textProperty(). Les bindings mettent les cibles à jour automatiquement. Ne pas appeler setText sur le libellé tant que sa propriété est liée ; utiliser unbind si la relation doit être supprimée.",
        [
          "Binding sur disableProperty",
          "Expression isEmpty",
          "Binding du texte du libellé",
          "Respect de la propriété liée et unbind",
        ],
      ],
    ),
    c(
      "fx-fxml",
      "FXML & contrôleurs",
      "Séparer la vue, les interactions et la logique.",
      13,
      [
        {
          title: "Décrire la vue",
          body: "FXML est un format XML qui décrit un graphe d’objets JavaFX. FXMLLoader lit le document et crée les objets. fx:controller associe une classe contrôleur, et fx:id identifie un élément pour l’injection. Le contrôleur traite les interactions ; la logique métier peut être déléguée à des classes distinctes.",
        },
        {
          title: "Injection et initialisation",
          body: "L’annotation @FXML donne au chargeur accès à des champs ou méthodes non publics. La méthode initialize est appelée après les injections. Le constructeur du contrôleur ne doit pas supposer que les champs FXML ont déjà été injectés.",
          code: "public class FormController {\n  @FXML private TextField nom;\n  @FXML private Label resultat;\n\n  @FXML private void initialize() {\n    resultat.textProperty().bind(nom.textProperty());\n  }\n}",
        },
        {
          title: "Ressources et modules",
          body: "Charger la ressource depuis le classpath avec getResource. Dans un projet modulaire, ouvrir le package du contrôleur à javafx.fxml permet l’accès réflexif. Vérifier le chemin, le nom du contrôleur et les fx:id en cas de LoadException.",
          bullets: [
            "requires javafx.controls; requires javafx.fxml;",
            "opens fr.exemple.ui to javafx.fxml;",
            "Scene Builder peut aider à composer une vue FXML.",
          ],
        },
      ],
      "Les champs @FXML sont disponibles dans initialize, après le chargement et l’injection.",
      [
        [
          "Quel objet charge un fichier FXML ?",
          "FXMLLoader",
          [
            "FileWriter uniquement",
            "StageManager",
            "CSSParser public obligatoire",
          ],
          "FXMLLoader instancie les objets et relie le document à son contrôleur.",
        ],
        [
          "Quand utiliser les champs injectés pour initialiser la vue ?",
          "Dans initialize après injection",
          [
            "Toujours dans le constructeur avant chargement",
            "Avant Application.launch",
            "Uniquement dans stop",
          ],
          "Le constructeur peut s’exécuter avant que FXMLLoader affecte les champs.",
        ],
        [
          "Quel attribut FXML identifie un nœud pour l’injection ?",
          "fx:id",
          ["http:port", "java:version", "style:module"],
          "Le nom doit correspondre au champ attendu du contrôleur.",
        ],
        [
          "Que permet opens fr.exemple.ui to javafx.fxml ?",
          "L’accès réflexif au package pour FXMLLoader",
          [
            "L’accès réseau au port 80",
            "Le lancement de tous les threads",
            "La suppression de CSS",
          ],
          "Dans les modules Java, l’accès réflexif doit être ouvert explicitement lorsque nécessaire.",
        ],
      ],
      [
        "Un champ @FXML est null dans le constructeur du contrôleur. Explique pourquoi et comment structurer correctement l’initialisation.",
        "FXMLLoader construit d’abord le contrôleur puis injecte les éléments associés aux fx:id. Le constructeur s’exécute donc avant ces injections. Déplacer l’initialisation dépendante des nœuds dans initialize. Vérifier la correspondance fx:id/champ, @FXML, fx:controller et l’ouverture du package dans un projet modulaire.",
        [
          "Ordre construction puis injection",
          "Utiliser initialize",
          "Vérifier fx:id et annotations",
          "Vérifier contrôleur et ouverture du module",
        ],
      ],
    ),
    c(
      "fx-concurrency",
      "Tâches de fond & interface fluide",
      "Utiliser Task sans bloquer le thread graphique.",
      14,
      [
        {
          title: "Un thread pour l’interface",
          body: "Le JavaFX Application Thread traite les événements et les mises à jour du graphe de scène actif. Les calculs longs, accès disque ou réseau doivent s’exécuter ailleurs. Modifier directement les contrôles depuis un thread de fond risque des erreurs de concurrence.",
        },
        {
          title: "Task et Service",
          body: "Task encapsule un travail effectué dans call. Elle expose état, progression, valeur et erreur. Une Task est à usage unique ; un Service permet d’organiser un travail relançable. Les gestionnaires onSucceeded et onFailed sont exécutés sur le thread JavaFX.",
          code: 'Task<String> task = new Task<>() {\n  @Override protected String call() throws Exception {\n    return chargerDonnees();\n  }\n};\ntask.setOnSucceeded(e -> label.setText(task.getValue()));\ntask.setOnFailed(e -> label.setText("Chargement impossible"));\nThread worker = new Thread(task);\nworker.setDaemon(true);\nworker.start();',
        },
        {
          title: "Communiquer sans saturer",
          body: "updateProgress et updateMessage sont prévus pour transmettre des informations depuis une Task. Platform.runLater planifie une action sur le thread JavaFX ; il ne rend pas cette action moins coûteuse. L’annulation est coopérative : le travail doit tester isCancelled et respecter les interruptions.",
        },
      ],
      "Le travail long va dans call ; les mises à jour de l’interface reviennent sur le thread JavaFX.",
      [
        [
          "Où exécuter une requête réseau lente ?",
          "Dans une tâche de fond",
          [
            "Directement dans le gestionnaire graphique",
            "Dans un binding recalculé à chaque image",
            "Dans le CSS",
          ],
          "Le thread graphique doit rester disponible pour les événements et le rendu.",
        ],
        [
          "Peut-on redémarrer la même instance de Task après sa fin ?",
          "Non, une Task est à usage unique",
          [
            "Oui, indéfiniment avec start()",
            "Seulement si elle retourne String",
            "Seulement sur Windows",
          ],
          "Créer une nouvelle Task ou utiliser un Service pour une opération relançable.",
        ],
        [
          "Sur quel thread s’exécute onSucceeded d’une Task ?",
          "Le JavaFX Application Thread",
          [
            "Toujours le thread réseau",
            "Le thread du ramasse-miettes",
            "Un thread choisi au hasard",
          ],
          "Ce gestionnaire peut mettre à jour les contrôles de l’interface.",
        ],
        [
          "Que fait Platform.runLater ?",
          "Il planifie du code sur le thread JavaFX",
          [
            "Il déplace le code vers un thread de fond",
            "Il accélère automatiquement le calcul",
            "Il annule les autres tâches",
          ],
          "Une opération longue passée à runLater peut toujours bloquer l’interface.",
        ],
      ],
      [
        "Une application se fige pendant le chargement d’un fichier. Décris une correction avec progression, gestion d’erreur et annulation.",
        "Exécuter la lecture dans call d’une Task lancée en arrière-plan. Utiliser updateProgress et lier une barre à progressProperty. Mettre à jour les contrôles dans onSucceeded et afficher une erreur dans onFailed. Prévoir un bouton cancel et vérifier isCancelled pendant le travail, en libérant les ressources avec try-with-resources.",
        [
          "Lecture dans une Task de fond",
          "Progression via API de Task",
          "Succès et erreur sur le thread JavaFX",
          "Annulation coopérative et ressources libérées",
        ],
      ],
    ),
  ],
};
