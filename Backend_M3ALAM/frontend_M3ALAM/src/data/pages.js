export const pageCatalog = [
  { slug: 'accueil', title: 'Accueil', summary: 'Hero, categories, produits en vedette et spotlight artisans.' },
  { slug: 'catalogue', title: 'Catalogue', summary: 'Filtres, tri et grille produits artisanale.' },
  { slug: 'connexion', title: 'Connexion', summary: 'Formulaire de connexion du portail artisan.' },
  { slug: 'inscription', title: 'Inscription', summary: 'Creation de compte client ou vendeur.' },
  { slug: 'dashboard-admin', title: 'Dashboard Admin', summary: 'Pilotage admin, performances et alertes moderation.' },
  { slug: 'dashboard-vendeur', title: 'Dashboard Vendeur', summary: 'Vue vendeur des ventes, commandes et documents.' },
  { slug: 'detail-boutique', title: 'Detail Boutique', summary: 'Profil boutique, a propos et produits associes.' },
  { slug: 'detail-commande', title: 'Detail Commande', summary: 'Articles commandes, livraison et paiement.' },
  { slug: 'detail-produit', title: 'Detail Produit', summary: 'Fiche produit, variantes, artisan et avis clients.' },
  { slug: 'gestion-boutique', title: 'Gestion Boutique', summary: 'Edition article et apercu storefront.' },
  { slug: 'gestion-categories', title: 'Gestion Categories', summary: 'Administration des categories produits.' },
  { slug: 'mes-commandes', title: 'Mes Commandes', summary: 'Historique, filtrage et export des commandes.' },
  { slug: 'mes-produits-vendeur', title: 'Mes Produits Vendeur', summary: 'Inventaire vendeur, stats et actions produit.' },
  { slug: 'moderation-avis', title: 'Moderation Avis', summary: 'File de moderation des avis et signalements.' },
  { slug: 'moderation-boutiques', title: 'Moderation Boutiques', summary: 'Validation et decisions sur les boutiques.' },
  { slug: 'nouveau-produit', title: 'Nouveau Produit', summary: 'Formulaire de creation et publication produit.' },
  { slug: 'panier-client', title: 'Panier Client', summary: 'Panier, code promo et finalisation commande.' },
]

export const pageBySlug = Object.fromEntries(pageCatalog.map((page) => [page.slug, page]))
