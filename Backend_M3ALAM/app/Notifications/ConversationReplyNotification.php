<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Shop;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ConversationReplyNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $sourceType,
        protected string $sourceKey,
        protected string $message,
        protected ?string $reference = null,
        protected ?int $orderId = null,
        protected ?int $shopId = null,
        protected ?string $senderRole = null,
        protected ?string $senderName = null,
        protected ?string $senderEmail = null,
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
            'source_type' => $this->sourceType,
            'source_key' => $this->sourceKey,
            'reference' => $this->reference,
            'order_id' => $this->orderId,
            'shop_id' => $this->shopId,
            'sender_role' => $this->senderRole,
            'sender_name' => $this->senderName,
            'sender_email' => $this->senderEmail,
            'message' => $this->message,
            'attachment_path' => $this->attachmentPath,
        ];
    }
}
