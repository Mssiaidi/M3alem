<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddCartItemRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($this->cartPayload($request));
    }

    public function add(AddCartItemRequest $request): JsonResponse
    {
        $product = Product::query()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('shop', fn ($query) => $query->where('status', 'approved'))
            ->findOrFail($request->integer('product_id'));

        $cart = $request->user()->cart()->firstOrCreate();
        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);

        $item->quantity = min(($item->exists ? $item->quantity : 0) + $request->integer('quantity'), $product->stock);
        $item->unit_price = $product->price;
        $item->save();

        return response()->json($this->cartPayload($request), 201);
    }

    public function update(Request $request, int $item): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $cartItem = $request->user()
            ->cart()
            ->firstOrCreate()
            ->items()
            ->whereKey($item)
            ->firstOrFail();

        $cartItem->update(['quantity' => min($data['quantity'], $cartItem->product->stock)]);

        return response()->json($this->cartPayload($request));
    }

    public function remove(Request $request, int $item): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        $request->user()
            ->cart()
            ->firstOrCreate()
            ->items()
            ->whereKey($item)
            ->delete();

        return response()->json($this->cartPayload($request));
    }

    private function cartPayload(Request $request): array
    {
        $cart = $request->user()->cart()->firstOrCreate();
        $cart->load(['items.product.shop', 'items.product.category', 'items.product.images']);

        $subtotal = $cart->items->sum(fn ($item) => (float) $item->unit_price * $item->quantity);

        return [
            'id' => $cart->id,
            'items' => $cart->items,
            'subtotal' => $subtotal,
            'total' => $subtotal,
        ];
    }
}
