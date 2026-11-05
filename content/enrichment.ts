import type { Chapter, Subject } from "../src/lib/content";
type Q = [string, string, [string, string, string], string];
type Addition = {
  body: string;
  bullets: string[];
  formula?: string;
  diagram?: { caption: string; steps: string[] };
  questions: Q[];
};
// Original additions for catalogue v2. Existing question IDs and wording remain intact.
const additions: Record<string, Addition> = {
  "c1-reseaux": {
    body: "Un transfert subit quatre délais : traitement, attente dans une file, émission des bits et propagation du signal. Augmenter le débit réduit l’émission, pas la distance. Pour diagnostiquer, pars du poste : lien actif, configuration IP, passerelle, destination puis résolution de noms.",
    bullets: [
      "Débit utile : données applicatives reçues par seconde ; il est inférieur au débit brut à cause des en-têtes et retransmissions.",
      "Un octet vaut 8 bits : 10 Mo représentent 80 Mbit en unités décimales.",
      "Un lien de secours protège contre une panne ; la QoS priorise certains flux en cas de congestion, sans créer de capacité.",
    ],
    formula:
      "Délai d’émission = taille en bits / débit en bit/s\n10 Mo × 8 / 100 Mbit/s = 0,8 s (minimum théorique)\nDélai de propagation = distance / vitesse du signal",
    diagram: {
      caption: "Du poste vers un réseau distant",
      steps: [
        "Poste · IP + masque",
        "Switch · réseau local",
        "Passerelle · routeur",
        "Serveur distant",
      ],
    },
    questions: [
      [
        "Quelle durée minimale pour émettre 10 Mo sur 100 Mbit/s, sans surcoût ?",
        "0,8 seconde",
        ["0,1 seconde", "8 secondes", "80 secondes"],
        "10 Mo décimaux valent 80 Mbit. Divise par 100 Mbit/s.",
      ],
      [
        "Quel délai augmente surtout avec la distance du lien ?",
        "Le délai de propagation",
        [
          "Le délai de sérialisation",
          "Le délai de traitement DNS",
          "Le délai de file uniquement",
        ],
        "Le signal met du temps à parcourir le support, même avec un débit élevé.",
      ],
      [
        "Que désigne le débit utile applicatif ?",
        "Les données utiles reçues par unité de temps",
        [
          "La vitesse de propagation du signal",
          "La capacité nominale du câble",
          "Le nombre total d’en-têtes",
        ],
        "Les en-têtes et les retransmissions occupent de la bande passante sans être des données applicatives nouvelles.",
      ],
      [
        "Quel est le but de la QoS lors d’une congestion ?",
        "Prioriser les flux selon leur besoin",
        [
          "Multiplier la capacité physique",
          "Supprimer toute latence",
          "Remplacer le routage IP",
        ],
        "Une file prioritaire peut protéger la voix ; elle ne crée pas de bande passante.",
      ],
      [
        "Un poste ne joint aucun voisin. Quel premier contrôle est pertinent ?",
        "Vérifier le lien et la configuration IP",
        [
          "Changer le serveur DNS distant",
          "Modifier le navigateur",
          "Changer la route sur Internet",
        ],
        "Un diagnostic commence par les causes locales et les couches basses.",
      ],
      [
        "Quel modèle décrit un serveur qui répond aux requêtes des postes ?",
        "Client-serveur",
        [
          "Pair-à-pair sans rôle dédié",
          "Diffusion uniquement",
          "Boucle de commutation",
        ],
        "Le client initie une requête ; le serveur fournit le service demandé.",
      ],
    ],
  },
  "c1-modeles": {
    body: "L’encapsulation ajoute des informations à chaque couche. Le destinataire fait l’inverse. Un routeur retire la trame reçue, traite le paquet IP, décrémente le TTL puis construit une trame pour le lien suivant. Sans traduction NAT, les IP source et destination restent les mêmes de bout en bout.",
    bullets: [
      "OSI : physique, liaison, réseau, transport, session, présentation, application.",
      "TCP/IP regroupe session, présentation et application ; sa couche accès réseau couvre liaison et physique.",
      "Un problème de câble est physique ; une mauvaise route est réseau ; un port applicatif fermé concerne le transport ou l’application.",
    ],
    diagram: {
      caption: "Encapsulation puis décapsulation à l’arrivée",
      steps: [
        "Données applicatives",
        "Segment TCP / datagramme UDP",
        "Paquet IP",
        "Trame Ethernet",
        "Bits sur le support",
      ],
    },
    questions: [
      [
        "Quelle couche OSI transforme les bits en signal ?",
        "La couche physique",
        ["La couche transport", "La couche présentation", "La couche réseau"],
        "La couche physique concerne les signaux et les caractéristiques du support.",
      ],
      [
        "Quel champ IPv4 diminue au passage d’un routeur ?",
        "Le TTL",
        [
          "Le port TCP destination",
          "L’adresse IP destination, systématiquement",
          "Le masque du poste",
        ],
        "Le TTL limite le nombre de sauts ; à zéro, le paquet est abandonné.",
      ],
      [
        "Sans NAT, quelles adresses restent normalement identiques sur le trajet routé ?",
        "Les IP source et destination",
        [
          "Les MAC source et destination",
          "Les ports des switches",
          "Les adresses de broadcast Ethernet",
        ],
        "Les trames sont recréées par lien, tandis que l’adressage IP reste de bout en bout.",
      ],
      [
        "Que fait la décapsulation ?",
        "Retirer et traiter les en-têtes des couches successives",
        [
          "Ajouter un VLAN au paquet",
          "Compresser toutes les données",
          "Remplacer les adresses DNS",
        ],
        "Le destinataire remonte la pile jusqu’aux données applicatives.",
      ],
      [
        "Quelles couches OSI sont regroupées dans l’application TCP/IP ?",
        "Application, présentation et session",
        [
          "Physique et liaison",
          "Réseau et transport",
          "Liaison, réseau et transport",
        ],
        "Le modèle TCP/IP expose moins de couches, sans supprimer ces fonctions.",
      ],
      [
        "Un câble débranché relève d’abord de quelle couche ?",
        "Physique",
        ["Application", "Transport", "Session"],
        "Aucun signal exploitable ne peut circuler sur un lien déconnecté.",
      ],
    ],
  },
  "c1-ethernet": {
    body: "Dans un VLAN, un switch apprend l’emplacement d’une MAC à partir de la source des trames reçues. Il consulte ensuite la destination : port connu, transmission ciblée ; destination inconnue, diffusion sur les autres ports du VLAN. ARP résout une IPv4 locale en MAC, mais ne fournit aucune authentification.",
    bullets: [
      "Une MAC Ethernet usuelle contient 48 bits, écrits en six octets hexadécimaux.",
      "Une trame corrompue détectée par son FCS est rejetée ; Ethernet ne la répare pas.",
      "Sur un lien commuté full-duplex, émission et réception sont simultanées ; les collisions ne sont pas un fonctionnement normal.",
    ],
    diagram: {
      caption: "ARP pour une destination hors du sous-réseau",
      steps: [
        "Destination IP distante",
        "ARP : qui a l’IP de la passerelle ?",
        "Réponse : MAC du routeur",
        "Trame vers la passerelle",
      ],
    },
    questions: [
      [
        "Combien de bits contient une adresse MAC Ethernet usuelle ?",
        "48 bits",
        ["32 bits", "64 bits", "128 bits"],
        "Six octets de huit bits donnent 48 bits.",
      ],
      [
        "Quelle MAC représente le broadcast Ethernet ?",
        "FF:FF:FF:FF:FF:FF",
        ["00:00:00:00:00:00", "01:00:5E:00:00:01", "02:00:00:00:00:01"],
        "Tous les bits à 1 désignent la diffusion sur le domaine de couche 2.",
      ],
      [
        "Une destination MAC est connue sur le port d’entrée. Que fait le switch ?",
        "Il filtre la trame au lieu de la renvoyer",
        [
          "Il la diffuse partout",
          "Il la transmet au routeur par défaut",
          "Il envoie une requête DNS",
        ],
        "La destination est déjà du côté du port d’entrée ; la retransmettre serait inutile.",
      ],
      [
        "À quoi sert le FCS Ethernet ?",
        "Détecter des erreurs de transmission",
        [
          "Chiffrer le contenu",
          "Choisir le prochain routeur",
          "Authentifier la MAC source",
        ],
        "Le contrôle d’intégrité détecte des corruptions, sans assurer l’authenticité.",
      ],
      [
        "Que permet le full-duplex ?",
        "Émettre et recevoir simultanément",
        [
          "Partager un seul canal avec des collisions",
          "Doubler la taille des MAC",
          "Supprimer les en-têtes Ethernet",
        ],
        "Chaque direction peut transmettre ; CSMA/CD n’est pas utilisé sur un lien full-duplex.",
      ],
      [
        "Pourquoi un empoisonnement ARP est-il possible ?",
        "ARP n’authentifie pas nativement ses associations IP–MAC",
        [
          "ARP chiffre ses réponses",
          "ARP utilise des certificats expirés",
          "ARP modifie le masque réseau",
        ],
        "Des protections comme DAI contrôlent les associations sur les équipements compatibles.",
      ],
    ],
  },
  "c1-ipv4": {
    body: "Pour calculer un sous-réseau, compte les bits hôte h = 32 − préfixe. La taille du bloc vaut 2ʰ. Trouve la frontière de bloc contenant l’adresse, puis le broadcast en fin de bloc. En VLSM, attribue d’abord les plus grands besoins pour limiter la fragmentation du plan d’adressage.",
    bullets: [
      "Exemple : 192.168.10.70/26 appartient au bloc 64–127 : réseau .64, hôtes .65 à .126, broadcast .127.",
      "Pour 50 hôtes, /26 suffit : 62 adresses utilisables. /27 n’en offre que 30.",
      "2ʰ − 2 s’applique aux sous-réseaux classiques ; un /31 point-à-point et un /32 sont des cas particuliers.",
    ],
    formula:
      "h = 32 − p ; adresses = 2ʰ ; hôtes classiques = 2ʰ − 2\n/26 : h = 6 → 64 adresses → 62 hôtes\nRéseau = adresse IP ET masque (opération binaire)",
    diagram: {
      caption: "Le bloc 192.168.10.64/26",
      steps: [".64 · réseau", ".65 … .126 · 62 hôtes", ".127 · broadcast"],
    },
    questions: [
      [
        "Quel est le broadcast de 192.168.10.64/26 ?",
        "192.168.10.127",
        ["192.168.10.63", "192.168.10.126", "192.168.10.255"],
        "Un /26 contient 64 adresses ; le bloc commencé à 64 se termine à 127.",
      ],
      [
        "Quel plus petit sous-réseau classique accueille 50 hôtes ?",
        "/26",
        ["/27", "/28", "/29"],
        "Avec six bits hôte : 2⁶ − 2 = 62, contre 30 pour /27.",
      ],
      [
        "Combien de sous-réseaux /27 obtient-on en découpant un /24 ?",
        "8",
        ["2", "4", "16"],
        "Trois bits sont empruntés : 2³ = 8 sous-réseaux.",
      ],
      [
        "Quel masque correspond à /27 ?",
        "255.255.255.224",
        ["255.255.255.192", "255.255.255.240", "255.255.255.248"],
        "Les trois bits supplémentaires valent 128 + 64 + 32 = 224.",
      ],
      [
        "Quelle opération permet de retrouver l’adresse réseau ?",
        "Un ET binaire entre IP et masque",
        [
          "Un OU entre IP et passerelle",
          "Une addition de l’IP et du masque",
          "Une soustraction du port TCP",
        ],
        "Les bits hôte sont annulés par les zéros du masque.",
      ],
      [
        "Dans un plan VLSM, quels besoins attribuer en premier ?",
        "Les plus grands sous-réseaux",
        [
          "Les plus petites adresses MAC",
          "Les réseaux avec DNS uniquement",
          "Les plus petits sous-réseaux",
        ],
        "Réserver d’abord les grands blocs facilite un découpage cohérent et sans chevauchement.",
      ],
    ],
  },
  "c1-ipv6": {
    body: "IPv6 emploie des adresses unicast, multicast et anycast ; il n’utilise pas de broadcast. Les messages ICMPv6 de découverte de voisins servent aussi à découvrir les routeurs. SLAAC construit une adresse à partir d’un préfixe annoncé ; DHCPv6 peut fournir d’autres paramètres, mais la route par défaut vient normalement des Router Advertisements.",
    bullets: [
      "Un /64 laisse 64 bits pour l’identifiant d’interface ; c’est le découpage habituel des LAN IPv6.",
      "::1 est le loopback ; :: est l’adresse non spécifiée ; ff00::/8 est multicast.",
      "Les routeurs IPv6 ne fragmentent pas les paquets en transit : la source adapte la taille, notamment via Path MTU Discovery.",
    ],
    diagram: {
      caption: "SLAAC en trois idées",
      steps: [
        "RA · annonce du préfixe",
        "Adresse candidate du poste",
        "DAD · vérifier l’absence de doublon",
      ],
    },
    questions: [
      [
        "Quelle est l’adresse IPv6 de loopback ?",
        "::1",
        ["::", "fe80::", "ff02::1"],
        "::1 désigne l’hôte lui-même ; :: est non spécifiée.",
      ],
      [
        "Quel mécanisme remplace l’usage du broadcast en IPv6 ?",
        "Des groupes multicast ciblés",
        ["Un broadcast de 128 bits", "ARPv6", "Une diffusion DNS obligatoire"],
        "IPv6 n’a pas d’adresse de broadcast ; les destinataires peuvent appartenir à un groupe multicast.",
      ],
      [
        "Quelle annonce apprend normalement la route par défaut à un hôte IPv6 ?",
        "Router Advertisement",
        [
          "DHCPv6 Reply uniquement",
          "Neighbor Advertisement uniquement",
          "Une réponse DNS AAAA",
        ],
        "Les RA permettent notamment la découverte des routeurs par défaut.",
      ],
      [
        "Que vérifie DAD avant d’utiliser une adresse ?",
        "L’absence de doublon sur le lien",
        [
          "La vitesse du port",
          "L’existence d’un nom DNS",
          "La validité du mot de passe Wi-Fi",
        ],
        "Duplicate Address Detection évite d’utiliser une adresse déjà présente.",
      ],
      [
        "Combien de bits restent après un préfixe IPv6 /64 ?",
        "64 bits",
        ["32 bits", "48 bits", "96 bits"],
        "Une adresse IPv6 contient 128 bits : 128 − 64 = 64.",
      ],
      [
        "Qui peut fragmenter un paquet IPv6 ?",
        "La source du paquet",
        [
          "Chaque routeur traversé",
          "Le switch Ethernet uniquement",
          "Le serveur DNS",
        ],
        "La fragmentation IPv6 relève de la source, pas des routeurs intermédiaires.",
      ],
    ],
  },
  "c1-services": {
    body: "TCP établit une connexion puis numérote les octets et acquitte leur réception. Son contrôle de flux protège le destinataire ; le contrôle de congestion tient compte du réseau. UDP offre des datagrammes sans ces garanties intégrées : une application peut cependant ajouter sa propre fiabilité, comme le fait QUIC.",
    bullets: [
      "TCP : SYN, SYN-ACK, ACK pour l’ouverture classique. La fiabilité ne signifie pas confidentialité : TLS apporte la protection cryptographique.",
      "Ports usuels : DNS 53, HTTP 80, HTTPS 443, SSH 22 ; ce sont des conventions configurables.",
      "DNS peut utiliser UDP ou TCP. Un enregistrement A désigne IPv4 ; AAAA désigne IPv6.",
    ],
    formula:
      "Débit applicatif idéal limité par une fenêtre ≈ fenêtre en bits / RTT en secondes\nFenêtre 64 000 octets, RTT 0,1 s → 5,12 Mbit/s (modèle simplifié)",
    questions: [
      [
        "Quel est l’ordre de l’ouverture TCP classique ?",
        "SYN → SYN-ACK → ACK",
        ["ACK → SYN → FIN", "DISCOVER → OFFER → ACK", "FIN → ACK → SYN"],
        "Le three-way handshake synchronise les numéros de séquence des deux côtés.",
      ],
      [
        "Quel mécanisme TCP protège un récepteur trop lent ?",
        "Le contrôle de flux",
        [
          "Le chiffrement TLS",
          "La résolution ARP",
          "La fragmentation Ethernet",
        ],
        "La fenêtre annoncée indique la capacité de réception disponible.",
      ],
      [
        "Quel enregistrement DNS associe un nom à une IPv6 ?",
        "AAAA",
        ["A", "MX", "PTR"],
        "AAAA est destiné à IPv6 ; A à IPv4, MX aux serveurs de courrier.",
      ],
      [
        "Quel port TCP est usuel pour SSH ?",
        "22",
        ["23", "25", "80"],
        "SSH permet une administration distante chiffrée, généralement sur TCP 22.",
      ],
      [
        "TCP garantit-il à lui seul la confidentialité ?",
        "Non, un protocole comme TLS est nécessaire",
        [
          "Oui, par les numéros de séquence",
          "Oui, par le handshake",
          "Oui, si le port vaut 443",
        ],
        "La livraison fiable et le chiffrement sont deux fonctions différentes.",
      ],
      [
        "DNS peut-il utiliser TCP ?",
        "Oui, ainsi qu’UDP",
        [
          "Non, uniquement UDP",
          "Non, uniquement ICMP",
          "Oui, seulement en IPv6",
        ],
        "TCP sert notamment aux transferts de zone et aux échanges nécessitant un transport fiable.",
      ],
    ],
  },
  "c2-vlan": {
    body: "Un port access porte normalement le trafic d’un VLAN de données ; un trunk transporte plusieurs VLAN autorisés. Un VLAN ne traverse le trunk que s’il existe et s’il est autorisé. Le VLAN natif traite en général le trafic non tagué : une incohérence entre extrémités peut mélanger des domaines attendus séparés.",
    bullets: [
      "Vérifie successivement : VLAN créé, port access associé, trunk opérationnel, liste des VLAN autorisés.",
      "Un VLAN limite la diffusion, mais les règles de sécurité entre VLAN dépendent du routage et des ACL.",
      "La priorité 802.1p et le VLAN ID sont des champs distincts dans le tag 802.1Q.",
    ],
    diagram: {
      caption: "Un trunk, deux domaines de diffusion",
      steps: [
        "VLAN 10 · étudiants",
        "Trunk 802.1Q · VLAN 10 et 20",
        "VLAN 20 · enseignants",
      ],
    },
    questions: [
      [
        "Quel port porte normalement un seul VLAN de données ?",
        "Un port access",
        [
          "Un port trunk multivlan",
          "Une sous-interface routée",
          "Un tunnel IPsec",
        ],
        "Le trafic d’un poste classique arrive non tagué sur un port access.",
      ],
      [
        "Un VLAN existe sur deux switches mais manque dans la liste autorisée du trunk. Conséquence ?",
        "Son trafic ne traverse pas ce trunk",
        [
          "Il devient automatiquement natif",
          "Il est routé sans configuration",
          "Il utilise tous les autres VLAN",
        ],
        "L’existence du VLAN et son autorisation sur le trunk sont deux conditions distinctes.",
      ],
      [
        "À quoi correspond le VLAN natif sur un trunk 802.1Q usuel ?",
        "Au VLAN du trafic non tagué",
        [
          "Au VLAN chiffré automatiquement",
          "Au VLAN de plus grande priorité IP",
          "À tous les VLAN autorisés",
        ],
        "La configuration de tagging natif peut varier ; les extrémités doivent être cohérentes.",
      ],
      [
        "Quelle commande Cisco résume les VLAN et ports access ?",
        "show vlan brief",
        ["show ip route", "show arp", "show access-lists"],
        "La table des VLAN aide à vérifier l’appartenance des ports.",
      ],
      [
        "Un VLAN suffit-il à définir les accès autorisés entre réseaux ?",
        "Non, des règles de filtrage sont aussi nécessaires",
        [
          "Oui, tous les paquets sont chiffrés",
          "Oui, tous les routeurs bloquent par défaut",
          "Oui, le trunk est un pare-feu",
        ],
        "La segmentation sépare les domaines ; le routage et ses politiques définissent les communications permises.",
      ],
      [
        "Combien de bits porte l’identifiant VLAN 802.1Q ?",
        "12 bits",
        ["8 bits", "16 bits", "24 bits"],
        "12 bits donnent 4096 valeurs ; certaines sont réservées, donc toutes ne sont pas utilisables.",
      ],
    ],
  },
  "c2-intervlan": {
    body: "Dans router-on-a-stick, chaque sous-interface du routeur associe un tag 802.1Q à une IP de passerelle. Le lien physique vers le switch est un trunk. Sur un switch multicouche, chaque SVI joue ce rôle pour son VLAN, avec le routage IP activé. Il faut une route aller et une route retour.",
    bullets: [
      "Un poste du VLAN 10 envoie une trame à la MAC de sa passerelle, même si l’IP finale se trouve dans le VLAN 20.",
      "Le routeur change les en-têtes de couche 2, consulte sa table de routage et diminue le TTL.",
      "Une SVI peut rester inactive si son VLAN n’existe pas ou n’a aucun port actif satisfaisant les conditions de la plateforme.",
    ],
    diagram: {
      caption: "Router-on-a-stick",
      steps: [
        "PC · VLAN 10",
        "Trunk · tag 10",
        "Routeur · sous-interfaces .10 / .20",
        "Trunk · tag 20",
        "Serveur · VLAN 20",
      ],
    },
    questions: [
      [
        "Quel mode pour le lien switch–routeur en router-on-a-stick ?",
        "Trunk",
        [
          "Access VLAN 1 uniquement",
          "PortFast obligatoire",
          "Port-channel sans VLAN",
        ],
        "Il doit transporter les tags des différents VLAN routés.",
      ],
      [
        "Quelle commande associe une sous-interface Cisco au VLAN 20 ?",
        "encapsulation dot1Q 20",
        [
          "switchport access vlan 20",
          "ip routing 20",
          "vlan native address 20",
        ],
        "La sous-interface interprète les trames marquées avec le VLAN ID 20.",
      ],
      [
        "À quelle MAC un poste envoie-t-il une trame vers un autre VLAN ?",
        "À la MAC de sa passerelle",
        [
          "À la MAC du serveur distant directement",
          "À sa propre MAC",
          "À une MAC DNS",
        ],
        "Le serveur est hors sous-réseau ; le premier saut est le routeur.",
      ],
      [
        "Quelle interface logique représente la passerelle d’un VLAN sur un switch multicouche ?",
        "Une SVI",
        [
          "Un port console",
          "Une interface loopback obligatoire",
          "Une entrée de table MAC",
        ],
        "L’interface VLAN porte une IP et peut router avec ip routing.",
      ],
      [
        "Quelle vérification explique une SVI inactive ?",
        "Vérifier l’existence du VLAN et ses ports actifs",
        [
          "Changer le mot de passe DNS",
          "Ajouter un enregistrement AAAA",
          "Activer HTTP sur les postes",
        ],
        "L’état d’une SVI dépend notamment de l’activité de couche 2 du VLAN.",
      ],
      [
        "Quel risque de performance est propre à router-on-a-stick ?",
        "Le lien physique partagé peut devenir un goulot d’étranglement",
        [
          "Chaque VLAN doit avoir un câble vers chaque poste",
          "Les IP sont limitées à 8 bits",
          "Les switches cessent d’apprendre les MAC",
        ],
        "Les communications inter-VLAN empruntent le même lien physique vers le routeur.",
      ],
    ],
  },
  "c2-stp": {
    body: "STP choisit une racine, puis chaque switch non racine choisit son meilleur chemin vers elle. Les autres chemins redondants peuvent être bloqués pour éviter les boucles. LACP agrège des liens compatibles en une interface logique ; un flux donné utilise généralement un seul membre selon une fonction de hachage.",
    bullets: [
      "Bridge ID : priorité, identifiant de système étendu selon le mode, puis MAC. Le plus petit gagne.",
      "PortFast accélère un port de bord ; BPDU Guard le désactive s’il reçoit une BPDU inattendue.",
      "Les membres d’un EtherChannel doivent avoir des paramètres compatibles : mode de port, VLAN, vitesse et duplex selon la plateforme.",
    ],
    diagram: {
      caption: "La redondance reste disponible sans boucle active",
      steps: [
        "Switch racine",
        "Chemin actif à coût minimal",
        "Autre lien · secours bloqué",
      ],
    },
    questions: [
      [
        "Comment un switch non racine choisit-il son root port en premier critère ?",
        "Par le coût total minimal vers la racine",
        [
          "Par le plus grand numéro de port",
          "Par le plus grand VLAN ID",
          "Par la plus grande MAC destination",
        ],
        "Les critères de départage supplémentaires interviennent si les coûts sont égaux.",
      ],
      [
        "Que fait BPDU Guard sur un port de bord recevant une BPDU ?",
        "Il met le port en erreur/désactivation selon la configuration",
        [
          "Il le transforme en trunk",
          "Il le choisit comme racine",
          "Il réécrit toutes les MAC",
        ],
        "Cette protection aide à détecter un switch raccordé à un port destiné à un terminal.",
      ],
      [
        "Deux liens de 1 Gbit/s en EtherChannel donnent-ils 2 Gbit/s à un seul flux habituel ?",
        "Pas nécessairement : un flux reste généralement sur un membre",
        [
          "Toujours exactement 2 Gbit/s",
          "Toujours 500 Mbit/s",
          "Seulement si le DNS est actif",
        ],
        "La répartition se fait par hachage des caractéristiques du flux, pas par alternance aveugle des paquets.",
      ],
      [
        "Quelle combinaison LACP permet une négociation ?",
        "Active et passive",
        ["Passive et passive", "Off et passive", "Deux ports console"],
        "Au moins une extrémité active initie les échanges LACP.",
      ],
      [
        "Quelles configurations doivent rester compatibles dans un EtherChannel ?",
        "Les modes de port et VLAN autorisés, notamment",
        [
          "Les mots de passe des postes",
          "Les noms DNS des clients",
          "Les ports TCP des applications",
        ],
        "Des incohérences peuvent empêcher l’agrégation ou créer des anomalies de trafic.",
      ],
      [
        "Quel est l’avantage principal de RSTP par rapport au STP classique ?",
        "Une convergence généralement plus rapide",
        [
          "Le chiffrement des trames",
          "La suppression de toute élection",
          "Le routage IPv6 automatique",
        ],
        "RSTP accélère les transitions grâce à ses mécanismes de rôles et de négociation.",
      ],
    ],
  },
  "c2-dhcp": {
    body: "Le client DHCPv4 démarre sans adresse et diffuse sa recherche. Un relais relaie les échanges vers un serveur d’un autre réseau, en indiquant le réseau client. DHCP snooping distingue les ports de confiance où un serveur légitime peut répondre et construit une table d’associations utile à d’autres protections.",
    bullets: [
      "DHCPv4 utilise UDP 67 côté serveur et UDP 68 côté client.",
      "Sans valeurs particulières fournies par le serveur, T1 vaut 50 % du bail et T2 87,5 % : renouvellement puis rebinding.",
      "DAI vérifie des messages ARP ; port security limite des MAC sur un port. Ces protections ont des objectifs différents.",
    ],
    formula:
      "Bail de 8 h, valeurs par défaut :\nT1 = 0,5 × 8 h = 4 h ; T2 = 0,875 × 8 h = 7 h",
    diagram: {
      caption: "DORA : attribution initiale simplifiée",
      steps: [
        "Discover · client",
        "Offer · serveur",
        "Request · client",
        "ACK · serveur",
      ],
    },
    questions: [
      [
        "Quels ports UDP utilise DHCPv4 côté serveur et client ?",
        "67 serveur, 68 client",
        [
          "68 serveur, 67 client",
          "53 serveur, 54 client",
          "80 serveur, 443 client",
        ],
        "Les deux ports permettent les échanges avant et après l’attribution de l’adresse.",
      ],
      [
        "Pour un bail de 8 h, quand survient T1 par défaut ?",
        "Après 4 h",
        ["Après 1 h", "Après 7 h", "Après 8 h"],
        "T1 correspond habituellement à 50 % du bail quand le serveur ne spécifie pas d’autre valeur.",
      ],
      [
        "Quel champ DHCPv4 un relais utilise-t-il pour indiquer le réseau client ?",
        "giaddr",
        ["TTL", "VLAN natif", "DNS AAAA"],
        "Le serveur peut choisir son pool grâce à l’adresse de relais.",
      ],
      [
        "Quel port déclarer de confiance pour DHCP snooping ?",
        "Le chemin vers le serveur DHCP légitime",
        [
          "Tous les ports clients",
          "Tous les ports inutilisés",
          "Le port de n’importe quel invité",
        ],
        "Faire confiance aux ports clients permettrait à un faux serveur d’envoyer des réponses.",
      ],
      [
        "Que vérifie principalement Dynamic ARP Inspection ?",
        "La validité des associations IP–MAC dans ARP",
        ["Le contenu HTML", "Les identifiants WPA3", "Les ports UDP du DNS"],
        "DAI peut s’appuyer sur la table DHCP snooping ou des associations statiques.",
      ],
      [
        "À quoi sert une exclusion dans un pool DHCP ?",
        "Réserver des adresses qui ne seront pas distribuées dynamiquement",
        [
          "Réduire le nombre de VLAN",
          "Supprimer le bail du serveur DNS",
          "Interdire le routage IPv6",
        ],
        "On exclut par exemple la passerelle et les équipements adressés statiquement.",
      ],
    ],
  },
  "c2-routage": {
    body: "Le choix de la route se fait d’abord par le préfixe le plus spécifique correspondant à la destination. Pour installer des routes concurrentes vers le même préfixe, la distance administrative compare les sources ; la métrique départage ensuite les chemins selon le protocole. Une route par défaut sert seulement si rien de plus précis ne correspond.",
    bullets: [
      "Une route connectée nécessite une interface opérationnelle avec une adresse appropriée.",
      "Une route statique flottante a une distance administrative supérieure à celle de la route principale.",
      "Une route de résumé regroupe des préfixes contigus et alignés ; annoncer trop large peut attirer du trafic sans destination réelle.",
    ],
    formula:
      "192.168.0.0/24 + 192.168.1.0/24 → 192.168.0.0/23\nDeux blocs contigus de 256 adresses → 512 adresses, alignées sur /23",
    questions: [
      [
        "Que compare la distance administrative ?",
        "La préférence entre sources de routes vers le même préfixe",
        [
          "La distance physique du câble",
          "La taille des trames Ethernet",
          "Le nombre de clients DHCP",
        ],
        "Une distance plus faible est normalement préférée ; la longueur de préfixe reste prioritaire pour transférer un paquet.",
      ],
      [
        "Une route /24 ou /16 correspond à la destination : laquelle sert au transfert ?",
        "La /24",
        ["La /16 systématiquement", "La plus ancienne", "La route par défaut"],
        "Le préfixe le plus long est la correspondance la plus précise.",
      ],
      [
        "Quel résumé exact regroupe 192.168.0.0/24 et 192.168.1.0/24 ?",
        "192.168.0.0/23",
        ["192.168.0.0/25", "192.168.1.0/23", "192.168.0.0/16"],
        "Le bloc /23 est aligné sur un troisième octet pair et couvre exactement ces deux /24.",
      ],
      [
        "Quand une route connectée apparaît-elle normalement ?",
        "Quand l’interface adressée est opérationnelle",
        [
          "Quand le DNS répond",
          "Dès qu’un câble est rangé dans la baie",
          "Après une réponse HTTP",
        ],
        "La connectivité de l’interface conditionne l’utilisation de son réseau connecté.",
      ],
      [
        "Quel préfixe représente la route IPv6 par défaut ?",
        "::/0",
        ["::1/128", "fe80::/10", "ff00::/8"],
        "Aucun bit de préfixe n’est imposé : toutes les destinations peuvent correspondre.",
      ],
      [
        "Pourquoi une route aller ne suffit-elle pas à une communication bidirectionnelle ?",
        "Le destinataire a aussi besoin d’un chemin de retour",
        [
          "TCP ignore les routeurs",
          "Le masque change à chaque paquet",
          "ARP traverse automatiquement Internet",
        ],
        "Le routage retour peut être différent, mais il doit exister et être autorisé.",
      ],
    ],
  },
  "c2-wifi": {
    body: "Le Wi-Fi partage le temps d’antenne : un débit radio affiché ne représente pas le débit utile de chaque client. Les obstacles, la distance, les interférences et le nombre de stations réduisent les performances. Un plan radio choisit des canaux et puissances adaptés plutôt qu’une puissance maximale partout.",
    bullets: [
      "À largeur de canal plus grande, capacité potentielle supérieure mais moins de canaux indépendants disponibles.",
      "La sécurité Enterprise utilise typiquement 802.1X et un serveur RADIUS ; chaque utilisateur peut avoir ses propres identifiants.",
      "Cacher un SSID n’est pas une protection de chiffrement. Utilise WPA2-AES ou WPA3 selon la compatibilité, puis segmente les invités.",
    ],
    formula:
      "Rapport de puissance en dB = 10 × log₁₀(P₂ / P₁)\n+3 dB ≈ puissance ×2 ; −3 dB ≈ puissance /2\nCela ne signifie pas un débit multiplié par deux.",
    questions: [
      [
        "Quelle méthode d’accès au média est associée au Wi-Fi ?",
        "CSMA/CA",
        [
          "CSMA/CD en full-duplex",
          "Token Ring obligatoire",
          "TDMA Ethernet uniquement",
        ],
        "Le Wi-Fi cherche à éviter les collisions ; il ne les détecte pas comme l’Ethernet partagé historique.",
      ],
      [
        "Quel service intervient typiquement avec WPA Enterprise et 802.1X ?",
        "RADIUS",
        [
          "Un serveur ARP",
          "Un relais NAT uniquement",
          "Un serveur TFTP obligatoire",
        ],
        "RADIUS centralise l’authentification et les décisions d’accès.",
      ],
      [
        "Masquer le SSID remplace-t-il le chiffrement ?",
        "Non",
        [
          "Oui, les trames deviennent illisibles",
          "Oui, les adresses MAC sont chiffrées",
          "Oui, le réseau n’émet plus",
        ],
        "Le nom peut être découvert et le trafic nécessite toujours un mécanisme de protection.",
      ],
      [
        "Que représente environ une hausse de puissance de 3 dB ?",
        "Une puissance doublée",
        [
          "Une puissance triplée",
          "Un débit garanti doublé",
          "Une portée garantie doublée",
        ],
        "Les dB sont logarithmiques : 10 log₁₀(2) ≈ 3. Cela ne garantit ni portée ni débit.",
      ],
      [
        "Quel est le compromis d’un canal Wi-Fi plus large ?",
        "Plus de capacité potentielle mais moins de canaux indépendants",
        [
          "Moins d’interférences dans tous les cas",
          "Une portée illimitée",
          "Une suppression des obstacles",
        ],
        "Une largeur importante occupe davantage de spectre et peut augmenter la contention.",
      ],
      [
        "Pourquoi le débit utile est-il inférieur au débit radio annoncé ?",
        "Le temps d’antenne sert aussi aux en-têtes, accès au média et reprises",
        [
          "Le Wi-Fi n’envoie aucun octet utile",
          "Le DNS divise toujours le débit par huit",
          "Le SSID impose une limite fixe",
        ],
        "La signalisation, le partage du média et les retransmissions consomment des ressources.",
      ],
    ],
  },
  "fx-architecture": {
    body: "Une application JavaFX gère un graphe de scène : les nœuds sont organisés en arbre sous une racine. La fenêtre Stage accueille une Scene. La méthode start s’exécute sur le JavaFX Application Thread ; init sert à préparer sans manipuler de Stage vivant. Le cycle se termine avec stop pour libérer les ressources.",
    bullets: [
      "Un même nœud ne peut pas appartenir simultanément à plusieurs parents du graphe de scène.",
      "Application.launch ne se rappelle pas pour chaque fenêtre : crée plutôt des Stage supplémentaires.",
      "Dans un projet modulaire, déclare les modules JavaFX utilisés dans module-info.java et configure leurs dépendances.",
    ],
    diagram: {
      caption: "La hiérarchie visuelle",
      steps: [
        "Stage · fenêtre",
        "Scene · contenu",
        "VBox · racine",
        "Label + Button · enfants",
      ],
    },
    questions: [
      [
        "Quelle méthode du cycle de vie libère les ressources à la fermeture ?",
        "stop()",
        ["start() uniquement", "paint()", "destroyScene()"],
        "stop permet notamment d’arrêter des services et des exécuteurs propres à l’application.",
      ],
      [
        "Peut-on partager le même Node entre deux parents simultanément ?",
        "Non",
        [
          "Oui, sans contrainte",
          "Oui, si leurs tailles sont égales",
          "Oui, uniquement pour un Button",
        ],
        "Le graphe de scène est une hiérarchie : un nœud n’a qu’un parent à la fois.",
      ],
      [
        "Sur quel thread la méthode start est-elle appelée ?",
        "Le JavaFX Application Thread",
        [
          "Le thread de collecte mémoire",
          "Un thread réseau imposé",
          "Le thread du compilateur",
        ],
        "C’est le thread qui gère les interactions avec l’interface active.",
      ],
      [
        "Comment ouvrir une deuxième fenêtre dans l’application ?",
        "Créer un nouveau Stage",
        [
          "Rappeler Application.launch()",
          "Créer une deuxième JVM obligatoire",
          "Réinitialiser le module javafx.base",
        ],
        "Plusieurs Stage peuvent coexister dans une même application JavaFX.",
      ],
      [
        "Quel type de structure est le graphe de scène ?",
        "Un arbre de nœuds",
        ["Une table SQL", "Une liste de threads", "Un ensemble de sockets"],
        "Les relations parent-enfant organisent le rendu, les transformations et les événements.",
      ],
      [
        "Quel fichier déclare les dépendances d’un module Java nommé ?",
        "module-info.java",
        ["scene.fxml obligatoirement", "style.css", "application.png"],
        "Les directives requires et opens précisent les dépendances et accès nécessaires.",
      ],
    ],
  },
  "fx-layouts": {
    body: "Les conteneurs de layout recalculent les positions et tailles selon leur espace disponible et les tailles minimum, préférées et maximum des enfants. Le redimensionnement doit être conçu par contraintes ; fixer chaque coordonnée rend la vue fragile face à une petite fenêtre, une traduction ou une police agrandie.",
    bullets: [
      "BorderPane organise top, bottom, left, right et center ; le centre prend l’espace restant.",
      "HBox.setHgrow permet à un enfant de demander l’espace horizontal disponible, selon ses limites de taille.",
      "visible=false masque un nœud ; managed=false le retire aussi du calcul de layout du parent.",
    ],
    diagram: {
      caption: "Une vue adaptative avec BorderPane",
      steps: [
        "Top · barre d’outils",
        "Left · navigation",
        "Center · contenu flexible",
        "Bottom · statut",
      ],
    },
    questions: [
      [
        "Quel conteneur répartit top, bottom, left, right et center ?",
        "BorderPane",
        ["FlowPane", "GridPane", "StackPane"],
        "Le centre occupe l’espace restant après les régions périphériques.",
      ],
      [
        "Quel conteneur superpose ses enfants ?",
        "StackPane",
        ["HBox", "VBox", "GridPane sans contraintes"],
        "StackPane place les nœuds les uns sur les autres, selon l’ordre et l’alignement.",
      ],
      [
        "Quelle propriété retire un nœud du calcul de layout ?",
        "managed=false",
        ["opacity=0 uniquement", "visible=false uniquement", "disable=true"],
        "Un nœud invisible peut encore réserver de l’espace s’il reste managed.",
      ],
      [
        "Que permet HBox.setHgrow(node, Priority.ALWAYS) ?",
        "Demander que le nœud utilise l’espace horizontal disponible",
        [
          "Fixer sa hauteur à l’infini",
          "Le déplacer vers un autre Stage",
          "Ignorer toutes ses tailles maximales",
        ],
        "Le parent distribue l’espace tout en respectant les contraintes applicables.",
      ],
      [
        "Quel conteneur revient automatiquement à la ligne ?",
        "FlowPane",
        ["HBox", "BorderPane", "AnchorPane"],
        "FlowPane dispose les enfants en flux et les reporte selon l’espace disponible.",
      ],
      [
        "Pourquoi préférer les contraintes aux coordonnées fixes ?",
        "Pour adapter l’interface aux tailles et contenus variables",
        [
          "Pour supprimer le thread UI",
          "Pour rendre tous les contrôles immuables",
          "Pour empêcher tout redimensionnement",
        ],
        "Les layouts s’adaptent aux petites fenêtres, langues et tailles de police.",
      ],
    ],
  },
  "fx-events": {
    body: "Un événement suit une route dans le graphe de scène. Les filtres interviennent lors de la descente vers la cible ; les handlers lors de la remontée. Séparer validation, logique métier et mise à jour visuelle permet de garder les gestionnaires courts et testables.",
    bullets: [
      "addEventHandler ajoute un gestionnaire ; setOnAction définit la propriété de gestionnaire correspondante et remplace son ancienne valeur.",
      "ActionEvent couvre notamment l’activation au clavier ; ne limite pas une action à un clic souris.",
      "Utilise un état de formulaire et une validation claire ; signale l’erreur près du champ concerné.",
    ],
    diagram: {
      caption: "Route simplifiée d’un événement",
      steps: [
        "Racine · filtres",
        "Cible · contrôle",
        "Remontée · handlers",
        "Éventuelle consommation",
      ],
    },
    questions: [
      [
        "Quelle méthode ajoute un handler sans remplacer la propriété onAction ?",
        "addEventHandler(...)",
        [
          "setOnAction(...) à répétition",
          "setText(...) uniquement",
          "requestLayout(...)",
        ],
        "Les gestionnaires ajoutés et la propriété de gestionnaire sont des mécanismes distincts.",
      ],
      [
        "Que fait un second appel à setOnAction sur le même Button ?",
        "Il remplace la valeur précédente de onAction",
        [
          "Il crée un nouveau bouton",
          "Il lance un thread",
          "Il ajoute forcément deux actions",
        ],
        "Une propriété de gestionnaire contient une seule valeur courante.",
      ],
      [
        "Dans quel sens se propage la phase de bubbling ?",
        "De la cible vers ses ancêtres",
        [
          "De la racine vers la cible",
          "Uniquement entre fenêtres",
          "Du serveur vers la scène",
        ],
        "Les handlers interviennent pendant la remontée de la route d’événement.",
      ],
      [
        "Quel choix permet une action de bouton accessible au clavier ?",
        "Traiter ActionEvent",
        [
          "Traiter seulement un clic droit",
          "Désactiver le focus",
          "Lire directement les coordonnées de souris",
        ],
        "L’activation du contrôle peut provenir du clavier ou de la souris.",
      ],
      [
        "Où placer une logique métier réutilisable ?",
        "Dans un service ou modèle distinct du handler UI",
        [
          "Dans chaque chaîne CSS",
          "Dans l’attribut fx:id",
          "Dans le nom de fichier image",
        ],
        "Le contrôleur orchestre ; la logique distincte est plus facile à tester et réutiliser.",
      ],
      [
        "Que faire avant d’envoyer un formulaire invalide ?",
        "Afficher une erreur près du champ et garder les valeurs saisies",
        [
          "Vider tous les champs sans explication",
          "Fermer la fenêtre immédiatement",
          "Ignorer silencieusement l’action",
        ],
        "Une validation utile aide l’utilisateur à comprendre et corriger le problème.",
      ],
    ],
  },
  "fx-binding": {
    body: "Une propriété observable contient une valeur et signale ses changements. Un binding unidirectionnel calcule une propriété à partir d’une autre ; un binding bidirectionnel synchronise deux propriétés compatibles. Les listeners servent aux effets de bord, mais doivent être détachés quand leur durée de vie dépasse celle de la vue.",
    bullets: [
      "ChangeListener reçoit ancienne et nouvelle valeurs ; InvalidationListener signale que la valeur doit être réévaluée.",
      "unbind libère un binding unidirectionnel avant une affectation manuelle.",
      "ObservableList signale les changements de structure ; suivre les propriétés des objets contenus exige des propriétés observables et éventuellement un extractor.",
    ],
    formula:
      "total = quantité × prixUnitaire\nBinding : quantité change → total est invalidé → valeur recalculée à la demande",
    questions: [
      [
        "Quel listener reçoit ancienne et nouvelle valeurs ?",
        "ChangeListener",
        ["ActionEvent", "ListCell", "FXMLLoader"],
        "Il reçoit l’observable, l’ancienne valeur et la nouvelle valeur.",
      ],
      [
        "Que faire avant de modifier manuellement une propriété liée unidirectionnellement ?",
        "Appeler unbind()",
        [
          "Appeler bind() une deuxième fois",
          "Changer son fx:id",
          "Déplacer le Stage",
        ],
        "Une propriété liée ne peut pas être définie directement tant que son binding est actif.",
      ],
      [
        "Pourquoi retirer un listener devenu inutile ?",
        "Pour éviter des références et traitements conservés inutilement",
        [
          "Pour augmenter la résolution écran",
          "Pour changer le thème système",
          "Pour réinitialiser le compilateur",
        ],
        "Un objet vivant peut garder un listener et sa vue en mémoire.",
      ],
      [
        "Un binding unidirectionnel propage les changements dans quel sens ?",
        "De la source vers la propriété liée",
        [
          "Toujours dans les deux sens",
          "Uniquement depuis la souris",
          "Uniquement à la fermeture",
        ],
        "La propriété liée dépend de la source ; elle ne la pilote pas en retour.",
      ],
      [
        "Une ObservableList suit-elle automatiquement tout champ ordinaire de ses objets ?",
        "Non, la structure observable ne rend pas chaque champ observable",
        [
          "Oui, même les champs privés non observables",
          "Oui, si la liste contient dix objets",
          "Oui, uniquement sur Android",
        ],
        "Les modifications internes nécessitent un mécanisme observable adapté.",
      ],
      [
        "Quel mécanisme convient pour un total dérivé de quantité × prix ?",
        "Un binding numérique",
        [
          "Un Thread.sleep dans le handler",
          "Une reconstruction du Stage à chaque touche",
          "Un nom de classe CSS",
        ],
        "Le total reste cohérent avec les propriétés dont il dépend.",
      ],
    ],
  },
  "fx-fxml": {
    body: "FXML décrit la structure de la vue ; le contrôleur relie ses éléments aux actions. Le FXMLLoader construit le graphe, injecte les champs puis appelle initialize. Évite de mélanger fx:controller avec setController sur le même chargement : choisis un mode de fourniture du contrôleur.",
    bullets: [
      "@FXML permet notamment l’accès à des champs ou méthodes non publics pour le chargement.",
      "fx:id identifie un objet pour le namespace et l’injection ; l’id CSS peut être défini séparément.",
      "Une ressource introuvable produit souvent une URL nulle : vérifie le chemin, la casse et le packaging.",
    ],
    diagram: {
      caption: "Du fichier à la vue prête",
      steps: [
        "Ressource .fxml",
        "FXMLLoader.load()",
        "Construction + injection",
        "initialize()",
        "Vue affichée",
      ],
    },
    questions: [
      [
        "Pourquoi un champ @FXML peut-il être null dans le constructeur ?",
        "L’injection n’a pas encore eu lieu",
        [
          "FXML interdit les champs privés",
          "Le CSS a supprimé le champ",
          "La scène est trop petite",
        ],
        "Le chargement instancie d’abord le contrôleur, puis injecte les objets.",
      ],
      [
        "Quand récupérer le contrôleur avec loader.getController() pour utiliser ses champs injectés ?",
        "Après loader.load()",
        [
          "Avant de choisir la ressource",
          "Uniquement après Application.stop()",
          "Dans un fichier CSS",
        ],
        "Le chargement doit avoir construit et injecté la vue.",
      ],
      [
        "Peut-on définir fx:controller et appeler setController pour le même chargement ?",
        "Non, il faut choisir un seul de ces modes",
        [
          "Oui, cela crée deux contrôleurs synchronisés",
          "Oui, si les noms sont identiques",
          "Oui, uniquement avec VBox",
        ],
        "Ces deux modes concurrents provoquent une erreur de contrôleur déjà spécifié.",
      ],
      [
        "Que vérifier si getResource renvoie null ?",
        "Le chemin, la casse et la présence de la ressource empaquetée",
        [
          "Le nombre de processeurs",
          "La taille du Stage uniquement",
          "Le serveur DHCP",
        ],
        "Une ressource classpath doit être disponible à l’emplacement exact demandé.",
      ],
      [
        "Quel symbole lie un onAction FXML à une méthode du contrôleur ?",
        "#",
        ["$ uniquement", "@ uniquement", "% uniquement"],
        'Par exemple onAction="#valider" fait référence à une méthode du contrôleur.',
      ],
      [
        "Quel est l’intérêt principal de FXML ?",
        "Séparer la description de la vue de sa logique de contrôle",
        [
          "Exécuter Java sans JVM",
          "Rendre tous les traitements asynchrones",
          "Remplacer toutes les dépendances JavaFX",
        ],
        "Cette séparation facilite la lecture et l’évolution de l’interface.",
      ],
    ],
  },
  "fx-concurrency": {
    body: "Un Task encapsule un travail exécuté en arrière-plan dans call. Il expose un état, une valeur, une exception et une progression observables. updateProgress et updateMessage transmettent des informations sans modifier directement les contrôles. L’annulation reste coopérative : le travail doit régulièrement vérifier isCancelled et gérer les interruptions.",
    bullets: [
      "onFailed expose l’échec via getException ; informe l’utilisateur au lieu de laisser le bouton bloqué.",
      "Service crée de nouveaux Task et facilite la réutilisation ; un Task terminé ne se relance pas.",
      "Évite une boucle qui envoie des milliers de runLater : regroupe les mises à jour pour garder une interface réactive.",
    ],
    formula:
      "progression = travail effectué / travail total\n25 éléments sur 100 → 0,25 → 25 %",
    diagram: {
      caption: "Séparer calcul et affichage",
      steps: [
        "Thread UI · lancer Task",
        "Thread de fond · call()",
        "updateProgress / résultat",
        "Thread UI · onSucceeded ou onFailed",
      ],
    },
    questions: [
      [
        "Quelle méthode faut-il redéfinir pour le travail d’un Task ?",
        "call()",
        ["paint()", "start(Stage)", "initialize(URL)"],
        "call s’exécute sur le thread qui lance la tâche en arrière-plan.",
      ],
      [
        "Comment publier une progression depuis call() ?",
        "Avec updateProgress(effectué, total)",
        [
          "En modifiant directement le ProgressBar vivant",
          "Avec Stage.show()",
          "Avec Thread.stop()",
        ],
        "Task transmet les mises à jour à ses propriétés observables gérées par JavaFX.",
      ],
      [
        "Que doit faire un travail long pour respecter une annulation ?",
        "Vérifier isCancelled et gérer les interruptions",
        [
          "Ignorer toutes les interruptions",
          "Redémarrer la même Task",
          "Bloquer le thread UI",
        ],
        "L’annulation est coopérative ; elle ne termine pas magiquement tout code externe.",
      ],
      [
        "Où obtenir la cause d’une Task en échec ?",
        "Dans getException(), notamment depuis onFailed",
        [
          "Dans le texte CSS",
          "Dans la largeur de la Scene",
          "Dans le port du serveur DNS",
        ],
        "L’exception permet d’expliquer l’échec et de proposer une nouvelle tentative.",
      ],
      [
        "Quel objet JavaFX convient pour un travail réutilisable produisant de nouveaux Task ?",
        "Service",
        ["Stage", "GridPane", "FXMLLoader"],
        "Service gère un cycle de vie qui crée une nouvelle tâche pour une nouvelle exécution.",
      ],
      [
        "Pourquoi regrouper des mises à jour runLater très fréquentes ?",
        "Pour éviter de saturer la file du thread UI",
        [
          "Pour contourner le type de retour Java",
          "Pour doubler automatiquement le débit réseau",
          "Pour supprimer le graphe de scène",
        ],
        "Trop de petites mises à jour peuvent rendre l’interface moins réactive malgré le travail de fond.",
      ],
    ],
  },
};
export function enrich(subject: Subject): Subject {
  return {
    ...subject,
    sources: [
      ...subject.sources,
      ...(subject.id === "ccna1"
        ? [
            {
              title: "IETF · CIDR (RFC 4632)",
              url: "https://www.rfc-editor.org/rfc/rfc4632.html",
            },
            {
              title: "IETF · Neighbor Discovery (RFC 4861)",
              url: "https://www.rfc-editor.org/rfc/rfc4861.html",
            },
            {
              title: "IETF · ARP (RFC 826)",
              url: "https://www.rfc-editor.org/rfc/rfc826.html",
            },
          ]
        : subject.id === "ccna2"
          ? [
              {
                title: "Cisco · STP et EtherChannel, IOS XE 17.15",
                url: "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-15/configuration_guide/lyr2/b_1715_lyr2_9300_cg/configuring_spanning_tree_protocol.html",
              },
            ]
          : [
              {
                title: "OpenJFX · Task et concurrence",
                url: "https://openjfx.io/javadoc/25/javafx.graphics/javafx/concurrent/Task.html",
              },
            ]),
    ],
    chapters: subject.chapters.map((chapter) => {
      const add = additions[chapter.id];
      if (!add) return chapter;
      const section: Chapter["sections"][number] = {
        title: "Pour comprendre un cran plus loin",
        body: add.body,
        bullets: add.bullets,
        formula: add.formula,
        diagram: add.diagram,
      };
      return {
        ...chapter,
        minutes: chapter.minutes + 3,
        sections: [...chapter.sections, section],
        cards: [
          ...chapter.cards,
          ...add.questions.map(
            ([question, answer, distractors, explanation], i) => {
              const choices = [...distractors];
              choices.splice((i + 1) % 4, 0, answer);
              return {
                id: `${chapter.id}-v2-q${i + 1}`,
                question,
                answer,
                choices,
                correct: (i + 1) % 4,
                explanation,
              };
            },
          ),
        ],
      };
    }),
  };
}
