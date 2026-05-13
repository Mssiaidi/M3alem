<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Page::query()
                ->select(['id', 'title', 'slug', 'updated_at'])
                ->orderBy('title')
                ->get()
        );
    }

    public function show(string $slug): JsonResponse
    {
        $page = Page::query()->where('slug', $slug)->firstOrFail();

        return response()->json($page);
    }
}
