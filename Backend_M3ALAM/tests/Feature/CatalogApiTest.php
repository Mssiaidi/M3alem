<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Shop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_returns_only_available_products_from_approved_shops(): void
    {
        $approvedShop = Shop::factory()->create();
        $pendingShop = Shop::factory()->pending()->create();
        $category = Category::factory()->create();

        $visibleProduct = Product::factory()->create([
            'shop_id' => $approvedShop->id,
            'category_id' => $category->id,
            'name' => 'Visible Product',
        ]);

        ProductImage::factory()->create(['product_id' => $visibleProduct->id]);

        Product::factory()->create([
            'shop_id' => $pendingShop->id,
            'category_id' => $category->id,
            'name' => 'Hidden Product',
        ]);

        $response = $this->getJson('/api/products');

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Visible Product'])
            ->assertJsonMissing(['name' => 'Hidden Product']);
    }

    public function test_public_categories_are_listed(): void
    {
        Category::factory()->create(['name' => 'Ceramique']);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Ceramique']);
    }
}
