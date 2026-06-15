<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SellerRegisteredNotification extends Notification
{
    use Queueable;

    public function __construct(protected User $seller)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'seller_id' => $this->seller->id,
            'seller_name' => $this->seller->name,
            'message' => 'Un nouveau vendeur attend votre validation : ' . $this->seller->name . '.',
        ];
    }
}
