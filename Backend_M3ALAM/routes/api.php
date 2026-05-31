<?php

use App\Http\Controllers\Api\Admin\ShopModerationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PageController;
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

    Route::prefix('seller')->group(function (): void {
        Route::get('/shop', [SellerShopController::class, 'show']);
        Route::post('/shop', [SellerShopController::class, 'store']);
        Route::get('/products', [SellerProductController::class, 'index']);
        Route::post('/products', [SellerProductController::class, 'store']);
        Route::put('/products/{product}', [SellerProductController::class, 'update']);
        Route::delete('/products/{product}', [SellerProductController::class, 'destroy']);

        Route::get('/orders', [\App\Http\Controllers\Api\Seller\OrderController::class, 'index']);
        Route::get('/orders/{order}', [\App\Http\Controllers\Api\Seller\OrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [\App\Http\Controllers\Api\Seller\OrderController::class, 'updateStatus']);
        Route::get('/dashboard', \App\Http\Controllers\Api\Seller\DashboardController::class);
    });

    Route::prefix('admin')->group(function (): void {
        Route::get('/shops/pending', [ShopModerationController::class, 'pending']);
        Route::patch('/shops/{shop}/approve', [ShopModerationController::class, 'approve']);
        Route::patch('/shops/{shop}/suspend', [ShopModerationController::class, 'suspend']);

        Route::get('/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'index']);
        Route::delete('/reviews/{review}', [\App\Http\Controllers\Api\ReviewController::class, 'destroy']);
        Route::get('/dashboard', \App\Http\Controllers\Api\Admin\DashboardController::class);
    });
});
