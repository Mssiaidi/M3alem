<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\ShopStatusChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $role = $request->string('role')->toString();
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();

        $shopColumns = ['id', 'user_id', 'name', 'status', 'verification_full_name', 'verification_photo_path', 'verification_cin_path', 'verification_artisan_card_path', 'verification_documents'];

        if (Schema::hasColumn('shops', 'verification_status')) {
            $shopColumns[] = 'verification_status';
        }

        $users = User::query()
            ->with(['shop:' . implode(',', $shopColumns)])
            ->withCount(['orders', 'reviews', 'shop'])
            ->when(in_array($role, ['client', 'seller', 'admin'], true), fn ($query) => $query->where('role', $role))
            ->when(in_array($status, ['active', 'pending'], true), fn ($query) => $query->where('account_status', $status))
            ->when($search !== '', fn ($query) => $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            }))
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['client', 'seller', 'admin'])],
        ]);

        $validated['account_status'] = $validated['role'] === 'seller' ? 'pending' : 'active';

        $user = User::create($validated);

        return response()->json($user->loadCount(['orders', 'reviews', 'shop']), 201);
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $user->update([
            'account_status' => 'active',
        ]);

        if ($user->isSeller()) {
            $shop = $user->shop()->exists()
                ? $user->shop
                : $this->createApprovedShopForSeller($user);

            if ($shop) {
                $shop->update([
                    'status' => 'approved',
                    'approved_at' => $shop->approved_at ?? now(),
                ]);

                $user->notify(new ShopStatusChangedNotification($shop->fresh()));
            }
        }

        return response()->json($user->load('shop')->loadCount(['orders', 'reviews', 'shop']));
    }

    private function createApprovedShopForSeller(User $user): Shop
    {
        $baseName = 'Boutique de ' . $user->name;
        $baseSlug = Str::slug($baseName) ?: 'boutique-vendeur';
        $slug = $baseSlug;
        $suffix = 1;

        while (Shop::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $user->id . '-' . $suffix;
            $suffix++;
        }

        $shopData = [
            'name' => $baseName,
            'slug' => $slug,
            'description' => 'Boutique artisanale creee automatiquement apres validation du vendeur.',
            'city' => null,
            'status' => 'approved',
            'approved_at' => now(),
        ];

        if (Schema::hasColumn('shops', 'verification_status')) {
            $shopData['verification_status'] = 'verified';
        }

        if (Schema::hasColumn('shops', 'verification_full_name')) {
            $shopData['verification_full_name'] = $user->name;
        }

        return $user->shop()->create($shopData);
    }
}
