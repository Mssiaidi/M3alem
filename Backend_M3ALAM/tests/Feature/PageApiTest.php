<?php

namespace Tests\Feature;

use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_pages_index_returns_pages(): void
    {
        Page::factory()->create([
            'title' => 'Accueil',
            'slug' => 'accueil',
        ]);

        $response = $this->getJson('/api/pages');

        $response->assertOk()
            ->assertJsonFragment([
                'title' => 'Accueil',
                'slug' => 'accueil',
            ]);
    }

    public function test_pages_show_returns_one_page(): void
    {
        Page::factory()->create([
            'title' => 'Catalogue',
            'slug' => 'catalogue',
            'content' => '<p>Catalogue</p>',
        ]);

        $response = $this->getJson('/api/pages/catalogue');

        $response->assertOk()
            ->assertJsonFragment([
                'title' => 'Catalogue',
                'slug' => 'catalogue',
            ]);
    }
}
