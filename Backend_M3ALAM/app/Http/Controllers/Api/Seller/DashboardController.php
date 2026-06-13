<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shop;
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

        $shops = Shop::query()
            ->select('id', 'name', 'status')
            ->withCount('products')
            ->get();

        $shopSalesById = OrderItem::query()
            ->selectRaw('shop_id, COALESCE(SUM(total_price), 0) as total_sales')
            ->whereHas('order', fn ($q) => $q->where('status', 'delivered'))
            ->groupBy('shop_id')
            ->pluck('total_sales', 'shop_id');

        $rankedShops = $shops->map(function (Shop $listedShop) use ($shopSalesById) {
            $sales = (float) ($shopSalesById[$listedShop->id] ?? 0);

            return [
                'id' => $listedShop->id,
                'name' => $listedShop->name,
                'sales' => $sales,
            ];
        })->sortByDesc('sales')->values();

        $currentShopIndex = $rankedShops->search(fn (array $listedShop) => $listedShop['id'] === $shop->id);
        $sellerCount = max(1, $rankedShops->count());
        $rank = $currentShopIndex === false ? 1 : $currentShopIndex + 1;
        $rankPercent = (int) ceil(($rank / $sellerCount) * 100);

        $level = match (true) {
            $totalSales >= 50000 => 5,
            $totalSales >= 25000 => 4,
            $totalSales >= 10000 => 3,
            $totalSales >= 5000 => 2,
            default => 1,
        };

        $categoryGroups = $shop->products()
            ->with('category:id,name')
            ->get()
            ->groupBy(fn ($product) => $product->category?->name ?? 'Autres ateliers')
            ->sortByDesc(fn ($group) => $group->count())
            ->take(2);

        $workshopCapacity = $categoryGroups->map(function ($group, $label) {
            $used = $group->count();
            $capacity = max(10, $used + 2);

            return [
                'label' => $label,
                'used' => $used,
                'capacity' => $capacity,
                'percentage' => min(100, (int) round(($used / $capacity) * 100)),
            ];
        })->values();

        if ($workshopCapacity->isEmpty()) {
            $workshopCapacity = collect([
                [
                    'label' => 'Produits actifs',
                    'used' => 0,
                    'capacity' => 10,
                    'percentage' => 0,
                ],
                [
                    'label' => 'Ateliers secondaires',
                    'used' => 0,
                    'capacity' => 10,
                    'percentage' => 0,
                ],
            ]);
        }

        $recentOrders = Order::whereHas('items', fn($q) => $q->where('shop_id', $shop->id))
            ->with([
                'items' => fn ($query) => $query
                    ->where('shop_id', $shop->id)
                    ->with(['product.images', 'shop:id,name']),
            ])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_sales' => $totalSales,
            'pending_orders' => $pendingOrders,
            'total_products' => $totalProducts,
            'recent_orders' => $recentOrders,
            'verification' => [
                'title' => $shop->isApproved() ? 'Verified Master' : 'Verification Pending',
                'tier' => $shop->isApproved()
                    ? ($rankPercent <= 5 ? 'Top 5% Artisan Tier' : 'Top '.$rankPercent.'% Artisan Tier')
                    : 'Awaiting approval',
                'level' => 'LEVEL '.$level,
                'is_verified' => $shop->isApproved(),
                'rank' => $rank,
                'seller_count' => $sellerCount,
            ],
            'workshop_capacity' => $workshopCapacity,
        ]);
    }
}
