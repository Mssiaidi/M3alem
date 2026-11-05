# M3alem Marketplace

M3alem est une marketplace dédiée à l’artisanat marocain. Elle permet aux clients de découvrir des produits, aux vendeurs de gérer leur boutique et aux administrateurs de superviser la plateforme.

## Fonctionnalités

- **Clients** : inscription et connexion, catalogue et catégories, fiches produits et boutiques, panier, commandes, avis et messagerie.
- **Vendeurs** : gestion de la boutique et des documents de vérification, gestion des produits et des stocks, suivi des commandes, messagerie et tableau de bord.
- **Administrateurs** : gestion des utilisateurs et catégories, validation ou suspension des boutiques, suivi des commandes, modération des avis, messagerie et tableau de bord.
- Authentification de l’API par jetons Laravel Sanctum et notifications internes.

## Technologies

| Partie | Technologies |
| --- | --- |
| API | PHP 8.2+, Laravel 12, Laravel Sanctum 4 |
| Interface | React 19, Vite 8, Tailwind CSS 4 |
| Base de données | SQLite par défaut ; configuration MySQL disponible |
| Outils | Composer, npm, PHPUnit, ESLint |

## Structure du projet

```text
M3alem/
├── Backend_M3ALAM/
│   ├── app/                  # Modèles, contrôleurs et logique métier
│   ├── database/             # Migrations, factories et seeders
│   ├── routes/api.php        # Routes de l’API
│   ├── tests/                # Tests Laravel
│   └── frontend_M3ALAM/
│       └── src/              # Application React et services API
└── WEB_Statique/              # Maquettes HTML
```

## Prérequis

- PHP **8.2 ou supérieur**, avec les extensions requises par Laravel et le pilote de la base choisie (`pdo_sqlite` pour SQLite).
- Composer.
- Node.js **20.19+ dans la branche 20**, ou **22.12+**, et npm, conformément aux exigences de Vite installé dans le projet.
- MySQL uniquement si vous choisissez de remplacer SQLite.

## Installation locale

Exécuter les commandes depuis la racine du dépôt. Les commandes ci-dessous utilisent PowerShell.

### 1. Préparer l’API

```powershell
cd Backend_M3ALAM
composer install
```

Si le fichier `.env` n’existe pas encore, le créer :

```powershell
Copy-Item .env.example .env
```

Dans `.env`, renseigner notamment :

```dotenv
APP_NAME=M3alem
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=sqlite
```

Créer le fichier SQLite s’il n’existe pas, puis initialiser l’application :

```powershell
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

`DatabaseSeeder` exécute `PageSeeder` et `MarketplaceSeeder` : pages, comptes de test, catégories, boutiques, produits, panier, commandes et avis de démonstration.

Pour utiliser **MySQL**, créer d’abord une base puis remplacer la configuration SQLite dans `.env` par les valeurs adaptées :

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=m3alem
DB_USERNAME=root
DB_PASSWORD=
```

Exécuter ensuite `php artisan config:clear` puis `php artisan migrate --seed` sur cette base.

### 2. Démarrer l’API

Depuis `Backend_M3ALAM` :

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

L’API est disponible sur **http://127.0.0.1:8000/api**. La page racine de Laravel n’est pas l’interface React.

### 3. Installer et démarrer l’interface

Dans un second terminal, depuis la racine du dépôt :

```powershell
cd Backend_M3ALAM/frontend_M3ALAM
npm install
npm run dev -- --host 127.0.0.1
```

Ouvrir l’adresse affichée par Vite, généralement **http://127.0.0.1:5173**.

Le frontend utilise `/api` par défaut. Le proxy de développement Vite redirige ces requêtes vers `http://127.0.0.1:8000`, sans configuration supplémentaire. Si nécessaire, un fichier `.env.local` dans `frontend_M3ALAM` peut définir `VITE_API_URL`. Redémarrer Vite après toute modification de ses variables d’environnement.

## Comptes de test

Les comptes suivants sont créés par `php artisan migrate --seed`.

**Mot de passe commun : `password`**

| Rôle | Adresse e-mail |
| --- | --- |
| Administrateur | `admin@m3alem.test` |
| Client | `client@m3alem.test` |
| Client | `client.casablanca@m3alem.test` |
| Client | `client.rabat@m3alem.test` |
| Client | `client.fes@m3alem.test` |
| Client | `client.marrakech@m3alem.test` |
| Client | `client.tanger@m3alem.test` |
| Client | `client.agadir@m3alem.test` |
| Vendeur — Atelier Atlas | `seller@m3alem.test` |
| Vendeur — Studio Safi | `seller.safi@m3alem.test` |
| Vendeur — Maison Taznakht | `seller.taznakht@m3alem.test` |
| Vendeur — Dar Cuivre | `seller.cuivre@m3alem.test` |

Les clients Fès et Tanger ont le statut `pending` dans le seeder ; la connexion des clients reste autorisée avec ce statut. Les quatre boutiques de démonstration sont approuvées. Ces identifiants sont destinés à l’environnement de démonstration local.

## Vérifications et compilation

Tests du backend, depuis `Backend_M3ALAM` :

```powershell
composer test
```

Analyse et compilation du frontend, depuis `Backend_M3ALAM/frontend_M3ALAM` :

```powershell
npm run lint
npm run build
```

La compilation produit le dossier `dist/`. Pour prévisualiser cette compilation localement, définir `VITE_API_URL` vers une API accessible avant la compilation, puis utiliser `npm run preview`. Le proxy `/api` décrit plus haut est configuré pour le serveur de développement.

## Repères API

Toutes les routes ci-dessous ont le préfixe `/api`.

| Usage | Routes principales |
| --- | --- |
| Authentification | `POST /register`, `POST /login`, `POST /logout`, `GET /user` |
| Catalogue public | `GET /categories`, `GET /products`, `GET /products/{slug}`, `GET /shops/{slug}` |
| Pages | `GET /pages`, `GET /pages/{slug}` |
| Panier et commandes | `/cart`, `/cart/items`, `POST /checkout`, `GET /orders` |
| Espace vendeur | `/seller/shop`, `/seller/products`, `/seller/orders`, `/seller/dashboard` |
| Administration | `/admin/users`, `/admin/categories`, `/admin/shops/pending`, `/admin/dashboard` |

Les routes protégées nécessitent un en-tête `Authorization: Bearer <token>`. Le token est renvoyé à la connexion ou à l’inscription et géré par les services du frontend. La liste complète des routes se trouve dans [routes/api.php](Backend_M3ALAM/routes/api.php).

## Dépannage

- **Erreur de connexion à l’API** : vérifier que Laravel fonctionne sur le port `8000` et que le frontend est lancé depuis `frontend_M3ALAM`.
- **Base SQLite introuvable** : vérifier la présence de `Backend_M3ALAM/database/database.sqlite` et la configuration `DB_CONNECTION`.
- **Comptes ou produits absents** : vérifier que les seeders ont été exécutés sur la base utilisée. `php artisan db:seed` recharge les données de démonstration, mais réinitialise aussi certains paniers, commandes et avis de test.
- **Configuration Laravel non prise en compte** : exécuter `php artisan config:clear`.
- **Images de démonstration indisponibles** : certaines images du seeder sont hébergées sur des sites externes et nécessitent une connexion Internet.
