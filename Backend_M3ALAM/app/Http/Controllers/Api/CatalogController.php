<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(
            Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
        );
    }

    public function products(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category', 'shop.user', 'images'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('shop', fn ($query) => $query->where('status', 'approved'))
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->whereHas('category', fn ($category) => $category->where('slug', $request->string('category')));
            })
            ->latest()
            ->paginate(15);

        return response()->json($products);
    }

    public function product(string $slug): JsonResponse
    {
        $product = Product::query()
            ->with(['category', 'shop.user', 'images'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('shop', fn ($query) => $query->where('status', 'approved'))
            ->firstOrFail();

        return response()->json($product);
    }

    public function shop(string $slug): JsonResponse
    {
        $shop = Shop::query()
            ->with(['user:id,name,email,role', 'products.category', 'products.images'])
            ->where('slug', $slug)
            ->where('status', 'approved')
            ->firstOrFail();

        $shop->products = $shop->products
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->values();

        return response()->json($shop);
    }
}
