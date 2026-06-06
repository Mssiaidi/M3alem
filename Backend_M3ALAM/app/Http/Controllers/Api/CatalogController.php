<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
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
                ->withCount([
                    'products' => fn ($query) => $query
                        ->where('is_active', true)
                        ->where('stock', '>', 0)
                        ->whereHas('shop', fn ($shop) => $shop->where('status', 'approved')),
                ])
                ->orderBy('name')
                ->get()
        );
    }

    public function products(Request $request): JsonResponse
    {
        $request->validate([
            'category' => ['nullable', 'string'],
            'search' => ['nullable', 'string', 'max:255'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,rating_desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $products = Product::query()
            ->with(['category', 'shop.user', 'images'])
            ->withAvg('reviews as rating_avg', 'rating')
            ->withCount('reviews as reviews_count')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('shop', fn ($query) => $query->where('status', 'approved'))
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->whereHas('category', fn ($category) => $category->where('slug', $request->string('category')));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = '%' . $request->string('search') . '%';

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', $search)
                        ->orWhere('description', 'like', $search)
                        ->orWhereHas('shop', fn ($shop) => $shop->where('name', 'like', $search))
                        ->orWhereHas('category', fn ($category) => $category->where('name', 'like', $search));
                });
            })
            ->when($request->filled('min_price'), fn ($query) => $query->where('price', '>=', $request->input('min_price')))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price', '<=', $request->input('max_price')));

        match ($request->input('sort', 'newest')) {
            'price_asc' => $products->orderBy('price'),
            'price_desc' => $products->orderByDesc('price'),
            'rating_desc' => $products->orderByDesc('rating_avg')->latest(),
            default => $products->latest(),
        };

        $products = $products->paginate($request->integer('per_page', 6))->withQueryString();

        return response()->json($products);
    }

    public function product(string $slug): JsonResponse
    {
        $product = Product::query()
            ->with([
                'category',
                'shop.user:id,name,email,role',
                'images',
                'reviews' => fn ($query) => $query->with('user:id,name')->latest()->limit(6),
            ])
            ->withAvg('reviews as rating_avg', 'rating')
            ->withCount('reviews as reviews_count')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('shop', fn ($query) => $query->where('status', 'approved'))
            ->firstOrFail();

        $relatedProducts = Product::query()
            ->with(['category', 'shop.user', 'images'])
            ->withAvg('reviews as rating_avg', 'rating')
            ->withCount('reviews as reviews_count')
            ->whereKeyNot($product->id)
            ->where('category_id', $product->category_id)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('shop', fn ($query) => $query->where('status', 'approved'))
            ->latest()
            ->limit(4)
            ->get();

        $product->setAttribute('related_products', $relatedProducts);

        return response()->json($product);
    }

    public function shop(string $slug): JsonResponse
    {
        $shop = Shop::query()
            ->with([
                'user:id,name,email,role',
                'products' => fn ($query) => $query
                    ->with(['category', 'images'])
                    ->withAvg('reviews as rating_avg', 'rating')
                    ->withCount('reviews as reviews_count')
                    ->where('is_active', true)
                    ->where('stock', '>', 0)
                    ->latest(),
            ])
            ->where('slug', $slug)
            ->where('status', 'approved')
            ->firstOrFail();

        $productIds = $shop->products->pluck('id');

        $reviews = Review::query()
            ->with('user:id,name')
            ->whereHas('order.items', fn ($query) => $query->whereIn('product_id', $productIds))
            ->latest()
            ->limit(6)
            ->get();

        $shop->setAttribute('products_count', $shop->products->count());
        $shop->setAttribute('categories', $shop->products->pluck('category')->filter()->unique('id')->values());
        $shop->setAttribute('rating_avg', $reviews->avg('rating'));
        $shop->setAttribute('reviews_count', $reviews->count());
        $shop->setAttribute('reviews', $reviews);

        return response()->json($shop);
    }
}
