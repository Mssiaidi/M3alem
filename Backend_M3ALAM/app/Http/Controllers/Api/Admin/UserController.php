<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $role = $request->string('role')->toString();
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();

        $users = User::query()
            ->withCount(['orders', 'reviews', 'shop'])
            ->when(in_array($role, ['client', 'seller', 'admin'], true), fn ($query) => $query->where('role', $role))
            ->when(in_array($status, ['active', 'pending'], true), fn ($query) => $query->where('account_status', $status))
            ->when($search !== '', fn ($query) => $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            }))
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['client', 'seller', 'admin'])],
        ]);

        $validated['account_status'] = $validated['role'] === 'client' ? 'active' : 'pending';

        $user = User::create($validated);

        return response()->json($user->loadCount(['orders', 'reviews', 'shop']), 201);
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $user->update([
            'account_status' => 'active',
        ]);

        return response()->json($user->loadCount(['orders', 'reviews', 'shop']));
    }
}
