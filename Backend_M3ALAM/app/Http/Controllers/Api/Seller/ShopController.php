<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShopRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ShopController extends Controller
{
    public function show(): JsonResponse
    {
        abort_unless(request()->user()->isSeller(), 403);

        return response()->json(request()->user()->shop);
    }

    public function store(StoreShopRequest $request): JsonResponse
    {
        $user = $request->user();

        abort_if($user->shop()->exists(), 422, 'Ce vendeur possede deja une boutique.');

        $shop = $user->shop()->create([
            ...$request->validated(),
            'slug' => Str::slug($request->string('name')).'-'.$user->id,
            'status' => 'pending',
        ]);

        return response()->json($shop, 201);
    }
}
