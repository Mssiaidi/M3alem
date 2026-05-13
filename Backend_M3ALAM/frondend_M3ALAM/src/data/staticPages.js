export const staticPages = {
  accueil: {
    title: 'Accueil',
    kicker: 'Artisanat certifie',
    lead: "L'excellence de l'artisanat marocain a votre portee.",
    actions: [
      { label: 'Explorer les produits', href: '/pages/catalogue', variant: 'button' },
      { label: 'Devenir Exposant', href: '/pages/inscription', variant: 'button--ghost' },
    ],
    heroAside: [
      { label: 'Navigation', value: 'Accueil / Artisans / Ateliers' },
      { label: 'Catalogue', value: 'Produits en vedette' },
      { label: 'Mise en avant', value: 'M3alems certifies' },
    ],
    sectionTitle: "Categories d'Exception",
    cards: [
      { title: 'Ceramique & Poterie', text: "L'art ancestral de Fes et Safi." },
      { title: 'Maroquinerie', text: 'Sacs, accessoires et cuir artisanal.' },
      { title: 'Tapis & Tissage', text: 'Pieces textiles traditionnelles et modernes.' },
      { title: 'Dinanderie & Cuivre', text: 'Objets en metal travailles a la main.' },
    ],
    listTitle: 'Contenu principal',
    list: [
      { title: 'Produits en Vedette', meta: 'Cartes produit + favoris + navigation carousel' },
      { title: 'Voir tout le catalogue', meta: 'Acces rapide vers la page catalogue' },
      { title: 'Rencontrez nos M3alems', meta: 'Bloc de confiance artisans' },
    ],
    sections: [
      { type: 'toolbar', left: ['Accueil', 'Artisans', 'Ateliers'], right: ['shopping_cart', 'notifications'] },
    ],
  },
  catalogue: {
    title: 'Catalogue',
    kicker: 'Produits d\'Exception',
    lead: 'Pieces uniques faconnees a la main par les maitres artisans.',
    heroAside: [
      { label: 'Filtres', value: 'Categories / Prix / Note minimum' },
      { label: 'Categories', value: 'Ceramique, Ebenisterie, Tissage, Bijouterie' },
      { label: 'Tri', value: 'Nouveautes, Prix croissant, Mieux notes' },
    ],
    sectionTitle: 'Produits visibles',
    cards: [
      { title: 'Vase Ondule "Azur"', text: 'Carte produit avec favori et ajout panier.' },
      { title: 'Chaise "Horizon"', text: 'Mise en avant mobilier artisanal premium.' },
      { title: 'Tapisserie "Atlas"', text: 'Produit textile avec CTA direct.' },
    ],
    listTitle: 'Actions catalogue',
    list: [
      { title: 'Appliquer les filtres', meta: 'Validation des criteres de recherche' },
      { title: 'Recherche', meta: 'Champ de recherche artisan/produit' },
      { title: 'Ajout panier', meta: 'Action rapide sur chaque carte' },
    ],
    sections: [
      { type: 'toolbar', left: ['Filtres', 'Categories', 'Prix', 'Note minimum'], right: ['Trier: Nouveautes'] },
    ],
  },
  connexion: {
    title: 'Connexion',
    kicker: 'Portail artisan professionnel',
    lead: 'Authentification via adresse e-mail et mot de passe.',
    heroAside: [
      { label: 'Champs', value: 'Adresse e-mail, Mot de passe' },
      { label: 'Options', value: 'Se souvenir de moi, Mot de passe oublie' },
      { label: 'Suite', value: 'Creer un compte artisan' },
    ],
    cards: [
      { title: 'Se connecter', text: 'CTA principal pour acces compte.' },
      { title: 'Image inspiration', text: "Citation artisanale + bloc qualite certifiee." },
      { title: 'Footer', text: 'Support, Securite, Confidentialite.' },
    ],
    sections: [
      {
        type: 'form',
        title: 'Formulaire de connexion',
        fields: ['Adresse e-mail', 'Mot de passe'],
        actions: ['Se connecter', 'Creer un compte artisan'],
      },
    ],
  },
  inscription: {
    title: 'Inscription',
    kicker: "Rejoignez l'elite de l'artisanat",
    lead: 'Creation de compte vendeur ou client avec validation des informations.',
    heroAside: [
      { label: 'Promesses', value: 'Qualite certifiee, Paiements securises' },
      { label: 'Type de compte', value: 'Vendeur ou Client' },
      { label: 'Validation', value: 'Conditions generales obligatoires' },
    ],
    listTitle: 'Champs formulaire',
    list: [
      { title: 'Prenom / Nom', meta: 'Identite utilisateur' },
      { title: 'Adresse e-mail', meta: 'Contact et connexion' },
      { title: 'Mot de passe', meta: 'Securisation du compte' },
    ],
    cards: [
      { title: 'Creer mon compte', text: 'CTA principal inscription.' },
      { title: 'Continuer avec Google', text: 'Alternative de creation rapide.' },
    ],
    sections: [
      {
        type: 'form',
        title: 'Creation de compte',
        fields: ['Prenom', 'Nom', 'Adresse e-mail', 'Mot de passe'],
        actions: ['Creer mon compte', 'Continuer avec Google'],
      },
    ],
  },
  'dashboard-admin': {
    title: 'Dashboard Admin',
    kicker: 'Artisan Portal',
    lead: 'Pilotage global: performance, notifications et moderation.',
    heroAside: [
      { label: 'CA', value: '$24,500.00' },
      { label: 'Commandes', value: '1,284' },
      { label: 'Alertes', value: '14' },
      { label: 'Score', value: '4.9 / 5.0' },
    ],
    cards: [
      { title: 'Performance Overview', text: 'Vue Day / Week / Month.' },
      { title: 'View All Notifications', text: 'Liste complete des evenements.' },
      { title: 'List New Item', text: 'Ajout rapide depuis la barre haute.' },
    ],
    sections: [
      { type: 'toolbar', left: ['Day', 'Week', 'Month'], right: ['View All Notifications'] },
    ],
  },
  'dashboard-vendeur': {
    title: 'Dashboard Vendeur',
    kicker: 'Artisan Portal',
    lead: 'Suivi vendeur des ventes, produits et note.',
    heroAside: [
      { label: 'Ventes', value: 'EUR4,250' },
      { label: 'Produits', value: '24' },
      { label: 'Note', value: '4.9' },
    ],
    cards: [
      { title: 'Verified Master', text: 'Badge de confiance vendeur.' },
      { title: 'Recent Orders', text: 'Commandes recentes + View All.' },
      { title: 'Upload Documents', text: 'Gestion administrative du profil.' },
    ],
    sections: [
      { type: 'toolbar', left: ['Recent Orders'], right: ['View All', 'Upload Documents'] },
    ],
  },
  'detail-boutique': {
    title: 'Detail Boutique',
    kicker: 'Profil artisan',
    lead: 'Presentation de boutique, informations et catalogue local.',
    heroAside: [
      { label: 'Boutique', value: 'Ahmed El Mansouri' },
      { label: 'Actions', value: 'Contacter, Suivre la Boutique' },
      { label: 'Affichage', value: 'Mode grille et liste' },
    ],
    sectionTitle: 'Produits de la boutique',
    cards: [
      { title: 'Vase Cobalt Traditionnel', text: 'Carte produit avec action favori.' },
      { title: 'Tagine Signature Marrakech', text: 'Produit culinaire artisanal.' },
      { title: "Set d'Assiettes Zellige (x4)", text: 'Ensemble decoratif local.' },
      { title: "Lanterne Terre d'Atlas", text: 'Objet deco metallique.' },
    ],
    listTitle: 'Sections',
    list: [
      { title: 'A propos', meta: "Description de l'artisan et de la boutique" },
      { title: 'Voir plus de produits', meta: 'Navigation vers le catalogue complet boutique' },
    ],
    sections: [
      { type: 'toolbar', left: ['Contacter', 'Suivre la Boutique'], right: ['grid_view', 'list'] },
    ],
  },
  'detail-commande': {
    title: 'Detail Commande',
    kicker: 'Suivi commande',
    lead: 'Detail des articles, livraison et resume de paiement.',
    actions: [
      { label: 'Facture PDF', href: '#', variant: 'button' },
      { label: "Contacter l'Artisan", href: '#', variant: 'button--ghost' },
    ],
    heroAside: [
      { label: 'Articles', value: '3' },
      { label: 'Bloc livraison', value: 'Details Livraison' },
      { label: 'Paiement', value: 'Resume du paiement' },
    ],
    listTitle: 'Articles commandes',
    list: [
      { title: "Sacoche en Cuir Artisanal - Modele 'Atlas'", meta: 'Article principal de commande' },
      { title: 'Coffret a Bijoux en Noyer Sculpte', meta: 'Article complementaire' },
    ],
    sections: [
      { type: 'toolbar', left: ['Facture PDF'], right: ["Contacter l'Artisan"] },
      {
        type: 'rows',
        title: 'Articles commandes (3)',
        items: [
          { title: "Sacoche en Cuir Artisanal - Modele 'Atlas'" },
          { title: 'Coffret a Bijoux en Noyer Sculpte' },
        ],
      },
    ],
  },
  'detail-produit': {
    title: 'Detail Produit',
    kicker: 'Fiche produit',
    lead: 'Page produit avec variantes, description, artisan et avis.',
    heroAside: [
      { label: 'Produit', value: 'Handcrafted Terra Cotta Sculptural Vase' },
      { label: 'Tailles', value: 'Small / Medium / Large' },
      { label: 'Actions', value: 'Add to Cart, Save to Wishlist' },
    ],
    cards: [
      { title: 'Product Description', text: 'Description detaillee du produit.' },
      { title: 'Artisan Details', text: 'Profil createur + View Artisan Portfolio.' },
      { title: 'Customer Reviews', text: 'Write a Review + See all 124 reviews.' },
    ],
    sections: [
      { type: 'toolbar', left: ['Small', 'Medium', 'Large'], right: ['Add to Cart', 'Save to Wishlist'] },
    ],
  },
  'gestion-boutique': {
    title: 'Gestion Boutique',
    kicker: 'Edition article',
    lead: 'Back-office vendeur pour modifier fiche et apercu boutique.',
    heroAside: [
      { label: 'Formulaire', value: 'Nom, Description, Galerie, Prix, Stock' },
      { label: 'Actions', value: 'Annuler, Enregistrer les modifications' },
      { label: 'Apercu', value: 'Voir en ligne' },
    ],
    cards: [
      { title: "Details de l'Article", text: 'Edition complete des donnees produit.' },
      { title: 'Galerie Photos', text: 'Suppression et ajout de visuels.' },
      { title: 'Apercu Boutique', text: 'Carte produit publique avec panier/favori.' },
    ],
    sections: [
      {
        type: 'form',
        title: "Details de l'Article",
        fields: ['Nom du produit', 'Description artisanale', 'Prix', 'Stock'],
        actions: ['Enregistrer les modifications', 'Annuler'],
      },
    ],
  },
  'gestion-categories': {
    title: 'Gestion Categories',
    kicker: 'Administration taxonomie',
    lead: 'Gestion des familles de produits et sections artisanales.',
    actions: [{ label: 'Nouvelle Categorie', href: '#', variant: 'button' }],
    heroAside: [
      { label: 'Categories', value: 'Poterie, Menuiserie, Textiles' },
      { label: 'Actions', value: 'edit / delete par ligne' },
      { label: 'Suite', value: 'Ajouter une nouvelle section' },
    ],
    listTitle: 'Categories existantes',
    list: [
      { title: 'Poterie & Ceramique', meta: 'Editable et supprimable' },
      { title: 'Menuiserie', meta: 'Editable et supprimable' },
      { title: 'Textiles & Tissage', meta: 'Editable et supprimable' },
    ],
    sections: [
      {
        type: 'rows',
        title: 'Gestion des categories',
        items: [
          { title: 'Poterie & Ceramique', actions: ['edit', 'delete'] },
          { title: 'Menuiserie', actions: ['edit', 'delete'] },
          { title: 'Textiles & Tissage', actions: ['edit', 'delete'] },
        ],
      },
    ],
  },
  'mes-commandes': {
    title: 'Mes Commandes',
    kicker: 'Historique des commandes',
    lead: 'Suivi des commandes client avec filtres, export et pagination.',
    heroAside: [
      { label: 'Actions', value: 'Filtrer, Exporter CSV' },
      { label: 'Consultation', value: 'Boutons visibility par ligne' },
      { label: 'Navigation', value: 'Pagination 1,2,3 + menu bas' },
    ],
    cards: [
      { title: 'Orders', text: 'Vue liste avec statut et detail.' },
      { title: 'Items', text: 'Acces rapide aux produits commandes.' },
      { title: 'Profile', text: 'Lien profil depuis navigation basse.' },
    ],
    sections: [
      { type: 'toolbar', left: ['Filtrer'], right: ['Exporter CSV'] },
    ],
  },
  'mes-produits-vendeur': {
    title: 'Mes Produits Vendeur',
    kicker: 'Inventaire des Produits',
    lead: 'Suivi inventaire, revenus et actions produit vendeur.',
    heroAside: [
      { label: 'Produits', value: '42' },
      { label: 'Revenus', value: 'EUR2,840' },
      { label: 'Promotions', value: '05' },
      { label: 'Note', value: '4.9' },
    ],
    listTitle: 'Actions inventaire',
    list: [
      { title: 'Filtres', meta: 'Affinage liste produits' },
      { title: 'Ajouter un produit', meta: 'Creation article' },
      { title: 'Reapprovisionner', meta: 'Gestion stock rapide' },
    ],
    sections: [
      {
        type: 'rows',
        title: 'Inventaire des Produits',
        items: [
          { title: 'Produit 1', actions: ['edit', 'more_vert'] },
          { title: 'Produit 2', actions: ['edit', 'more_vert'] },
          { title: 'Produit 3', actions: ['edit', 'more_vert'] },
        ],
      },
    ],
  },
  'moderation-avis': {
    title: 'Moderation Avis',
    kicker: 'File de Moderation',
    lead: 'Traitement des avis et signalements utilisateurs.',
    heroAside: [
      { label: 'Actions avis', value: "Rejeter / Approuver l'avis" },
      { label: 'Actions signalement', value: 'Supprimer / Ignorer' },
      { label: 'Suivi', value: 'Voir tout le classement' },
    ],
    cards: [
      { title: 'Moderation des Avis', text: 'Ecran de controle des contributions.' },
      { title: 'Notifications', text: 'Alertes de nouveaux contenus a traiter.' },
      { title: 'List New Item', text: 'Acces rapide portail admin.' },
    ],
    sections: [
      {
        type: 'rows',
        title: 'File de Moderation',
        items: [
          { title: 'Avis signale #1', actions: ['Rejeter', "Approuver l'avis"] },
          { title: 'Signalement #1', actions: ["Supprimer l'avis", 'Ignorer le signalement'] },
        ],
      },
    ],
  },
  'moderation-boutiques': {
    title: 'Moderation Boutiques',
    kicker: 'Validation boutiques',
    lead: 'Revue des boutiques avec decisions de moderation.',
    heroAside: [
      { label: 'Actions globales', value: 'Filtrer, Exporter Rapport' },
      { label: 'Actions ligne', value: 'Consulter, Approuver, Rejeter, Examiner' },
      { label: 'Pagination', value: 'Pages 1,2,3' },
    ],
    listTitle: 'Files de moderation',
    list: [
      { title: 'Dossier 1', meta: 'Consulter puis Approuver' },
      { title: 'Dossier 2', meta: 'Consulter puis Approuver' },
      { title: 'Dossier 3', meta: 'Examiner puis Rejeter' },
    ],
    sections: [
      { type: 'toolbar', left: ['Filtrer'], right: ['Exporter Rapport'] },
      {
        type: 'rows',
        title: 'Files de moderation',
        items: [
          { title: 'Boutique A', actions: ['Consulter', 'Approuver'] },
          { title: 'Boutique B', actions: ['Consulter', 'Approuver'] },
          { title: 'Boutique C', actions: ['Examiner', 'Rejeter'] },
        ],
      },
    ],
  },
  'nouveau-produit': {
    title: 'Nouveau Produit',
    kicker: "Creation d'Artisanat",
    lead: 'Formulaire de publication produit avec qualite et galerie.',
    heroAside: [
      { label: 'Champs', value: 'Nom, Description, Prix(MAD), Stock' },
      { label: 'Qualite', value: 'Estimation Qualite' },
      { label: 'Categories', value: 'Poterie, Cuir, Tissage, Bois' },
    ],
    cards: [
      { title: 'Informations Generales', text: 'Base descriptive de la creation.' },
      { title: 'Galerie Images', text: 'Ajout/suppression de photos produit.' },
      { title: 'Publication', text: 'Annuler, Brouillon, Publier le Produit.' },
    ],
    sections: [
      {
        type: 'form',
        title: "Creation d'Artisanat",
        fields: ['Nom de la Creation', "Description de l'Artisanat", 'Prix (MAD)', 'Stock Disponible'],
        actions: ['Publier le Produit', 'Enregistrer comme brouillon'],
      },
    ],
  },
  'panier-client': {
    title: 'Panier Client',
    kicker: 'Votre Panier',
    lead: 'Gestion des quantites, code promo et paiement final.',
    heroAside: [
      { label: 'Articles', value: 'Bol emaille, Plateau noyer, Sacoche cuir' },
      { label: 'Quantites', value: 'Actions remove/add par ligne' },
      { label: 'Finalisation', value: 'Code Promo + Payer la commande' },
    ],
    listTitle: 'Lignes panier',
    list: [
      { title: 'Bol en Ceramique Emaille', meta: 'Modifier quantite ou supprimer' },
      { title: 'Plateau en Noyer Massif', meta: 'Modifier quantite ou supprimer' },
      { title: 'Sacoche Cuir Tannage Vegetal', meta: 'Modifier quantite ou supprimer' },
    ],
    cards: [
      { title: 'Vous pourriez aussi aimer', text: 'Tapis Tisse Main avec ajout panier rapide.' },
    ],
    sections: [
      {
        type: 'rows',
        title: 'Votre Panier',
        items: [
          { title: 'Bol en Ceramique Emaille', actions: ['remove', 'add', 'Supprimer'] },
          { title: 'Plateau en Noyer Massif', actions: ['remove', 'add', 'Supprimer'] },
          { title: 'Sacoche Cuir Tannage Vegetal', actions: ['remove', 'add', 'Supprimer'] },
        ],
      },
      { type: 'toolbar', left: ['Code Promo', 'Appliquer'], right: ['Payer la commande'] },
    ],
  },
}
