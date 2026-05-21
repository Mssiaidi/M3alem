<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
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

        $products = [
            [
                'name' => 'Tajine Decoratif Bleu Royal',
                'price' => 450,
                'stock' => 12,
                'category' => 0,
                'image' => 'https://i.etsystatic.com/64996062/r/il/13ea91/7908385101/il_fullxfull.7908385101_7c9j.jpg',
            ],
            [
                'name' => 'Babouches Artisanales Safi',
                'price' => 280,
                'stock' => 20,
                'category' => 1,
                'image' => 'https://en.artisanat-shop.com/cdn/shop/files/berbere-femme_0003_rouge-main.jpg?v=1724478558',
            ],
            [
                'name' => 'Tapis Atlas Tisse Main',
                'price' => 1200,
                'stock' => 5,
                'category' => 2,
                'image' => 'https://cooparttissagetam.com/wp-content/uploads/2023/11/1.jpg',
            ],
            [
                'name' => 'Miroir en Cuivre Martelle',
                'price' => 900,
                'stock' => 7,
                'category' => 3,
                'image' => 'https://cdn20.pamono.com/p/s/9/2/923240_sg6bbjmw15/miroir-rond-en-cuivre-martele.jpg',
            ],
        ];

        foreach ($products as $index => $item) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'shop_id' => $shop->id,
                    'category_id' => $categories[$item['category']]->id,
                    'name' => $item['name'],
                    'description' => 'Produit artisanal marocain ajoute comme donnee de test.',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'is_active' => true,
                ]
            );

            $product->images()->updateOrCreate(
                ['position' => 1],
                [
                    'path' => $item['image'],
                    'alt_text' => $item['name'],
                ]
            );
        }

        $order = $client->orders()->firstOrCreate(
            ['reference' => 'ORD-DEMO-0001'],
            [
                'status' => 'pending',
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

        unset($admin);
    }
}
