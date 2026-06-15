<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Notifications\ShopContactNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShopContactController extends Controller
{
    public function store(Request $request, Shop $shop): JsonResponse
    {
        abort_unless($request->user(), 401);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1200'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = Storage::disk('public')->putFile('shop-contacts', $request->file('attachment'));
        }

        $shop->user?->notify(new ShopContactNotification(
            $shop,
            $request->user()->name,
            $request->user()->email,
            $validated['message'],
            $attachmentPath,
        ));

        return response()->json([
            'message' => 'Votre message a été envoyé au vendeur dans la plateforme.',
            'attachment_path' => $attachmentPath,
        ]);
    }
}
