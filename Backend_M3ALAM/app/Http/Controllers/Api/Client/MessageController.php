<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Notifications\ConversationReplyNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        $messages = $request->user()
            ->notifications()
            ->latest()
            ->take(100)
            ->get()
            ->map(function ($notification) {
                $data = $notification->data ?? [];
                $threadKey = !empty($data['sender_email'])
                    ? 'client:' . strtolower((string) $data['sender_email'])
                    : (!empty($data['order_id'])
                        ? 'order:' . $data['order_id']
                        : (!empty($data['shop_id']) ? 'shop:' . $data['shop_id'] : 'message:' . $notification->id));

                return [
                    'id' => $notification->id,
                    'type' => class_basename($notification->type),
                    'thread_key' => $threadKey,
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

        return response()->json(['data' => $messages]);
    }

    public function markRead(Request $request): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        $validated = $request->validate([
            'thread_key' => ['required', 'string'],
        ]);

        $this->markThreadAsRead($request, $validated['thread_key']);

        return response()->json(['message' => 'Conversation marquée comme lue.']);
    }

    public function reply(Request $request): JsonResponse
    {
        abort_unless($request->user()->isClient(), 403);

        $validated = $request->validate([
            'thread_key' => ['required', 'string'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $latest = $request->user()
            ->notifications()
            ->latest()
            ->get()
            ->first(function ($notification) use ($validated) {
                $data = $notification->data ?? [];
                $threadKey = !empty($data['sender_email'])
                    ? 'client:' . strtolower((string) $data['sender_email'])
                    : (!empty($data['order_id'])
                        ? 'order:' . $data['order_id']
                        : (!empty($data['shop_id']) ? 'shop:' . $data['shop_id'] : 'message:' . $notification->id));

                return $threadKey === $validated['thread_key'];
            });

        abort_unless($latest, 404, 'Conversation introuvable.');

        $data = $latest->data ?? [];
        $recipient = null;

        if (!empty($data['sender_email'])) {
            $recipient = User::query()->where('email', $data['sender_email'])->first();
        }

        if (!$recipient && !empty($data['order_id'])) {
            $order = Order::query()->with(['items.shop.user'])->find($data['order_id']);
            $recipient = $order?->items->first()?->shop?->user;
        }

        abort_unless($recipient, 422, 'Impossible de déterminer le destinataire.');

        $recipient->notify(new ConversationReplyNotification(
            sourceType: !empty($data['sender_email']) ? 'client' : 'order',
            sourceKey: $validated['thread_key'],
            message: $validated['message'],
            reference: $data['reference'] ?? null,
            orderId: $data['order_id'] ?? null,
            shopId: $data['shop_id'] ?? null,
            senderRole: 'client',
            senderName: $request->user()->name,
            senderEmail: $request->user()->email,
        ));

        $this->markThreadAsRead($request, $validated['thread_key']);

        return response()->json(['message' => 'Réponse envoyée.']);
    }

    private function markThreadAsRead(Request $request, string $threadKey): void
    {
        $request->user()
            ->notifications()
            ->latest()
            ->get()
            ->filter(function ($notification) use ($threadKey) {
                $data = $notification->data ?? [];
                $currentKey = !empty($data['sender_email'])
                    ? 'client:' . strtolower((string) $data['sender_email'])
                    : (!empty($data['order_id'])
                        ? 'order:' . $data['order_id']
                        : (!empty($data['shop_id']) ? 'shop:' . $data['shop_id'] : 'message:' . $notification->id));

                return $currentKey === $threadKey;
            })
            ->each
            ->markAsRead();
    }
}
