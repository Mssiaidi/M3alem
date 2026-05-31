<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Notifications\OrderStatusChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isSeller(), 403);
        $shop = $request->user()->shop;
        abort_unless($shop, 422, 'Boutique non trouvée.');

        $orders = Order::whereHas('items', function ($query) use ($shop) {
            $query->where('shop_id', $shop->id);
        })
        ->with(['items' => function ($query) use ($shop) {
            $query->where('shop_id', $shop->id);
        }])
        ->latest()
        ->paginate(15);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($request->user()->isSeller(), 403);
        $shop = $request->user()->shop;
        abort_unless($shop, 422, 'Boutique non trouvée.');

        abort_unless($order->items()->where('shop_id', $shop->id)->exists(), 403);

        return response()->json($order->load(['items' => function ($query) use ($shop) {
            $query->where('shop_id', $shop->id);
        }, 'user:id,name,email']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        abort_unless($request->user()->isSeller(), 403);
        $shop = $request->user()->shop;
        abort_unless($shop, 422, 'Boutique non trouvée.');

        abort_unless($order->items()->where('shop_id', $shop->id)->exists(), 403);

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
            ],
        ]);

        $statusOrder = [
            'pending' => 0,
            'confirmed' => 1,
            'processing' => 2,
            'shipped' => 3,
            'delivered' => 4,
            'cancelled' => 5,
        ];

        $currentStatus = $order->status;
        $newStatus = $validated['status'];

        // Business rule: status cannot go backwards, except to cancelled
        if ($newStatus !== 'cancelled') {
            if ($statusOrder[$newStatus] <= $statusOrder[$currentStatus]) {
                return response()->json(['message' => 'Le statut ne peut pas revenir en arrière.'], 422);
            }
        }

        if ($currentStatus === 'delivered' || $currentStatus === 'cancelled') {
            return response()->json(['message' => 'Impossible de modifier une commande terminée ou annulée.'], 422);
        }

        $order->update(['status' => $newStatus]);

        if ($newStatus === 'cancelled') {
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }
        }

        // Notify client
        $order->user->notify(new OrderStatusChangedNotification($order));

        return response()->json($order);
    }
}
