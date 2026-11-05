import { chapter as c } from "./helpers";
import type { Subject } from "../src/lib/content";
export const ccna2: Subject = {
  id: "ccna2",
  title: "CCNA 2",
  subtitle: "Commutation & routage",
  color: "lavender",
  icon: "router",
  description:
    "Structurer un réseau, faire circuler les paquets et connecter les utilisateurs.",
  sources: [
    {
      title: "Cisco · Switching, Routing and Wireless Essentials",
      url: "https://www.netacad.com/courses/ccna-switching-routing-wireless-essentials",
    },
    {
      title: "IETF · DHCP (RFC 2131)",
      url: "https://www.rfc-editor.org/rfc/rfc2131.html",
    },
  ],
  chapters: [
    c(
      "c2-vlan",
      "VLAN & trunks",
      "Segmenter un réseau local et transporter plusieurs VLAN.",
      12,
      [
        {
          title: "Séparer les domaines de diffusion",
          body: "Un VLAN crée un domaine de diffusion logique. Deux postes dans des VLAN différents ont besoin d’un équipement de couche 3 pour communiquer, même s’ils sont connectés au même switch. La séparation réduit les diffusions et facilite l’organisation des politiques de réseau.",
        },
        {
          title: "Access ou trunk ?",
          body: "Un port access associe habituellement un poste à un VLAN de données. Un trunk transporte plusieurs VLAN sur un seul lien avec une étiquette IEEE 802.1Q. Le VLAN natif est généralement non étiqueté sur un trunk Cisco, selon la configuration. Les deux extrémités doivent s’accorder sur le VLAN natif et les VLAN autorisés.",
          code: "vlan 10\n name ETUDIANTS\ninterface GigabitEthernet0/1\n switchport mode access\n switchport access vlan 10\n! Sur le lien entre switches :\ninterface GigabitEthernet0/2\n switchport mode trunk\n switchport trunk allowed vlan 10,20",
        },
        {
          title: "Valider la configuration",
          body: "Vérifie que le VLAN existe, que le port est dans le bon VLAN et que le trunk laisse passer ce VLAN. Les noms d’interfaces et les commandes disponibles varient selon le matériel.",
          bullets: [
            "show vlan brief : affectation des ports access.",
            "show interfaces trunk : état et VLAN transportés.",
            "Un trunk n’effectue pas le routage inter-VLAN.",
          ],
        },
      ],
      "Un VLAN = un domaine de diffusion. Un trunk transporte ; un routeur fait communiquer.",
      [
        [
          "Quel est l’effet principal d’un VLAN ?",
          "Créer un domaine de diffusion logique",
          [
            "Augmenter la taille des adresses MAC",
            "Remplacer TCP",
            "Chiffrer les trames automatiquement",
          ],
          "Chaque VLAN limite la portée des diffusions de couche 2.",
        ],
        [
          "Quel standard identifie les VLAN sur un trunk Ethernet ?",
          "IEEE 802.1Q",
          ["IEEE 802.11 uniquement", "HTTP/2", "RFC 1918"],
          "802.1Q ajoute une étiquette qui contient notamment l’identifiant du VLAN.",
        ],
        [
          "Deux VLAN peuvent-ils communiquer grâce au trunk seul ?",
          "Non, il faut du routage de couche 3",
          [
            "Oui, toujours",
            "Oui, si leur nom est identique",
            "Oui, avec un câble croisé uniquement",
          ],
          "Le trunk transporte plusieurs VLAN tout en conservant leur séparation.",
        ],
        [
          "Quelle commande permet de vérifier les trunks Cisco ?",
          "show interfaces trunk",
          ["show ip dns", "show running-clock", "ping vlan"],
          "Elle affiche l’état du trunk et les VLAN autorisés ou actifs.",
        ],
      ],
      [
        "Deux postes du VLAN 10 sur deux switches ne communiquent pas. Le lien entre switches est actif. Propose quatre vérifications.",
        "Vérifier les adresses et masques des postes, leur affectation au VLAN 10, l’existence du VLAN sur les switches, puis le mode trunk et l’autorisation du VLAN 10 sur le lien. Contrôler aussi STP et la cohérence du VLAN natif si nécessaire.",
        [
          "IP et masques cohérents",
          "Ports access dans le VLAN 10",
          "VLAN créé sur les switches",
          "Trunk actif autorisant VLAN 10",
        ],
      ],
    ),
    c(
      "c2-intervlan",
      "Le routage inter-VLAN",
      "Router-on-a-stick, sous-interfaces et SVI.",
      12,
      [
        {
          title: "Une passerelle par réseau",
          body: "Chaque VLAN utilise généralement un sous-réseau IP distinct avec sa propre passerelle. Un routeur ou un switch multicouche assure le routage entre ces sous-réseaux. Le poste envoie à sa passerelle les paquets dont la destination est hors de son sous-réseau.",
        },
        {
          title: "Router-on-a-stick",
          body: "Une interface physique du routeur transporte plusieurs VLAN via un trunk. Des sous-interfaces associent un VLAN 802.1Q à une adresse de passerelle. L’interface physique doit être active.",
          code: "interface GigabitEthernet0/0\n no shutdown\ninterface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface GigabitEthernet0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0",
        },
        {
          title: "Les SVI sur un switch multicouche",
          body: "Une SVI est une interface logique de VLAN. Sur un switch compatible, on configure une IP par SVI et on active le routage IP. L’état opérationnel de la SVI dépend notamment de l’existence du VLAN et de ports actifs dans ce VLAN.",
          bullets: [
            "Le trunk du switch doit autoriser les VLAN attendus.",
            "La passerelle des postes doit appartenir à leur sous-réseau.",
            "Contrôler les ACL si le routage fonctionne mais qu’un flux est refusé.",
          ],
        },
      ],
      "Une sous-interface ou une SVI porte la passerelle de chaque VLAN.",
      [
        [
          "Quel est le rôle d’une sous-interface dans router-on-a-stick ?",
          "Router un VLAN identifié par 802.1Q",
          [
            "Créer une nouvelle carte physique",
            "Supprimer le besoin de passerelle",
            "Attribuer des MAC aux hôtes",
          ],
          "Chaque sous-interface associe une étiquette VLAN à une configuration IP.",
        ],
        [
          "Quelle passerelle choisir pour 192.168.20.15/24 dans cet exemple ?",
          "192.168.20.1",
          ["192.168.10.1", "192.168.20.255", "127.0.0.1"],
          "La passerelle doit être une interface du routeur joignable dans le même sous-réseau.",
        ],
        [
          "Que signifie SVI ?",
          "Switch Virtual Interface",
          [
            "Secure VLAN Internet",
            "Static Virtual IPsec",
            "Switch Version Identifier",
          ],
          "La SVI est l’interface logique associée à un VLAN sur le switch.",
        ],
        [
          "Que faut-il activer sur un switch multicouche pour router entre SVI ?",
          "Le routage IP",
          [
            "Le mode avion",
            "Le DNS obligatoire",
            "Le half-duplex sur tous les ports",
          ],
          "Sur les équipements Cisco compatibles, la commande est généralement ip routing.",
        ],
      ],
      [
        "Conçois un routage entre VLAN 10 (192.168.10.0/24) et VLAN 20 (192.168.20.0/24) avec un seul port physique de routeur.",
        "Configurer un trunk entre le switch et le routeur autorisant 10 et 20. Activer le port du routeur. Créer les sous-interfaces .10 et .20 avec encapsulation dot1Q 10 et 20, puis les IP 192.168.10.1/24 et 192.168.20.1/24. Définir ces adresses comme passerelles respectives des hôtes.",
        [
          "Trunk autorisant 10 et 20",
          "Interface physique active",
          "Sous-interfaces et encapsulation correctes",
          "IP et passerelles cohérentes",
        ],
      ],
    ),
    c(
      "c2-stp",
      "STP & EtherChannel",
      "Ajouter de la redondance sans créer de boucle.",
      14,
      [
        {
          title: "Pourquoi les boucles sont dangereuses",
          body: "Ethernet ne possède pas de TTL de couche 2. Une boucle peut provoquer des tempêtes de diffusion, des trames dupliquées et une instabilité de la table MAC. STP construit une topologie sans boucle en plaçant certains ports dans un état qui empêche le transfert des données.",
        },
        {
          title: "Élire une racine",
          body: "Le switch dont le Bridge ID est le plus faible devient racine. La priorité est comparée avant la partie MAC. Les autres switches déterminent leur meilleur chemin vers la racine à partir du coût. RSTP accélère la convergence par rapport au STP classique.",
          bullets: [
            "Choisir volontairement une racine et une racine de secours.",
            "PortFast est destiné aux ports de bordure raccordés aux hôtes.",
            "BPDU Guard protège ces ports contre la réception inattendue de BPDU.",
          ],
        },
        {
          title: "Regrouper avec EtherChannel",
          body: "EtherChannel regroupe plusieurs liens en une interface logique. STP traite ce groupe comme un lien. LACP négocie la formation du groupe : active/active et active/passive peuvent fonctionner, passive/passive ne démarre pas la négociation. Les paramètres des interfaces doivent être compatibles. Un flux unique ne cumule pas nécessairement le débit de tous les liens.",
        },
      ],
      "STP supprime les boucles ; EtherChannel regroupe des liens cohérents en un lien logique.",
      [
        [
          "Quel switch devient racine STP ?",
          "Celui avec le Bridge ID le plus faible",
          [
            "Celui qui a le plus de ports",
            "Celui dont l’IP est la plus grande",
            "Le dernier démarré",
          ],
          "Le Bridge ID intègre la priorité et la MAC, ainsi que l’identifiant système étendu selon le mode.",
        ],
        [
          "Pourquoi une boucle Ethernet peut-elle persister ?",
          "Les trames Ethernet n’ont pas de TTL de couche 2",
          [
            "TCP désactive STP",
            "ARP chiffre les trames",
            "Le masque devient nul",
          ],
          "Sans mécanisme de prévention, les trames peuvent circuler indéfiniment dans une boucle.",
        ],
        [
          "Quelle paire de modes LACP ne lance pas la négociation ?",
          "Passive / passive",
          ["Active / active", "Active / passive", "Passive / active"],
          "Au moins un côté doit initier l’échange LACP en mode active.",
        ],
        [
          "Où utiliser PortFast normalement ?",
          "Sur les ports de bordure vers les hôtes",
          [
            "Sur tous les liens entre switches sans contrôle",
            "Sur les interfaces WAN uniquement",
            "Sur les serveurs DNS seulement",
          ],
          "PortFast accélère le passage en forwarding des ports de bordure ; il ne remplace pas la protection contre les boucles.",
        ],
      ],
      [
        "Deux switches sont reliés par deux câbles. Explique comment éviter une boucle et comment utiliser les deux liens dans un EtherChannel.",
        "Sans agrégation, STP bloque logiquement un chemin redondant pour éviter la boucle. Pour utiliser les liens en groupe, configurer des paramètres compatibles et un EtherChannel LACP avec au moins un côté active. STP voit alors le port-channel comme un seul lien. La répartition dépend du hachage : un flux ne profite pas forcément du débit cumulé.",
        [
          "Risque de boucle Ethernet",
          "Rôle de STP",
          "LACP et cohérence des ports",
          "Lien logique et limite par flux",
        ],
      ],
    ),
    c(
      "c2-dhcp",
      "DHCP & sécurité du LAN",
      "Distribuer les adresses et protéger les ports d’accès.",
      12,
      [
        {
          title: "Les quatre étapes de DHCPv4",
          body: "Le client recherche un serveur avec Discover. Le serveur propose une configuration avec Offer. Le client demande l’offre retenue avec Request. Le serveur confirme avec ACK. Cette séquence est souvent mémorisée par DORA. L’adresse est associée à un bail renouvelable.",
        },
        {
          title: "Traverser les sous-réseaux",
          body: "Les diffusions initiales DHCP ne sont normalement pas routées. Un agent relais transmet les demandes vers un serveur distant. Sur une interface Cisco côté clients, ip helper-address permet notamment ce relais.",
          code: "interface Vlan10\n ip address 192.168.10.1 255.255.255.0\n ip helper-address 192.168.100.10",
        },
        {
          title: "Protéger le réseau d’accès",
          body: "DHCP snooping distingue les ports de confiance et les ports clients afin de limiter les serveurs DHCP non autorisés. Port security limite les MAC autorisées sur un port selon la configuration. Désactiver les ports inutilisés réduit les accès possibles.",
          bullets: [
            "Ne déclarer de confiance que les chemins légitimes vers le serveur DHCP.",
            "Dynamic ARP Inspection peut exploiter la base DHCP snooping.",
            "Une sécurité de port mal réglée peut bloquer un utilisateur légitime.",
          ],
        },
      ],
      "DORA : Discover, Offer, Request, ACK. Le relais sert les clients d’un autre sous-réseau.",
      [
        [
          "Quel est l’ordre de l’attribution DHCPv4 initiale ?",
          "Discover, Offer, Request, ACK",
          [
            "Request, Discover, ACK, Offer",
            "Offer, ACK, Discover, Request",
            "ACK, Request, Offer, Discover",
          ],
          "Le client recherche, le serveur propose, le client choisit, puis le serveur confirme.",
        ],
        [
          "Pourquoi utiliser un relais DHCP ?",
          "Pour atteindre un serveur dans un autre sous-réseau",
          [
            "Pour supprimer le masque",
            "Pour remplacer le DNS",
            "Pour chiffrer automatiquement le Wi-Fi",
          ],
          "Le relais transmet les messages que le broadcast local ne ferait pas traverser au routeur.",
        ],
        [
          "Que limite principalement DHCP snooping ?",
          "Les réponses de serveurs DHCP non autorisés",
          [
            "Toutes les routes statiques",
            "Les mises à jour Java",
            "Le nombre de VLAN à un seul",
          ],
          "Les réponses serveur sont acceptées sur des ports explicitement définis comme fiables.",
        ],
        [
          "Quelle commande Cisco configure le relais dans cet exemple ?",
          "ip helper-address 192.168.100.10",
          [
            "ip route dhcp all",
            "switchport dns enable",
            "arp relay 192.168.100.10",
          ],
          "La commande s’applique à l’interface de couche 3 côté clients.",
        ],
      ],
      [
        "Les clients du VLAN 10 ne reçoivent pas d’IP alors que le serveur DHCP est dans le VLAN 100. Établis un diagnostic.",
        "Vérifier le VLAN et l’état des ports, la SVI ou passerelle du VLAN 10, puis le relais pointant vers le serveur. Vérifier le routage aller-retour, les filtrages UDP et l’existence d’un pool disponible pour le sous-réseau du VLAN 10. Contrôler les ports de confiance si DHCP snooping est actif.",
        [
          "Connectivité du VLAN client",
          "Relais sur la bonne interface",
          "Routage et filtrage",
          "Pool adapté et snooping",
        ],
      ],
    ),
    c(
      "c2-routage",
      "Routes statiques & route par défaut",
      "Lire une table de routage et choisir le bon chemin.",
      14,
      [
        {
          title: "La règle du préfixe le plus long",
          body: "Un routeur cherche parmi les routes installées celle dont le préfixe correspond le plus précisément à la destination. Une route /24 correspondante est préférée à une /16 correspondante. La route par défaut /0 n’est choisie que lorsqu’aucune route plus spécifique ne correspond.",
        },
        {
          title: "Installer une route statique",
          body: "Une route statique indique le réseau de destination et un prochain saut ou une interface de sortie. Le prochain saut doit être joignable. Pour que la communication fonctionne, le retour doit lui aussi disposer d’une route.",
          code: "! Route vers le réseau distant\nip route 192.168.30.0 255.255.255.0 10.0.0.2\n! Route par défaut\nip route 0.0.0.0 0.0.0.0 10.0.0.2\n! Vérifier\nshow ip route",
        },
        {
          title: "Distance administrative et métrique",
          body: "Pour un même préfixe appris par plusieurs sources, la distance administrative aide à choisir la source de route préférée. La métrique compare les chemins d’un protocole. Une route statique flottante utilise une distance plus élevée pour servir de secours lorsque la route préférée disparaît.",
        },
      ],
      "D’abord le préfixe le plus long parmi les routes installées. Pense toujours au chemin retour.",
      [
        [
          "Quelle route correspond le mieux à 192.168.30.15 ?",
          "192.168.30.0/24",
          ["192.168.0.0/16", "0.0.0.0/0", "192.0.0.0/8"],
          "Le /24 est le préfixe correspondant le plus long parmi ces choix.",
        ],
        [
          "Quel préfixe représente la route IPv4 par défaut ?",
          "0.0.0.0/0",
          ["127.0.0.0/8", "255.255.255.255/32", "169.254.0.0/16"],
          "Le préfixe /0 peut correspondre à toute destination IPv4.",
        ],
        [
          "À quoi sert une route statique flottante ?",
          "À fournir une route de secours",
          [
            "À désactiver toutes les routes",
            "À remplacer ARP",
            "À transporter des VLAN sans trunk",
          ],
          "Sa distance administrative supérieure la rend moins préférée que la route principale pour le même préfixe.",
        ],
        [
          "Un paquet atteint le serveur mais aucune réponse ne revient. Que vérifier ?",
          "La route de retour et les filtrages",
          [
            "La police de l’application",
            "Le nom du câble",
            "Le numéro de VLAN du DNS uniquement",
          ],
          "Un chemin aller correct ne garantit ni le chemin retour ni l’autorisation du trafic.",
        ],
      ],
      [
        "Une table contient 10.0.0.0/8 via A, 10.2.0.0/16 via B et 0.0.0.0/0 via C. Où partent 10.2.3.4, 10.8.1.1 et 8.8.8.8 ? Explique.",
        "10.2.3.4 utilise B car /16 est le préfixe correspondant le plus long. 10.8.1.1 utilise A via /8. 8.8.8.8 ne correspond à aucun de ces préfixes spécifiques et utilise C via la route par défaut. Ce choix s’effectue parmi les routes installées dans la table.",
        [
          "10.2.3.4 via B",
          "10.8.1.1 via A",
          "8.8.8.8 via C",
          "Justifier par le préfixe le plus long",
        ],
      ],
    ),
    c(
      "c2-wifi",
      "Wi-Fi & sécurisation",
      "SSID, bandes radio et authentification.",
      11,
      [
        {
          title: "Un média partagé",
          body: "Le Wi-Fi utilise un média radio partagé. Le SSID est le nom logique du réseau ; le BSSID identifie une cellule radio, généralement par une adresse MAC. Le point d’accès relie les clients sans fil au réseau de distribution. Les obstacles, les interférences et la distance influencent le signal.",
        },
        {
          title: "Choisir les canaux",
          body: "Les bandes 2,4 GHz, 5 GHz et, sur le matériel compatible, 6 GHz offrent des compromis de portée et de capacité. En 2,4 GHz à 20 MHz, les canaux 1, 6 et 11 sont une planification courante sans chevauchement là où ils sont autorisés. La réglementation locale et la largeur de canal doivent être vérifiées.",
        },
        {
          title: "Authentifier et isoler",
          body: "WPA3-Personal utilise SAE. Les modes Enterprise utilisent généralement 802.1X avec un serveur d’authentification, souvent RADIUS. Séparer les invités dans un VLAN et appliquer des règles adaptées limite leurs accès au réseau interne.",
          bullets: [
            "Éviter WEP, protocole obsolète et vulnérable.",
            "Masquer le SSID n’est pas une protection suffisante.",
            "Un mot de passe robuste et des équipements maintenus restent nécessaires.",
          ],
        },
      ],
      "La sécurité Wi-Fi repose sur l’authentification, le chiffrement et les règles d’accès.",
      [
        [
          "Que représente le SSID ?",
          "Le nom logique du réseau Wi-Fi",
          ["Le masque IPv4", "Le port du DNS", "Le numéro de série du routeur"],
          "Plusieurs points d’accès peuvent diffuser le même SSID.",
        ],
        [
          "Quel mécanisme est utilisé par WPA3-Personal ?",
          "SAE",
          ["WEP", "Telnet", "ARP"],
          "SAE remplace l’échange fondé sur la clé prépartagée de WPA2-Personal.",
        ],
        [
          "Quel ensemble est courant en 2,4 GHz à 20 MHz sans chevauchement ?",
          "1, 6 et 11",
          ["1, 2 et 3", "4, 5 et 6", "9, 10 et 11"],
          "La disponibilité et les contraintes radio dépendent du pays ; ce plan est un exemple courant.",
        ],
        [
          "Quelle mesure aide à isoler les visiteurs ?",
          "Un VLAN invité avec règles d’accès adaptées",
          [
            "Masquer seulement le SSID",
            "Désactiver tout chiffrement",
            "Partager le compte administrateur",
          ],
          "Le VLAN et les règles de filtrage peuvent limiter l’accès au réseau interne.",
        ],
      ],
      [
        "Propose un réseau Wi-Fi pour employés et visiteurs en expliquant séparation, sécurité et planification radio.",
        "Utiliser des SSID distincts associés à des VLAN employés et invités. Prévoir une authentification d’entreprise pour les employés si l’infrastructure le permet et une protection adaptée pour les invités. Filtrer les accès du VLAN invité vers les ressources internes. Planifier les canaux selon une étude radio, les largeurs utilisées et la réglementation.",
        [
          "SSID et VLAN distincts",
          "Authentification et chiffrement adaptés",
          "Filtrage des invités",
          "Planification radio et réglementation",
        ],
      ],
    ),
  ],
};
