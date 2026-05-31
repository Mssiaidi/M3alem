<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless($request->user()->isSeller(), 403);
        $shop = $request->user()->shop;
        abort_unless($shop, 422, 'Boutique non trouvée.');

        $totalSales = OrderItem::where('shop_id', $shop->id)
            ->whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->sum('total_price');

        $pendingOrders = Order::where('status', 'pending')
            ->whereHas('items', fn($q) => $q->where('shop_id', $shop->id))
            ->count();

        $totalProducts = $shop->products()->count();

        $recentOrders = Order::whereHas('items', fn($q) => $q->where('shop_id', $shop->id))
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_sales' => $totalSales,
            'pending_orders' => $pendingOrders,
            'total_products' => $totalProducts,
            'recent_orders' => $recentOrders,
        ]);
    }
}
