<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        abort_unless(request()->user()->isSeller(), 403);

        $shop = request()->user()->shop;

        abort_unless($shop, 422, 'Creez votre boutique avant de gerer les produits.');

        return response()->json(
            $shop->products()->with(['category', 'images'])->latest()->paginate(15)
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $shop = $request->user()->shop;

        abort_unless($shop, 422, 'Creez votre boutique avant de publier un produit.');
        abort_unless($shop->isApproved(), 403, 'Votre boutique doit etre validee par un administrateur.');

        $product = $shop->products()->create([
            ...$request->safe()->except('images'),
            'slug' => Str::slug($request->string('name')).'-'.Str::lower(Str::random(6)),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->syncImages($product, $request->file('images', []));

        return response()->json($product->load(['category', 'images']), 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        Gate::authorize('update', $product);

        $data = $request->safe()->except('images');

        if ($request->filled('name')) {
            $data['slug'] = Str::slug($request->string('name')).'-'.$product->id;
        }

        $product->update($data);

        if ($request->has('images')) {
            $this->syncImages($product, $request->file('images', []));
        }

        return response()->json($product->load(['category', 'images']));
    }

    public function destroy(Product $product): JsonResponse
    {
        Gate::authorize('delete', $product);

        $product->delete();

        return response()->json(status: 204);
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach (array_values($images) as $index => $path) {
            $storedPath = $path->store('products', 'public');

            $product->images()->create([
                'path' => Storage::disk('public')->url($storedPath),
                'alt_text' => $product->name,
                'position' => $index + 1,
            ]);
        }
    }
}
