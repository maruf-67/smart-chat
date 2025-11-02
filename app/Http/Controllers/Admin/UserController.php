<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users with filtering, sorting, and pagination.
     *
     * @param  Request  $request  HTTP request with optional filters
     * @return Response Inertia response with users data
     *
     * @context Admin user management with advanced filtering
     *
     * @pattern Controller with Inertia response
     */
    public function index(Request $request): Response
    {
        $userType = $request->input('user_type');

        $query = User::with('role')
            ->when($request->search, function ($q, string $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(
                $userType && in_array($userType, ['admin', 'agent', 'user'], true),
                fn ($q) => $q->where('user_type', $userType)
            )
            ->when($request->status !== null, fn ($q) => $q->where('status', (bool) $request->status));

        // Handle sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        if ($sortBy === 'name') {
            $query->orderBy('first_name', $sortDir)->orderBy('last_name', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search'),
                'user_type' => in_array($userType, ['admin', 'agent', 'user'], true) ? $userType : null,
                'status' => $request->input('status'),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     *
     * @return Response Inertia response with create form
     *
     * @context Admin user creation form
     *
     * @pattern Controller with Inertia response
     */
    public function create(): Response
    {
        $roles = Role::where('is_active', true)
            ->where('type', 'admin')
            ->orderBy('name')
            ->get(['id', 'name', 'title']);

        return Inertia::render('admin/users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user in storage.
     *
     * @param  StoreUserRequest  $request  Validated request
     * @return RedirectResponse Redirect to users index
     *
     * @context Admin user creation with image upload
     *
     * @pattern Controller with FormRequest validation
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Hash the password
        $validated['password'] = Hash::make($validated['password']);

        if (($validated['user_type'] ?? null) !== 'admin') {
            $validated['role_id'] = null;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('users', 'public');
        }

        // Set status (default to active if not provided)
        $validated['status'] = $validated['status'] ?? true;

        // Set audit fields
        $validated['created_by'] = auth()->id();
        $validated['created_ip'] = $request->ip();

        User::create($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully');
    }

    /**
     * Show the form for editing the specified user.
     *
     * @param  User  $user  User model instance
     * @return Response Inertia response with edit form
     *
     * @context Admin user edit form
     *
     * @pattern Controller with Inertia response
     */
    public function edit(User $user): Response
    {
        $roles = Role::where('is_active', true)
            ->orderBy('name')
            ->where('type', 'admin')
            ->get(['id', 'name', 'title']);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     *
     * @param  UpdateUserRequest  $request  Validated request
     * @param  User  $user  User model instance
     * @return RedirectResponse Redirect to users index
     *
     * @context Admin user update with optional password and image
     *
     * @pattern Controller with FormRequest validation
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        // Hash password if provided
        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (($validated['user_type'] ?? null) !== 'admin') {
            $validated['role_id'] = null;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }

            $validated['image'] = $request->file('image')->store('users', 'public');
        }

        // Set audit fields
        $validated['updated_by'] = auth()->id();
        $validated['updated_ip'] = $request->ip();

        $user->update($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  User  $user  User model instance
     * @return RedirectResponse Redirect to users index
     *
     * @context Admin user deletion with image cleanup
     *
     * @pattern Controller with soft delete
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'You cannot delete your own account');
        }

        // Delete user image if exists
        if ($user->image) {
            Storage::disk('public')->delete($user->image);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully');
    }
}
