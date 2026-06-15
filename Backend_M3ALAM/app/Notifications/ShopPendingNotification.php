<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ShopPendingNotification extends Notification
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
        return [
            'shop_id' => $this->shop->id,
            'shop_name' => $this->shop->name,
            'message' => 'Une nouvelle boutique attend votre validation : ' . $this->shop->name . '.',
        ];
    }
}
