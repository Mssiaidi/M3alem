<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isSeller(), 403);

        $messages = $request->user()
            ->notifications()
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($notification) {
                $data = $notification->data ?? [];

                return [
                    'id' => $notification->id,
                    'type' => class_basename($notification->type),
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'shop_name' => $data['shop_name'] ?? null,
                    'shop_id' => $data['shop_id'] ?? null,
                    'reference' => $data['reference'] ?? null,
                    'order_id' => $data['order_id'] ?? null,
                    'sender_name' => $data['sender_name'] ?? null,
                    'sender_email' => $data['sender_email'] ?? null,
                    'sender_role' => $data['sender_role'] ?? null,
                    'message' => $data['message'] ?? '',
                    'attachment_path' => $data['attachment_path'] ?? null,
                ];
            });

        return response()->json([
            'data' => $messages,
        ]);
    }
}
