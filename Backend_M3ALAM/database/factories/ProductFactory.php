<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'shop_id' => Shop::factory(),
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 50, 2000),
            'stock' => fake()->numberBetween(1, 50),
            'is_active' => true,
        ];
    }
}
