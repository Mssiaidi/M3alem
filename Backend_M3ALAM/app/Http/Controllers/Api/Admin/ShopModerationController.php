<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ShopModerationController extends Controller
{
    public function pending(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        return response()->json(
            Shop::query()
                ->with('user:id,name,email,role')
                ->where('status', 'pending')
                ->latest()
                ->paginate(15)
        );
    }

    public function approve(Request $request, Shop $shop): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);
        Gate::authorize('approve', $shop);

        $shop->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return response()->json($shop->load('user:id,name,email,role'));
    }

    public function suspend(Request $request, Shop $shop): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);
        Gate::authorize('suspend', $shop);

        $shop->update([
            'status' => 'suspended',
            'approved_at' => null,
        ]);

        return response()->json($shop->load('user:id,name,email,role'));
    }
}
