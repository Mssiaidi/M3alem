<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $orders = Order::query()
            ->with([
                'user:id,name,email',
                'items.product:id,name',
            ])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }
}
