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
        // Optimized: Select only needed columns and improve role filtering
        $users = User::select('id', 'name', 'email', 'status', 'created_at', 'updated_at')
            ->with('roles:id,name')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
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
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        // Optimized: Select only needed columns
        $roles = Role::select('id', 'name')->orderBy('name')->get();
        $currentUserRoles = request()->user()->roles->pluck('name')->toArray();

        return Inertia::render('users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
            'currentUserRoles' => $currentUserRoles,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::all();
        $currentUserRoles = request()->user()->roles->pluck('name')->toArray();

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
            $requestedRoles = is_array($request->roles) ? $request->roles : [$request->roles];
            
            // Admin can assign any role, others can only assign roles they have
            if (request()->user()->hasRole('Admin')) {
                $user->assignRole($requestedRoles);
            } else {
                $userRoles = request()->user()->roles->pluck('name')->toArray();
                $allowedRoles = collect($requestedRoles)->filter(function ($role) use ($userRoles) {
                    return in_array($role, $userRoles);
                });
                $user->assignRole($allowedRoles->toArray());
            }
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
        $currentUserRoles = request()->user()->roles->pluck('name')->toArray();

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
            $requestedRoles = is_array($request->roles) ? $request->roles : [$request->roles];
            
            // Admin can assign any role, others can only assign roles they have
            if (request()->user()->hasRole('Admin')) {
                $user->syncRoles($requestedRoles);
            } else {
                $userRoles = request()->user()->roles->pluck('name')->toArray();
                $allowedRoles = collect($requestedRoles)->filter(function ($role) use ($userRoles) {
                    return in_array($role, $userRoles);
                });
                $user->syncRoles($allowedRoles->toArray());
            }
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
        if ($user->id === request()->user()->id) {
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
        if ($user->id === request()->user()->id) {
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
