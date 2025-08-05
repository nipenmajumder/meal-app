<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:manage roles')->only(['index', 'show']);
        $this->middleware('can:create roles')->only(['create', 'store']);
        $this->middleware('can:edit roles')->only(['edit', 'update']);
        $this->middleware('can:delete roles')->only('destroy');
        $this->middleware('can:assign permissions')->only(['permissions', 'updatePermissions']);
    }

    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        $roles = Role::with('permissions')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($request->sort ?? 'name', $request->direction ?? 'asc')
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        $permissions = Permission::all();
        
        // Create role permissions mapping for all roles (not just paginated ones)
        $allRoles = Role::with('permissions')->get();
        $rolePermissions = [];
        foreach ($allRoles as $role) {
            $rolePermissions[$role->id] = $role->permissions->pluck('id')->toArray();
        }

        return Inertia::render('roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
            'filters' => $request->only(['search']),
            'can' => [
                'create_roles' => request()->user()->can('create roles'),
                'edit_roles' => request()->user()->can('edit roles'),
                'delete_roles' => request()->user()->can('delete roles'),
                'assign_permissions' => request()->user()->can('assign permissions'),
                'manage_roles' => request()->user()->can('manage roles'),
            ],
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->permissions) {
            $permissions = Permission::whereIn('id', $request->permissions)->get();
            $role->syncPermissions($permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $role->update([
            'name' => $request->name,
        ]);

        if ($request->has('permissions')) {
            $permissions = Permission::whereIn('id', $request->permissions)->get();
            $role->syncPermissions($permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deletion of certain system roles
        if (in_array($role->name, ['super-admin', 'admin'])) {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete system roles.');
        }

        // Check if role has users assigned
        if ($role->users()->count() > 0) {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete role that has users assigned to it.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Show the permissions management page.
     */
    public function permissions(): Response
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        // Create role permissions mapping
        $rolePermissions = [];
        foreach ($roles as $role) {
            $rolePermissions[$role->id] = $role->permissions->pluck('id')->toArray();
        }

        return Inertia::render('roles/Permissions', [
            'roles' => $roles,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
            'can' => [
                'manage_roles' => request()->user()->can('manage roles'),
                'assign_permissions' => request()->user()->can('assign permissions'),
            ],
        ]);
    }

    /**
     * Update permissions for multiple roles.
     */
    public function updatePermissions(Request $request): RedirectResponse
    {
        $request->validate([
            'rolePermissions' => 'required|array',
            'rolePermissions.*' => 'array',
            'rolePermissions.*.*' => 'exists:permissions,id',
        ]);

        foreach ($request->rolePermissions as $roleId => $permissionIds) {
            $role = Role::findOrFail($roleId);
            
            // Prevent modification of super-admin role unless user is super-admin
            if ($role->name === 'super-admin' && !request()->user()->hasRole('super-admin')) {
                continue;
            }

            $permissions = Permission::whereIn('id', $permissionIds)->get();
            $role->syncPermissions($permissions);
        }

        return redirect()->route('roles.permissions')
            ->with('success', 'Permissions updated successfully.');
    }

    /**
     * Get permissions for a specific role (AJAX endpoint).
     */
    public function rolePermissions(Role $role)
    {
        $role->load('permissions');
        $allPermissions = Permission::all();

        return response()->json([
            'role' => $role,
            'permissions' => $allPermissions,
            'rolePermissions' => $role->permissions->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update permissions for a specific role (AJAX endpoint).
     */
    public function updateRolePermissions(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Prevent modification of super-admin role unless user is super-admin
        if ($role->name === 'super-admin' && !request()->user()->hasRole('super-admin')) {
            return redirect()->back()->with('error', 'You cannot modify super-admin permissions.');
        }

        $permissions = Permission::whereIn('id', $request->permissions ?? [])->get();
        $role->syncPermissions($permissions);

        return redirect()->back()
            ->with('success', "Permissions updated for {$role->name} role.");
    }
}
