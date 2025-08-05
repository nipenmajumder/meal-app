<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

final class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:view users')->only(['index', 'show']);
        $this->middleware('can:create users')->only(['create', 'store']);
        $this->middleware('can:edit users')->only(['edit', 'update']);
        $this->middleware('can:delete users')->only('destroy');
        $this->middleware('can:manage user status')->only('toggleStatus');
    }

    /**
     * Display a listing of the users with pagination.
     */
    public function index(Request $request): Response
    {
        $users = User::with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($roleQuery) use ($role) {
                    $roleQuery->where('name', $role);
                });
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        $roles = Role::all();
        $currentUserRoles = auth()->user()->roles->pluck('name')->toArray();

        return Inertia::render('users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
            'currentUserRoles' => $currentUserRoles,
            'can' => [
                'create_users' => auth()->user()->can('create users'),
                'edit_users' => auth()->user()->can('edit users'),
                'delete_users' => auth()->user()->can('delete users'),
                'manage_user_status' => auth()->user()->can('manage user status'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::all();
        $currentUserRoles = auth()->user()->roles->pluck('name')->toArray();

        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'currentUserRoles' => $currentUserRoles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'status' => $request->status ?? 1,
        ]);

        if ($request->roles) {
            // Ensure user cannot assign roles higher than their own
            $userRoles = auth()->user()->roles->pluck('name')->toArray();
            $requestedRoles = is_array($request->roles) ? $request->roles : [$request->roles];
            
            // Filter roles based on permission
            $allowedRoles = collect($requestedRoles)->filter(function ($role) use ($userRoles) {
                return in_array($role, $userRoles) || auth()->user()->hasRole('super-admin');
            });

            $user->assignRole($allowedRoles->toArray());
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $user->load('roles');
        $roles = Role::all();
        $currentUserRoles = auth()->user()->roles->pluck('name')->toArray();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'currentUserRoles' => $currentUserRoles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = bcrypt($request->password);
        }

        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }

        $user->update($updateData);

        if ($request->has('roles')) {
            // Ensure user cannot assign roles higher than their own
            $userRoles = auth()->user()->roles->pluck('name')->toArray();
            $requestedRoles = is_array($request->roles) ? $request->roles : [$request->roles];
            
            // Filter roles based on permission
            $allowedRoles = collect($requestedRoles)->filter(function ($role) use ($userRoles) {
                return in_array($role, $userRoles) || auth()->user()->hasRole('super-admin');
            });

            $user->syncRoles($allowedRoles->toArray());
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent user from deleting themselves
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user status (active/inactive).
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        // Prevent user from deactivating themselves
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot change your own status.');
        }

        $user->update([
            'status' => $user->status === 1 ? 0 : 1,
        ]);

        $status = $user->status === 1 ? 'activated' : 'deactivated';

        return redirect()->route('users.index')
            ->with('success', "User {$status} successfully.");
    }
}
