<?php

namespace Tests\Feature;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_pending_shop(): void
    {
        $admin = User::factory()->admin()->create();
        $shop = Shop::factory()->pending()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/shops/{$shop->id}/approve")
            ->assertOk()
            ->assertJsonFragment(['status' => 'approved']);
    }

    public function test_client_cannot_access_admin_shop_moderation(): void
    {
        $client = User::factory()->create();

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/admin/shops/pending')
            ->assertForbidden();
    }
}
