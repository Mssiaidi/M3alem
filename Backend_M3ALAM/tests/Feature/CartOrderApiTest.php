<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartOrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_add_product_to_cart_and_checkout(): void
    {
        $client = User::factory()->create();
        $shop = Shop::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'shop_id' => $shop->id,
            'category_id' => $category->id,
            'price' => 100,
            'stock' => 5,
        ]);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'quantity' => 2,
            ])
            ->assertCreated()
            ->assertJsonPath('total', 200);

        $this->actingAs($client, 'sanctum')
            ->postJson('/api/checkout', [
                'customer_name' => 'Client Test',
                'customer_phone' => '0600000000',
                'shipping_city' => 'Fes',
                'shipping_address' => 'Rue test',
            ])
            ->assertCreated()
            ->assertJsonFragment(['total_amount' => '200.00']);
    }
}
