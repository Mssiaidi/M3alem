<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Accueil',
                'slug' => 'accueil',
                'content' => "<h2>Accueil</h2><p>Point d'entree de la plateforme M3ALEM.</p>",
            ],
            [
                'title' => 'Catalogue',
                'slug' => 'catalogue',
                'content' => '<h2>Catalogue</h2><p>Liste des produits, boutiques et services.</p>',
            ],
            [
                'title' => 'Connexion',
                'slug' => 'connexion',
                'content' => "<h2>Connexion</h2><p>Page d'authentification pour les utilisateurs.</p>",
            ],
            [
                'title' => 'Inscription',
                'slug' => 'inscription',
                'content' => '<h2>Inscription</h2><p>Creation de compte client, vendeur ou administrateur.</p>',
            ],
            [
                'title' => 'Dashboard Admin',
                'slug' => 'dashboard-admin',
                'content' => '<h2>Dashboard Admin</h2><p>Tableau de bord et actions de moderation.</p>',
            ],
            [
                'title' => 'Gestion Categories',
                'slug' => 'gestion-categories',
                'content' => '<h2>Gestion Categories</h2><p>Administration des categories produits.</p>',
            ],
            [
                'title' => 'Moderation Boutiques',
                'slug' => 'moderation-boutiques',
                'content' => '<h2>Moderation Boutiques</h2><p>Validation et decisions sur les boutiques.</p>',
            ],
            [
                'title' => 'Moderation Avis',
                'slug' => 'moderation-avis',
                'content' => '<h2>Moderation Avis</h2><p>File de moderation des avis et signalements.</p>',
            ],
            [
                'title' => 'Dashboard Vendeur',
                'slug' => 'dashboard-vendeur',
                'content' => '<h2>Dashboard Vendeur</h2><p>Suivi des produits, commandes et boutique.</p>',
            ],
            [
                'title' => 'Detail Boutique',
                'slug' => 'detail-boutique',
                'content' => '<h2>Detail Boutique</h2><p>Profil boutique, presentation et produits associes.</p>',
            ],
            [
                'title' => 'Detail Commande',
                'slug' => 'detail-commande',
                'content' => '<h2>Detail Commande</h2><p>Detail des articles, livraison et resume de paiement.</p>',
            ],
            [
                'title' => 'Detail Produit',
                'slug' => 'detail-produit',
                'content' => '<h2>Detail Produit</h2><p>Fiche produit, artisan et avis clients.</p>',
            ],
            [
                'title' => 'Gestion Boutique',
                'slug' => 'gestion-boutique',
                'content' => '<h2>Gestion Boutique</h2><p>Edition produit et apercu storefront.</p>',
            ],
            [
                'title' => 'Mes Commandes',
                'slug' => 'mes-commandes',
                'content' => '<h2>Mes Commandes</h2><p>Historique, filtrage et export des commandes.</p>',
            ],
            [
                'title' => 'Mes Produits Vendeur',
                'slug' => 'mes-produits-vendeur',
                'content' => '<h2>Mes Produits Vendeur</h2><p>Inventaire vendeur, stats et actions produit.</p>',
            ],
            [
                'title' => 'Nouveau Produit',
                'slug' => 'nouveau-produit',
                'content' => '<h2>Nouveau Produit</h2><p>Formulaire de creation et publication produit.</p>',
            ],
            [
                'title' => 'Panier Client',
                'slug' => 'panier-client',
                'content' => '<h2>Panier Client</h2><p>Panier, code promo et finalisation commande.</p>',
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }
}
