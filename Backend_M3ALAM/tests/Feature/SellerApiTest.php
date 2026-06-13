<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_can_create_shop(): void
    {
        $seller = User::factory()->seller()->create();

        $this->actingAs($seller, 'sanctum')
            ->postJson('/api/seller/shop', [
                'name' => 'Atelier Test',
                'description' => 'Boutique test',
                'city' => 'Fes',
            ])
            ->assertCreated()
            ->assertJsonFragment(['status' => 'pending']);
    }

    public function test_approved_seller_can_create_product(): void
    {
        $seller = User::factory()->seller()->create();
        $shop = Shop::factory()->create(['user_id' => $seller->id]);
        $category = Category::factory()->create();

        $this->actingAs($seller, 'sanctum')
            ->postJson('/api/seller/products', [
                'category_id' => $category->id,
                'name' => 'Produit Test',
                'description' => 'Description',
                'price' => 150,
                'stock' => 8,
            ])
            ->assertCreated()
            ->assertJsonFragment([
                'shop_id' => $shop->id,
                'name' => 'Produit Test',
            ]);
    }

    public function test_seller_cannot_create_product_before_shop_approval(): void
    {
        $seller = User::factory()->seller()->create();
        Shop::factory()->pending()->create(['user_id' => $seller->id]);
        $category = Category::factory()->create();

        $this->actingAs($seller, 'sanctum')
            ->postJson('/api/seller/products', [
                'category_id' => $category->id,
                'name' => 'Produit Test',
                'price' => 150,
                'stock' => 8,
            ])
            ->assertForbidden();
    }

    public function test_seller_can_update_their_product(): void
    {
        $seller = User::factory()->seller()->create();
        $shop = Shop::factory()->create(['user_id' => $seller->id]);
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'name' => 'Produit Original',
            'price' => 100,
            'stock' => 10,
        ]);

        $this->actingAs($seller, 'sanctum')
            ->putJson("/api/seller/products/{$product->id}", [
                'category_id' => $category->id,
                'name' => 'Produit Modifié',
                'description' => 'Description mise à jour',
                'price' => 175,
                'stock' => 6,
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonFragment([
                'id' => $product->id,
                'name' => 'Produit Modifié',
                'stock' => 6,
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Produit Modifié',
            'price' => '175.00',
            'stock' => 6,
            'is_active' => 0,
        ]);
    }
}
