<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        return response()->json(
            Review::with(['user:id,name', 'order:id,reference'])
                ->latest()
                ->paginate(15)
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        abort_unless($order->status === 'delivered', 422, 'Vous ne pouvez laisser un avis qu\'après la livraison.');

        $review = $request->user()->reviews()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json($review, $review->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $review->delete();

        return response()->json(null, 204);
    }
}
