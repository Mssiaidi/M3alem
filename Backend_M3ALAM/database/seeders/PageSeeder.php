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
                'title' => 'Dashboard Vendeur',
                'slug' => 'dashboard-vendeur',
                'content' => '<h2>Dashboard Vendeur</h2><p>Suivi des produits, commandes et boutique.</p>',
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
