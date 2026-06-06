<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@m3alem.test'],
            ['name' => 'Admin M3alem', 'role' => 'admin', 'password' => Hash::make('password')]
        );

        $client = User::updateOrCreate(
            ['email' => 'client@m3alem.test'],
            ['name' => 'Client M3alem', 'role' => 'client', 'password' => Hash::make('password')]
        );

        $seller = User::updateOrCreate(
            ['email' => 'seller@m3alem.test'],
            ['name' => 'Vendeur M3alem', 'role' => 'seller', 'password' => Hash::make('password')]
        );

        $reviewClients = collect([
            ['name' => 'Client Casablanca', 'email' => 'client.casablanca@m3alem.test'],
            ['name' => 'Client Rabat', 'email' => 'client.rabat@m3alem.test'],
            ['name' => 'Client Fes', 'email' => 'client.fes@m3alem.test'],
            ['name' => 'Client Marrakech', 'email' => 'client.marrakech@m3alem.test'],
            ['name' => 'Client Tanger', 'email' => 'client.tanger@m3alem.test'],
            ['name' => 'Client Agadir', 'email' => 'client.agadir@m3alem.test'],
        ])->map(fn (array $reviewClient) => User::updateOrCreate(
            ['email' => $reviewClient['email']],
            ['name' => $reviewClient['name'], 'role' => 'client', 'password' => Hash::make('password')]
        ));

        $categories = collect([
            ['name' => 'Ceramique & Poterie', 'description' => 'Pieces traditionnelles de Safi et Fes.'],
            ['name' => 'Maroquinerie', 'description' => 'Articles en cuir faits main.'],
            ['name' => 'Tapis & Tissage', 'description' => 'Textiles artisanaux marocains.'],
            ['name' => 'Dinanderie & Cuivre', 'description' => 'Objets decoratifs en metal travaille.'],
        ])->map(fn (array $category) => Category::updateOrCreate(
            ['slug' => Str::slug($category['name'])],
            [...$category, 'is_active' => true]
        ));

        $shop = Shop::updateOrCreate(
            ['user_id' => $seller->id],
            [
                'name' => 'Atelier Atlas',
                'slug' => 'atelier-atlas',
                'description' => 'Boutique artisanale de demonstration pour M3alem Marketplace.',
                'city' => 'Marrakech',
                'status' => 'approved',
                'approved_at' => now(),
            ]
        );

        $sellerShops = collect([
            'atelier-atlas' => [
                'seller' => $seller,
                'shop' => $shop,
            ],
            'studio-safi' => [
                'seller' => User::updateOrCreate(
                    ['email' => 'seller.safi@m3alem.test'],
                    ['name' => 'Vendeur Studio Safi', 'role' => 'seller', 'password' => Hash::make('password')]
                ),
                'shop' => null,
                'name' => 'Studio Safi',
                'description' => 'Atelier specialise dans la ceramique et la poterie de Safi.',
                'city' => 'Safi',
            ],
            'maison-taznakht' => [
                'seller' => User::updateOrCreate(
                    ['email' => 'seller.taznakht@m3alem.test'],
                    ['name' => 'Vendeur Maison Taznakht', 'role' => 'seller', 'password' => Hash::make('password')]
                ),
                'shop' => null,
                'name' => 'Maison Taznakht',
                'description' => 'Cooperative textile autour des tapis et tissages amazighs.',
                'city' => 'Ouarzazate',
            ],
            'dar-cuivre' => [
                'seller' => User::updateOrCreate(
                    ['email' => 'seller.cuivre@m3alem.test'],
                    ['name' => 'Vendeur Dar Cuivre', 'role' => 'seller', 'password' => Hash::make('password')]
                ),
                'shop' => null,
                'name' => 'Dar Cuivre',
                'description' => 'Atelier de dinanderie et objets marteles faits main.',
                'city' => 'Fes',
            ],
        ])->map(function (array $entry, string $slug) {
            if ($entry['shop']) {
                return $entry['shop'];
            }

            return Shop::updateOrCreate(
                ['user_id' => $entry['seller']->id],
                [
                    'name' => $entry['name'],
                    'slug' => $slug,
                    'description' => $entry['description'],
                    'city' => $entry['city'],
                    'status' => 'approved',
                    'approved_at' => now(),
                ]
            );
        });

        $products = [
            [
                'name' => 'Tajine Decoratif Bleu Royal',
                'price' => 450,
                'stock' => 12,
                'category' => 0,
                'shop' => 'studio-safi',
                'image' => 'https://i.etsystatic.com/64996062/r/il/13ea91/7908385101/il_fullxfull.7908385101_7c9j.jpg',
                'images' => [
                    'https://i.etsystatic.com/64996062/r/il/13ea91/7908385101/il_fullxfull.7908385101_7c9j.jpg',
                    'https://i.etsystatic.com/23906065/r/il/0ad703/7914525613/il_fullxfull.7914525613_nm1k.jpg',
                    'https://i.etsystatic.com/35326335/r/il/103d33/6422045684/il_fullxfull.6422045684_him9.jpg'
                ],
            ],
            [
                'name' => 'Babouches Artisanales Safi',
                'price' => 280,
                'stock' => 20,
                'category' => 1,
                'shop' => 'atelier-atlas',
                'image' => 'https://en.artisanat-shop.com/cdn/shop/files/berbere-femme_0003_rouge-main.jpg?v=1724478558',
                'images' => [
                    'https://en.artisanat-shop.com/cdn/shop/files/berbere-femme_0003_rouge-main.jpg?v=1724478558',
                    'https://i.etsystatic.com/16387334/r/il/621c5b/7074522022/il_fullxfull.7074522022_ptsc.jpg',
                ],
            ],
            [
                'name' => 'Tapis Atlas Tisse Main',
                'price' => 1200,
                'stock' => 5,
                'category' => 2,
                'shop' => 'maison-taznakht',
                'image' => 'https://cooparttissagetam.com/wp-content/uploads/2023/11/1.jpg',
                'images' => [
                    'https://cooparttissagetam.com/wp-content/uploads/2023/11/1.jpg',
                    'https://cooparttissagetam.com/wp-content/uploads/2023/11/2.jpg',
                ],
            ],
            [
                'name' => 'Miroir en Cuivre Martelle',
                'price' => 900,
                'stock' => 7,
                'category' => 3,
                'shop' => 'dar-cuivre',
                'image' => 'https://cdn20.pamono.com/p/s/9/2/923240_sg6bbjmw15/miroir-rond-en-cuivre-martele.jpg',
            ],
            [
                'name' => 'Vase Ondule Azur',
                'price' => 320,
                'stock' => 14,
                'category' => 0,
                'shop' => 'studio-safi',
                'image' => 'https://jadnart.com/cdn/shop/files/vase-ceramique-azur-collection-heritage-jadnart-01.webp?v=1744105426&width=1445',
            ],
            [
                'name' => 'Coupe en Laiton Martele',
                'price' => 180,
                'stock' => 18,
                'category' => 3,
                'shop' => 'dar-cuivre',
                'image' => 'https://i.etsystatic.com/29094797/r/il/1f15c4/7524192506/il_570xN.7524192506_mvx9.jpg',
            ],
            [
                'name' => 'Verres Ambre Souffles',
                'price' => 240,
                'stock' => 16,
                'category' => 0,
                'shop' => 'studio-safi',
                'image' => 'https://www.eniamor.com/wp-content/uploads/2018/12/verres-beldi-eniamor-2.png',
            ],
            [
                'name' => 'Carnet en Cuir Atlas',
                'price' => 150,
                'stock' => 25,
                'category' => 1,
                'shop' => 'atelier-atlas',
                'image' => 'https://prod.isg.bruneau.media/asset/aHR0cHM6Ly9jb3JwLmJydW5lYXUubWVkaWEvcGFydG5lcnMvUXVhbnRvcmUvMTQzNDk3NnAxLnBuZw==/?height=477&quality=85&width=477',
            ],
        ];

        $createdProducts = collect();

        foreach ($products as $index => $item) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'shop_id' => $sellerShops[$item['shop']]->id,
                    'category_id' => $categories[$item['category']]->id,
                    'name' => $item['name'],
                    'description' => 'Produit artisanal marocain ajoute comme donnee de test.',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'is_active' => true,
                ]
            );

            foreach ($item['images'] ?? [$item['image']] as $imageIndex => $image) {
                $product->images()->updateOrCreate(
                    ['position' => $imageIndex + 1],
                    [
                        'path' => $image,
                        'alt_text' => $item['name'],
                    ]
                );
            }

            $createdProducts->push($product);
        }

        $order = $client->orders()->firstOrCreate(
            ['reference' => 'ORD-DEMO-0001'],
            [
                'status' => 'delivered',
                'total_amount' => 450,
                'customer_name' => $client->name,
                'customer_phone' => '0600000000',
                'shipping_city' => 'Casablanca',
                'shipping_address' => 'Adresse demo M3alem',
                'notes' => 'Commande de demonstration.',
            ]
        );

        if ($order->items()->doesntExist()) {
            $product = Product::query()->where('slug', 'tajine-decoratif-bleu-royal')->first();

            $order->items()->create([
                'product_id' => $product->id,
                'shop_id' => $product->shop_id,
                'product_name' => $product->name,
                'quantity' => 1,
                'unit_price' => $product->price,
                'total_price' => $product->price,
            ]);
        }

        $ratings = [
            'tajine-decoratif-bleu-royal' => [5, 4, 4],
            'babouches-artisanales-safi' => [3, 4, 4],
            'tapis-atlas-tisse-main' => [5, 5, 5],
            'miroir-en-cuivre-martelle' => [4, 3, 4],
            'vase-ondule-azur' => [5, 5, 4],
            'coupe-en-laiton-martele' => [3, 3, 4],
            'verres-ambre-souffles' => [5, 4, 5],
            'carnet-en-cuir-atlas' => [4, 4, 3],
        ];

        Order::query()
            ->where('reference', 'like', 'ORD-REVIEW-%')
            ->delete();

        $createdProducts->each(function (Product $product, int $productIndex) use ($reviewClients, $ratings): void {
            foreach ($ratings[$product->slug] ?? [5] as $index => $rating) {
                $reviewClient = $reviewClients[($productIndex + $index) % $reviewClients->count()];
                $reference = 'ORD-REVIEW-' . strtoupper($product->slug) . '-' . ($index + 1);

                $reviewOrder = $reviewClient->orders()->updateOrCreate(
                    ['reference' => $reference],
                    [
                        'status' => 'delivered',
                        'total_amount' => $product->price,
                        'customer_name' => $reviewClient->name,
                        'customer_phone' => '0600000000',
                        'shipping_city' => ['Casablanca', 'Rabat', 'Fes'][$index % 3],
                        'shipping_address' => 'Adresse demo avis M3alem',
                        'notes' => 'Commande livree utilisee pour calculer les avis.',
                    ]
                );

                $reviewOrder->items()->updateOrCreate(
                    ['product_id' => $product->id],
                    [
                        'shop_id' => $product->shop_id,
                        'product_name' => $product->name,
                        'quantity' => 1,
                        'unit_price' => $product->price,
                        'total_price' => $product->price,
                    ]
                );

                Review::updateOrCreate(
                    [
                        'user_id' => $reviewClient->id,
                        'order_id' => $reviewOrder->id,
                    ],
                    [
                        'rating' => $rating,
                        'comment' => 'Avis demo pour ' . $product->name,
                    ]
                );
            }
        });

        unset($admin);
    }
}
