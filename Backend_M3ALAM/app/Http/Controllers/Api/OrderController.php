<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $cart->load(['items.product.shop']);

        abort_if($cart->items->isEmpty(), 422, 'Votre panier est vide.');

        $order = DB::transaction(function () use ($request, $cart) {
            $total = $cart->items->sum(fn ($item) => (float) $item->unit_price * $item->quantity);

            $order = $request->user()->orders()->create([
                ...$request->validated(),
                'reference' => 'ORD-'.now()->format('Ymd').'-'.str_pad((string) (Order::query()->count() + 1), 4, '0', STR_PAD_LEFT),
                'status' => 'pending',
                'total_amount' => $total,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'shop_id' => $item->product->shop_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => (float) $item->unit_price * $item->quantity,
                ]);

                $item->product->decrement('stock', $item->quantity);
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
