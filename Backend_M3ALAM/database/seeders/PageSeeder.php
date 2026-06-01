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
                'content' => '<h1>M3alem Marketplace</h1><p>Le secteur de l\'artisanat au Maroc constitue un patrimoine économique et culturel d\'une grande richesse. Pourtant, la grande majorité des artisans exercent encore leur activité en dehors de tout espace numérique.</p><h2>L\'objectif du projet</h2><p>L\'objectif principal de ce projet est de concevoir et développer une plateforme e-commerce multi-vendeurs, baptisée M3alem Marketplace, qui donne à chaque artisan un espace boutique en ligne sans coût de création ni compétence technique requise.</p>',
            ],
            [
                'title' => 'Introduction générale',
                'slug' => 'introduction-generale',
                'content' => '<p>La digitalisation des activités économiques n\'est plus une option mais une nécessité. Elle permet d\'élargir la clientèle, de professionnaliser l\'offre et de renforcer la confiance entre prestataires et consommateurs.</p>',
            ],
            [
                'title' => 'Présentation du projet',
                'slug' => 'presentation-du-projet',
                'content' => '<h3>Contexte et état des lieux</h3><p>Le secteur de l\'artisanat et des micro-services au Maroc représente un pilier économique et culturel majeur. Pourtant, des milliers d\'artisans demeurent invisibles dans l\'espace numérique.</p>',
            ],
            [
                'title' => 'Problématique',
                'slug' => 'problematique',
                'content' => '<p>Comment offrir une infrastructure numérique robuste et accessible permettant aux artisans marocains de digitaliser leur offre, tout en garantissant aux clients une expérience d\'achat centralisée, fluide et sécurisée ?</p>',
            ],
            [
                'title' => 'Vision du projet',
                'slug' => 'vision-du-projet',
                'content' => '<p>M3alem Marketplace se positionne comme un "centre commercial digital" entièrement dédié aux artisans marocains. Cette vision repose sur trois piliers fondamentaux : Accessibilité, Centralisation et Confiance numérique.</p>',
            ],
            [
                'title' => 'Objectifs du projet',
                'slug' => 'objectifs-du-projet',
                'content' => '<h4>Objectifs Fonctionnels</h4><ul><li>Gestion complète des utilisateurs (Client, Vendeur, Administrateur)</li><li>Gestion des boutiques et des produits</li><li>Gestion des commandes et du cycle de vie</li><li>Système d\'avis et de notifications</li></ul>',
            ],
            [
                'title' => 'Catalogue',
                'slug' => 'catalogue',
                'content' => '<h2>Catalogue</h2><p>Page publique essentielle. Elle affiche tous les produits avec filtres par catégorie, recherche, pagination.</p>',
            ],
            [
                'title' => 'Détail Produit',
                'slug' => 'detail-produit',
                'content' => '<h2>Détail Produit</h2><p>Le client clique sur un produit et voit : images, prix, stock, boutique, description.</p>',
            ],
            [
                'title' => 'Détail Boutique',
                'slug' => 'detail-boutique',
                'content' => '<h2>Détail Boutique</h2><p>Page publique pour voir une boutique validée + ses produits.</p>',
            ],
            [
                'title' => 'Connexion',
                'slug' => 'connexion',
                'content' => '<h2>Connexion</h2><p>Permet d’accéder aux espaces client/vendeur/admin.</p>',
            ],
            [
                'title' => 'Inscription',
                'slug' => 'inscription',
                'content' => '<h2>Inscription</h2><p>Avec choix du rôle : client ou vendeur.</p>',
            ],
            [
                'title' => 'Panier',
                'slug' => 'panier',
                'content' => '<h2>Panier</h2><p>Le client peut ajouter, modifier ou supprimer des produits avant de passer commande.</p>',
            ],
            [
                'title' => 'Mes commandes',
                'slug' => 'mes-commandes',
                'content' => '<h2>Mes commandes</h2><p>Historique des commandes du client avec leur statut actuel.</p>',
            ],
            [
                'title' => 'Détail commande',
                'slug' => 'detail-commande',
                'content' => '<h2>Détail commande</h2><p>Produits commandés, statut, total, informations de suivi.</p>',
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
                'content' => '<h2>Dashboard Vendeur</h2><p>Vue d\'ensemble des ventes, commandes en attente et produits.</p>',
            ],
            [
                'title' => 'Mes produits vendeurs',
                'slug' => 'mes-produits-vendeur',
                'content' => '<h2>Mes produits vendeurs</h2><p>Gestion du catalogue de produits pour le vendeur.</p>',
            ],
            [
                'title' => 'Gestion boutique',
                'slug' => 'gestion-boutique',
                'content' => '<h2>Gestion boutique</h2><p>Personnalisation de l\'espace boutique de l\'artisan.</p>',
            ],
            [
                'title' => 'Nouveau Produit',
                'slug' => 'nouveau-produit',
                'content' => '<h2>Nouveau Produit</h2><p>Formulaire pour ajouter un nouveau produit au catalogue.</p>',
            ],
            [
                'title' => 'Dashboard Admin',
                'slug' => 'dashboard-admin',
                'content' => '<h2>Dashboard Admin</h2><p>Surveillance globale de la plateforme, statistiques et modération.</p>',
            ],
            [
                'title' => 'Modération Boutiques',
                'slug' => 'moderation-boutiques',
                'content' => '<h2>Modération Boutiques</h2><p>Validation ou suspension des comptes vendeurs.</p>',
            ],
            [
                'title' => 'Gestion Catégories',
                'slug' => 'gestion-categories',
                'content' => '<h2>Gestion Catégories</h2><p>Administration des catégories de produits disponibles sur la plateforme.</p>',
            ],
            [
                'title' => 'Modération Avis',
                'slug' => 'moderation-avis',
                'content' => '<h2>Modération Avis</h2><p>Suppression des avis inappropriés ou non conformes.</p>',
            ],
            [
                'title' => 'Profile',
                'slug' => 'profile',
                'content' => '<h2>Mon Profil</h2><p>Gérez vos informations personnelles et vos paramètres de sécurité.</p>',
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
