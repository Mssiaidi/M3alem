<?php

namespace App\Notifications;

use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ShopContactNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Shop $shop,
        protected string $senderName,
        protected string $senderEmail,
        protected string $message,
        protected ?string $attachmentPath = null,
    ) {
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
            'sender_name' => $this->senderName,
            'sender_email' => $this->senderEmail,
            'message' => $this->message,
            'attachment_path' => $this->attachmentPath,
        ];
    }
}
