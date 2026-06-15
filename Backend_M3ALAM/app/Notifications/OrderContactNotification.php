<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderContactNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Order $order,
        protected string $senderRole,
        protected string $message,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'reference' => $this->order->reference,
            'sender_role' => $this->senderRole,
            'message' => $this->message,
        ];
    }
}
