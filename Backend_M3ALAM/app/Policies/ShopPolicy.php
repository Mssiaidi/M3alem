<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    public function update(User $user, Shop $shop): bool
    {
        return $user->isSeller() && $shop->user_id === $user->id;
    }

    public function approve(User $user, Shop $shop): bool
    {
        return $user->isAdmin();
    }

    public function suspend(User $user, Shop $shop): bool
    {
        return $user->isAdmin();
    }
}
