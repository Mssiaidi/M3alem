<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Models\Product;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        return response()->json(
            $request->user()
                ->orders()
                ->with('items')
                ->latest()
                ->paginate(15)
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($request->user()->isClient() && $order->user_id === $request->user()->id, 403);

        return response()->json($order->load(['items.product.images', 'items.shop']));
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_unless($request->user()->isClient() && $order->user_id === $request->user()->id, 403);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Seules les commandes en attente peuvent être annulées.'], 422);
        }

        $order->update(['status' => 'cancelled']);

        // Restore stock
        foreach ($order->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        return response()->json($order);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $cart = $request->user()->cart()->firstOrCreate();
        $cart->load(['items.product.shop.user']);

        abort_if($cart->items->isEmpty(), 422, 'Votre panier est vide.');

        $order = DB::transaction(function () use ($request, $cart) {
            $cart->load(['items.product.shop.user']);

            $productIds = $cart->items->pluck('product_id')->all();
            $lockedProducts = Product::query()
                ->with('shop.user')
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cart->items as $item) {
                $product = $lockedProducts->get($item->product_id);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'cart' => ['Un produit de votre panier n\'est plus disponible.'],
                    ]);
                }

                if (! $product->is_active || ! $product->shop?->isApproved()) {
                    throw ValidationException::withMessages([
                        'cart' => ['Le produit "' . $product->name . '" n\'est plus disponible a la vente.'],
                    ]);
                }

                if ($product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => ['Stock insuffisant pour "' . $product->name . '". Stock disponible : ' . $product->stock . '.'],
                    ]);
                }

                $item->setRelation('product', $product);
            }

            $total = $cart->items->sum(fn ($item) => (float) $item->product->price * $item->quantity);

            $order = $request->user()->orders()->create([
                ...$request->validated(),
                'reference' => 'ORD-'.now()->format('Ymd').'-'.str_pad((string) (Order::query()->count() + 1), 4, '0', STR_PAD_LEFT),
                'status' => 'pending',
                'total_amount' => $total,
            ]);

            foreach ($cart->items as $item) {
                $product = $item->product;

                $order->items()->create([
                    'product_id' => $product->id,
                    'shop_id' => $product->shop_id,
                    'product_name' => $product->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $product->price,
                    'total_price' => (float) $product->price * $item->quantity,
                ]);

                $product->decrement('stock', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });

        // Notify sellers
        $shopIds = $order->items()->pluck('shop_id')->unique();
        foreach ($shopIds as $shopId) {
            $shop = \App\Models\Shop::find($shopId);
            if ($shop && $shop->user) {
                $shop->user->notify(new OrderPlacedNotification($order));
            }
        }

        return response()->json($order->load('items'), 201);
    }
}
