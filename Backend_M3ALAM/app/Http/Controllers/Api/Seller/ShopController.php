<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShopRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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

    public function submitVerificationDocuments(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isSeller(), 403);

        $shop = $user->shop;
        abort_unless($shop, 422, 'Boutique non trouvée.');

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'cin' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'artisan_card' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        $photoPath = Storage::disk('public')->putFile('seller-verification', $request->file('photo'));
        $cinPath = Storage::disk('public')->putFile('seller-verification', $request->file('cin'));
        $artisanCardPath = Storage::disk('public')->putFile('seller-verification', $request->file('artisan_card'));

        $shop->update([
            'verification_status' => 'pending_review',
            'verification_full_name' => $validated['full_name'],
            'verification_photo_path' => $photoPath,
            'verification_cin_path' => $cinPath,
            'verification_artisan_card_path' => $artisanCardPath,
            'verification_documents' => [
                'full_name' => $validated['full_name'],
                'photo' => $photoPath,
                'cin' => $cinPath,
                'artisan_card' => $artisanCardPath,
            ],
        ]);

        return response()->json([
            'message' => 'Documents envoyés avec succès.',
            'verification_status' => $shop->verification_status,
            'shop' => $shop->fresh(),
        ]);
    }
}
