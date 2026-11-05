import { chapter as c } from "./helpers";
import type { Subject } from "../src/lib/content";
export const ccna1: Subject = {
  id: "ccna1",
  title: "CCNA 1",
  subtitle: "Les fondations du réseau",
  color: "mint",
  icon: "network",
  description:
    "Comprendre comment les machines communiquent. Des premiers paquets à l’adressage IP.",
  sources: [
    {
      title: "Cisco · Introduction to Networks",
      url: "https://www.netacad.com/courses/ccna-introduction-networks",
    },
    {
      title: "IETF · IPv6 (RFC 8200)",
      url: "https://www.rfc-editor.org/rfc/rfc8200.html",
    },
    {
      title: "IETF · TCP (RFC 9293)",
      url: "https://www.rfc-editor.org/rfc/rfc9293.html",
    },
  ],
  chapters: [
    c(
      "c1-reseaux",
      "Bienvenue dans le réseau",
      "Hôtes, équipements et chemins de communication.",
      8,
      [
        {
          title: "Un réseau, des échanges",
          body: "Un réseau relie des hôtes pour partager des données et des services. Un client demande un service ; un serveur le fournit. Un même ordinateur peut jouer les deux rôles. Le LAN relie les équipements d’une zone locale, tandis qu’un WAN interconnecte des réseaux sur une étendue plus grande.",
        },
        {
          title: "Chaque équipement a son rôle",
          body: "Le commutateur relie des équipements dans un réseau local Ethernet. Le routeur transmet les paquets entre des réseaux IP distincts. Le point d’accès connecte les stations Wi-Fi au réseau.",
          bullets: [
            "Un hôte est une source ou une destination de données.",
            "Le débit décrit une capacité de transmission ; la latence décrit un délai.",
            "La redondance offre un chemin alternatif en cas de panne.",
          ],
        },
        {
          title: "Suivre le trajet d’un message",
          body: "Pour joindre un serveur hors de son sous-réseau, un poste remet le paquet à sa passerelle par défaut. Les routeurs suivants choisissent chacun une route vers le réseau de destination. La passerelle doit être joignable sur le lien local.",
        },
      ],
      "Le switch connecte le réseau local ; le routeur connecte les réseaux entre eux.",
      [
        [
          "Quel équipement relie des réseaux IP distincts ?",
          "Un routeur",
          ["Un répéteur", "Un concentrateur", "Un câble Ethernet"],
          "Le routeur consulte sa table de routage pour choisir où transmettre un paquet.",
        ],
        [
          "Que mesure principalement la latence ?",
          "Le délai de transmission",
          [
            "La capacité en bits par seconde",
            "Le nombre de ports",
            "La longueur d’une adresse IP",
          ],
          "Une connexion peut avoir un débit élevé mais un délai important.",
        ],
        [
          "À quoi sert la passerelle par défaut ?",
          "À joindre les réseaux distants",
          [
            "À attribuer une adresse MAC",
            "À chiffrer chaque trame",
            "À remplacer le serveur DNS",
          ],
          "Si la destination est extérieure au sous-réseau, le poste envoie le paquet à sa passerelle.",
        ],
        [
          "Pourquoi prévoir des chemins redondants ?",
          "Pour améliorer la disponibilité",
          [
            "Pour supprimer les adresses IP",
            "Pour rendre le DNS inutile",
            "Pour garantir une latence nulle",
          ],
          "Un chemin de secours permet de maintenir les échanges après une défaillance.",
        ],
      ],
      [
        "Un poste accède à un serveur situé sur un autre réseau. Décris le rôle du poste, du switch et du routeur.",
        "Le poste compare l’adresse de destination à son propre sous-réseau. Il prépare une trame à destination de la passerelle. Le switch transmet la trame sur le lien local. Le routeur consulte sa table de routage et transmet le paquet vers le réseau du serveur.",
        [
          "Identifier une destination distante",
          "Remettre le paquet à la passerelle",
          "Expliquer le rôle local du switch",
          "Expliquer le choix de route du routeur",
        ],
      ],
    ),
    c(
      "c1-modeles",
      "OSI & TCP/IP",
      "Mettre de l’ordre dans les couches et l’encapsulation.",
      10,
      [
        {
          title: "Un modèle pour comprendre",
          body: "OSI répartit la communication en sept couches : physique, liaison de données, réseau, transport, session, présentation et application. Chaque couche rend un service à celle qui la précède dans le sens de l’utilisation. Ce modèle aide à localiser une panne sans décrire exactement chaque implémentation.",
        },
        {
          title: "La pile TCP/IP",
          body: "Le modèle TCP/IP regroupe généralement quatre couches : accès réseau, Internet, transport et application. IP assure l’acheminement entre réseaux ; TCP ou UDP transporte les échanges entre applications.",
          bullets: [
            "Physique : signaux et bits.",
            "Liaison : trames et adressage MAC.",
            "Réseau : paquets et adressage IP.",
            "Transport : segments TCP ou datagrammes UDP et ports.",
          ],
        },
        {
          title: "Encapsuler puis décapsuler",
          body: "À l’émission, les données applicatives reçoivent des informations de transport, puis IP, puis de liaison. À la réception, le chemin est inversé. À chaque saut routé, la trame de liaison est remplacée. Les adresses IP restent normalement celles des extrémités, sauf traduction comme le NAT.",
        },
      ],
      "Données → segment ou datagramme → paquet → trame → bits.",
      [
        [
          "Quelle couche OSI assure le routage IP ?",
          "La couche 3 — réseau",
          [
            "La couche 1 — physique",
            "La couche 2 — liaison",
            "La couche 7 — application",
          ],
          "La couche réseau permet l’adressage logique et l’acheminement entre réseaux.",
        ],
        [
          "Comment appelle-t-on l’unité de données de la couche liaison ?",
          "Une trame",
          ["Un segment", "Une session", "Un port"],
          "Une trame Ethernet encapsule notamment un paquet IP.",
        ],
        [
          "Quel identifiant permet de distinguer les applications en transport ?",
          "Le numéro de port",
          [
            "L’adresse MAC",
            "Le numéro de VLAN uniquement",
            "Le masque de sous-réseau",
          ],
          "Les ports TCP et UDP identifient les extrémités logiques des échanges applicatifs.",
        ],
        [
          "Que devient l’en-tête Ethernet lors du passage par un routeur ?",
          "Il est remplacé pour le lien suivant",
          [
            "Il reste identique de bout en bout",
            "Il devient un en-tête HTTP",
            "Il disparaît définitivement",
          ],
          "Le routeur retire la trame entrante et encapsule le paquet pour son interface de sortie.",
        ],
      ],
      [
        "Explique l’encapsulation d’une requête web et distingue adresse MAC, adresse IP et port.",
        "Les données web sont encapsulées dans un segment TCP, puis un paquet IP, puis une trame de liaison. Le port identifie le service ou le processus, l’adresse IP identifie une interface dans le routage, et l’adresse MAC permet la livraison sur le lien Ethernet. La trame change à chaque saut routé.",
        [
          "Respecter l’ordre d’encapsulation",
          "Associer le port au transport",
          "Associer IP au routage",
          "Associer MAC au lien local",
        ],
      ],
    ),
    c(
      "c1-ethernet",
      "Ethernet, MAC & ARP",
      "Comprendre la livraison sur le réseau local.",
      10,
      [
        {
          title: "La commutation Ethernet",
          body: "Un switch apprend l’adresse MAC source d’une trame et l’associe au port d’entrée, dans le VLAN concerné. Si la MAC destination est connue, il transmet vers le port correspondant. Un unicast inconnu est diffusé sur les autres ports de ce VLAN autorisés à transmettre.",
        },
        {
          title: "Résoudre une adresse avec ARP",
          body: "ARP associe une adresse IPv4 à une adresse MAC sur le lien local. Une requête ARP est diffusée ; la machine possédant l’IPv4 répond normalement en unicast. Pour joindre un hôte distant, le poste cherche la MAC de sa passerelle, pas celle du serveur distant.",
          bullets: [
            "Une adresse MAC Ethernet classique comporte 48 bits.",
            "FF:FF:FF:FF:FF:FF est l’adresse de diffusion Ethernet.",
            "La table MAC du switch et le cache ARP du poste ont des fonctions différentes.",
          ],
        },
        {
          title: "Vérifier avant de conclure",
          body: "Une interface active ne garantit pas que les adresses sont correctes. Vérifie le câble, le VLAN, l’IP, le masque, puis la résolution ARP.",
          code: "show mac address-table\nshow interfaces status\nshow ip arp",
        },
      ],
      "Le switch apprend grâce à la source ; il transmet en regardant la destination.",
      [
        [
          "Quelle adresse un switch utilise-t-il pour apprendre sa table MAC ?",
          "La MAC source de la trame",
          [
            "La MAC destination uniquement",
            "L’IP du DNS",
            "L’adresse de broadcast uniquement",
          ],
          "L’adresse source et le port entrant permettent de localiser l’émetteur.",
        ],
        [
          "Quel est le rôle d’ARP ?",
          "Associer une IPv4 à une MAC locale",
          [
            "Associer un nom DNS à une IP",
            "Attribuer une IPv6",
            "Chiffrer les paquets IP",
          ],
          "ARP s’utilise sur le lien local pour déterminer la destination de la trame Ethernet.",
        ],
        [
          "Quelle MAC est recherchée pour joindre un serveur IPv4 distant ?",
          "La MAC de la passerelle",
          [
            "La MAC du serveur distant",
            "La MAC du serveur DNS systématiquement",
            "La MAC de tous les routeurs",
          ],
          "Le premier destinataire Ethernet est la passerelle locale.",
        ],
        [
          "Que fait un switch d’un unicast dont il ignore la destination ?",
          "Il le diffuse dans le VLAN, sauf sur le port entrant",
          [
            "Il le transmet dans tous les VLAN",
            "Il le transforme en paquet DHCP",
            "Il le détruit toujours",
          ],
          "Cette diffusion permet la livraison avant l’apprentissage de la destination.",
        ],
      ],
      [
        "Le poste A veut contacter un serveur hors de son réseau et son cache ARP est vide. Décris les échanges locaux.",
        "A détermine que le serveur est distant grâce au masque. Il diffuse une requête ARP pour l’IPv4 de sa passerelle. La passerelle répond avec sa MAC. A envoie une trame à cette MAC en conservant l’IP du serveur comme destination IP. Le switch apprend la source et transmet la trame.",
        [
          "Déterminer que le serveur est distant",
          "Faire un ARP pour la passerelle",
          "Distinguer destination MAC et IP",
          "Expliquer l’apprentissage du switch",
        ],
      ],
    ),
    c(
      "c1-ipv4",
      "IPv4 & sous-réseaux",
      "Calculer un préfixe, un réseau et une plage d’hôtes.",
      15,
      [
        {
          title: "Une adresse, deux parties",
          body: "Une adresse IPv4 contient 32 bits. Le préfixe CIDR indique le nombre de bits réservés à la partie réseau : /24 correspond au masque 255.255.255.0. L’adresse réseau résulte d’un ET binaire entre IP et masque. Deux hôtes sont dans le même sous-réseau si leur partie réseau est identique.",
        },
        {
          title: "Découper sans se perdre",
          body: "Pour un sous-réseau classique de /1 à /30, avec h bits d’hôtes, on obtient 2^h adresses et 2^h − 2 adresses d’hôtes utilisables. La première adresse identifie le réseau, la dernière la diffusion. Les /31 point à point et les /32 sont des cas particuliers.",
          bullets: [
            "192.168.10.64/26 : réseau .64, broadcast .127.",
            "Hôtes utilisables : 192.168.10.65 à 192.168.10.126.",
            "Un /26 contient 64 adresses, soit 62 hôtes classiques.",
          ],
        },
        {
          title: "Adresses privées et diagnostic",
          body: "Les plages privées sont 10.0.0.0/8, 172.16.0.0/12 et 192.168.0.0/16. Elles ne sont pas destinées au routage sur Internet public. Le VLSM permet d’allouer des préfixes de tailles différentes selon les besoins.",
        },
      ],
      "Pour /26 : 6 bits d’hôtes, 64 adresses, 62 hôtes utilisables.",
      [
        [
          "Combien d’hôtes utilisables contient un sous-réseau IPv4 /26 classique ?",
          "62",
          ["64", "30", "126"],
          "32 − 26 = 6 bits : 2^6 − 2 = 62 hôtes.",
        ],
        [
          "Quel est le réseau de 192.168.10.70/26 ?",
          "192.168.10.64",
          ["192.168.10.0", "192.168.10.70", "192.168.10.128"],
          "Les blocs /26 commencent à 0, 64, 128 et 192 dans le dernier octet.",
        ],
        [
          "Quel masque correspond à /24 ?",
          "255.255.255.0",
          ["255.255.0.0", "255.255.255.128", "255.255.255.252"],
          "24 bits à 1 occupent les trois premiers octets.",
        ],
        [
          "Laquelle de ces adresses appartient à une plage privée ?",
          "172.20.5.8",
          ["172.32.5.8", "8.8.8.8", "169.254.1.1"],
          "172.16.0.0/12 couvre 172.16.0.0 à 172.31.255.255. 169.254.0.0/16 est une plage link-local.",
        ],
      ],
      [
        "Pour 192.168.20.130/27, donne le masque, le réseau, le broadcast et la plage d’hôtes utilisables. Justifie.",
        "Le masque /27 est 255.255.255.224. Il reste 5 bits, soit des blocs de 32 adresses. 130 appartient au bloc 128–159. Réseau : 192.168.20.128 ; broadcast : 192.168.20.159 ; hôtes : 192.168.20.129 à 192.168.20.158, soit 30 hôtes.",
        [
          "Masque 255.255.255.224",
          "Réseau .128 et bloc de 32",
          "Broadcast .159",
          "Plage .129–.158 et 30 hôtes",
        ],
      ],
    ),
    c(
      "c1-ipv6",
      "L’essentiel d’IPv6",
      "Préfixes, compression et découverte des voisins.",
      12,
      [
        {
          title: "128 bits pour adresser",
          body: "IPv6 utilise huit groupes de 16 bits écrits en hexadécimal. Les zéros initiaux de chaque groupe peuvent être retirés. Une seule séquence continue de groupes nuls peut être remplacée par ::. Par exemple, 2001:db8:0:0:0:0:0:1 devient 2001:db8::1.",
        },
        {
          title: "Des portées différentes",
          body: "Une adresse link-local, dans fe80::/10, permet de communiquer sur un lien et n’est pas transférée par les routeurs. Les adresses unicast globales sont destinées à la communication routée ; 2001:db8::/32 est réservé à la documentation.",
          bullets: [
            "Il n’existe pas de broadcast IPv6 : le multicast couvre plusieurs de ses usages.",
            "Un préfixe /64 est usuel sur les LAN utilisant SLAAC.",
            "Une interface peut posséder plusieurs adresses IPv6.",
          ],
        },
        {
          title: "NDP et autoconfiguration",
          body: "Neighbor Discovery utilise ICMPv6 pour découvrir les voisins et les routeurs. SLAAC permet à un hôte de former une adresse à partir des annonces de routeur. DHCPv6 peut fournir une adresse ou d’autres paramètres ; la route par défaut est généralement apprise par les annonces de routeur.",
        },
      ],
      "IPv6 utilise NDP/ICMPv6 pour les voisins et ne possède pas de broadcast.",
      [
        [
          "Quelle est la taille d’une adresse IPv6 ?",
          "128 bits",
          ["32 bits", "48 bits", "64 bits"],
          "Huit groupes de 16 bits forment une adresse de 128 bits.",
        ],
        [
          "Combien de fois peut-on utiliser :: dans une même adresse ?",
          "Une seule fois",
          ["Deux fois", "Autant que nécessaire", "Jamais"],
          "Sinon on ne pourrait pas déterminer combien de groupes nuls chaque occurrence remplace.",
        ],
        [
          "Quel mécanisme remplit en IPv6 le rôle de résolution de voisins ?",
          "NDP via ICMPv6",
          ["ARP via broadcast", "DNS uniquement", "NAT44"],
          "Les messages Neighbor Solicitation et Neighbor Advertisement participent à cette résolution.",
        ],
        [
          "Quelle adresse a une portée limitée au lien ?",
          "fe80::1",
          ["2001:db8::1", "8.8.8.8", "192.168.1.1"],
          "fe80::/10 désigne les adresses IPv6 link-local ; les deux derniers choix sont IPv4.",
        ],
      ],
      [
        "Explique comment un poste IPv6 peut obtenir une adresse et une route par défaut sans serveur DHCPv6.",
        "Le poste génère une adresse link-local et vérifie son unicité. Il reçoit ou sollicite une annonce de routeur. Si le préfixe annoncé autorise l’autoconfiguration, SLAAC permet de former une adresse globale ; le poste en vérifie aussi l’unicité. L’annonce identifie un routeur utilisable comme passerelle par défaut.",
        [
          "Adresse link-local",
          "Annonces de routeur ICMPv6",
          "SLAAC et préfixe annoncé",
          "Détection de doublon et route par défaut",
        ],
      ],
    ),
    c(
      "c1-services",
      "Transport & services réseau",
      "TCP, UDP, DNS, DHCP et les premiers diagnostics.",
      12,
      [
        {
          title: "TCP et UDP : deux approches",
          body: "TCP établit une connexion, ordonne les octets et utilise acquittements et retransmissions. UDP envoie des datagrammes sans garantir leur livraison ni leur ordre. Une application utilisant UDP peut ajouter ses propres mécanismes de fiabilité, comme le fait QUIC.",
        },
        {
          title: "Les services à connaître",
          body: "DNS résout des noms et d’autres informations via des enregistrements. DHCPv4 fournit une configuration réseau pour une durée appelée bail. HTTP transporte les échanges web ; HTTPS ajoute la protection de TLS.",
          bullets: [
            "SSH : TCP 22. DNS : UDP ou TCP 53.",
            "DHCPv4 : UDP 67 (serveur) et 68 (client).",
            "HTTP classique : TCP 80 ; HTTPS : généralement 443 (HTTP/3 utilise QUIC sur UDP).",
          ],
        },
        {
          title: "Diagnostiquer par étapes",
          body: "Vérifie l’interface et la configuration IP, puis la passerelle, une destination distante et enfin le nom DNS. Un ping teste ICMP ; il ne prouve pas à lui seul qu’un service HTTP fonctionne. Un pare-feu peut filtrer ICMP sans bloquer le service.",
          code: "ping 192.168.1.1\nnslookup example.com\ntracert example.com",
        },
      ],
      "IP joint la machine ; les ports permettent d’atteindre le service.",
      [
        [
          "Quel mécanisme est propre au service TCP ?",
          "La retransmission des données non acquittées",
          [
            "La résolution de noms",
            "L’attribution d’une adresse IP",
            "Le chiffrement obligatoire",
          ],
          "TCP fournit un flux d’octets fiable, sans imposer le chiffrement.",
        ],
        [
          "Quel port est associé au service DNS ?",
          "53",
          ["22", "67", "80"],
          "DNS peut employer UDP ou TCP sur le port 53.",
        ],
        [
          "Une IP distante répond mais son nom ne fonctionne pas. Que vérifier ?",
          "La résolution DNS",
          [
            "Le câble du serveur obligatoirement",
            "La taille d’écran",
            "Le numéro de série du switch",
          ],
          "La connectivité IP semble disponible ; il faut vérifier le résolveur et les enregistrements.",
        ],
        [
          "Qu’apporte DHCPv4 ?",
          "Une configuration IP louée pour une durée",
          [
            "Une adresse MAC permanente",
            "Le chiffrement de tous les flux",
            "Un routage dynamique entre routeurs",
          ],
          "Le bail peut inclure IP, masque, passerelle et serveurs DNS.",
        ],
      ],
      [
        "Un utilisateur dit : « Internet ne marche plus ». Propose une démarche permettant de distinguer liaison, adressage, routage, DNS et service web.",
        "Vérifier l’état de l’interface et le lien, puis l’IP, le masque et la passerelle. Tester la passerelle puis une IP distante, en tenant compte du filtrage ICMP. Interroger le DNS et comparer un accès par nom. Enfin tester le service HTTPS lui-même : un ping réussi ne valide pas le service applicatif.",
        [
          "État du lien et interface",
          "Configuration IP et passerelle",
          "Tests routage puis DNS",
          "Test applicatif distinct du ping",
        ],
      ],
    ),
  ],
};
