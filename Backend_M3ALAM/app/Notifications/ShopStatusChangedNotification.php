<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ShopStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(protected Shop $shop)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $statusLabel = match ($this->shop->status) {
            'approved' => 'approuvee',
            'suspended' => 'suspendue',
            default => $this->shop->status,
        };

        return [
            'shop_id' => $this->shop->id,
            'shop_name' => $this->shop->name,
            'status' => $this->shop->status,
            'message' => 'Votre boutique ' . $this->shop->name . ' est maintenant ' . $statusLabel . '.',
        ];
    }
}
