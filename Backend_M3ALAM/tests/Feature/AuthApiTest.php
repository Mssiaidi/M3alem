<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Client Test',
            'email' => 'client@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'client',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);
    }

    public function test_user_can_login_and_fetch_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'client@example.com',
            'password' => 'password',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'client@example.com',
            'password' => 'password',
        ]);

        $token = $login->assertOk()->json('token');

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }
}
