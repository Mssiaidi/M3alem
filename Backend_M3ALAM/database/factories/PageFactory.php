<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(2, true);

        return [
            'title' => ucfirst($title),
            'slug' => fake()->unique()->slug(),
            'content' => '<p>'.fake()->sentence().'</p>',
        ];
    }
}
