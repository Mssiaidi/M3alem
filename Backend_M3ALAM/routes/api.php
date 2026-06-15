<?php

use App\Http\Controllers\Api\Admin\ShopModerationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ShopContactController;
use App\Http\Controllers\Api\Seller\ProductController as SellerProductController;
use App\Http\Controllers\Api\Seller\ShopController as SellerShopController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);

Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/products', [CatalogController::class, 'products']);
Route::get('/products/{slug}', [CatalogController::class, 'product']);
    Route::get('/shops/{slug}', [CatalogController::class, 'shop']);

    Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'add']);
    Route::put('/cart/items/{item}', [CartController::class, 'update']);
    Route::delete('/cart/items/{item}', [CartController::class, 'remove']);
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

    Route::post('/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store']);
    Route::post('/shops/{shop}/contact', [ShopContactController::class, 'store']);
    Route::get('/messages', [\App\Http\Controllers\Api\Client\MessageController::class, 'index']);
    Route::patch('/messages/read', [\App\Http\Controllers\Api\Client\MessageController::class, 'markRead']);
    Route::post('/messages/reply', [\App\Http\Controllers\Api\Client\MessageController::class, 'reply']);

    Route::prefix('seller')->group(function (): void {
        Route::get('/shop', [SellerShopController::class, 'show']);
        Route::post('/shop', [SellerShopController::class, 'store']);
        Route::post('/shop/verification-documents', [SellerShopController::class, 'submitVerificationDocuments']);
        Route::get('/products', [SellerProductController::class, 'index']);
        Route::get('/products/{product}', [SellerProductController::class, 'show']);
        Route::post('/products', [SellerProductController::class, 'store']);
        Route::put('/products/{product}', [SellerProductController::class, 'update']);
        Route::delete('/products/{product}', [SellerProductController::class, 'destroy']);

        Route::get('/orders', [\App\Http\Controllers\Api\Seller\OrderController::class, 'index']);
        Route::get('/orders/{order}', [\App\Http\Controllers\Api\Seller\OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [\App\Http\Controllers\Api\Seller\OrderController::class, 'updateStatus']);
        Route::post('/orders/{order}/contact', [\App\Http\Controllers\Api\Seller\OrderController::class, 'contact']);
        Route::get('/messages', [\App\Http\Controllers\Api\Seller\MessageController::class, 'index']);
        Route::get('/dashboard', \App\Http\Controllers\Api\Seller\DashboardController::class);
    });

    Route::prefix('admin')->middleware('admin')->group(function (): void {
        Route::apiResource('categories', \App\Http\Controllers\Api\Admin\CategoryController::class);
        Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
        Route::post('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'store']);
        Route::patch('/users/{user}/approve', [\App\Http\Controllers\Api\Admin\UserController::class, 'approve']);
        Route::get('/shops/pending', [ShopModerationController::class, 'pending']);
        Route::get('/shops/{shop}', [ShopModerationController::class, 'show']);
        Route::patch('/shops/{shop}/approve', [ShopModerationController::class, 'approve']);
        Route::patch('/shops/{shop}/suspend', [ShopModerationController::class, 'suspend']);
        Route::get('/orders', [\App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
        Route::get('/messages', [\App\Http\Controllers\Api\Admin\MessageController::class, 'index']);
        Route::patch('/messages/read', [\App\Http\Controllers\Api\Admin\MessageController::class, 'markRead']);
        Route::post('/messages/reply', [\App\Http\Controllers\Api\Admin\MessageController::class, 'reply']);

        Route::get('/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'index']);
        Route::delete('/reviews/{review}', [\App\Http\Controllers\Api\ReviewController::class, 'destroy']);
        Route::get('/dashboard', \App\Http\Controllers\Api\Admin\DashboardController::class);
    });
});
