<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view users' => 'View user profiles and listings',
            'create users' => 'Create new user accounts',
            'edit users' => 'Edit user profiles and information',
            'delete users' => 'Delete user accounts',
            'manage user status' => 'Activate or deactivate user accounts',
            'assign roles' => 'Assign roles to users',
            'manage roles' => 'View and manage system roles',
            'create roles' => 'Create new roles',
            'edit roles' => 'Edit existing roles',
            'delete roles' => 'Delete roles',
            'assign permissions' => 'Assign permissions to roles',
            'view deposits' => 'View deposit records',
            'create deposits' => 'Create new deposit records',
            'edit deposits' => 'Edit existing deposits',
            'delete deposits' => 'Delete deposit records',
            'export deposits' => 'Export deposit data',
            'import deposits' => 'Import deposit data from files',
            'view shopping expenses' => 'View shopping expense records',
            'create shopping expenses' => 'Create new shopping expenses',
            'edit shopping expenses' => 'Edit existing shopping expenses',
            'delete shopping expenses' => 'Delete shopping expense records',
            'export shopping expenses' => 'Export shopping expense data',
            'view meals' => 'View meal records',
            'create meals' => 'Create new meal records',
            'edit meals' => 'Edit existing meals',
            'delete meals' => 'Delete meal records',
            'export meals' => 'Export meal data',
            'bulk create meals' => 'Create multiple meals at once',
        ];

        foreach ($permissions as $permission => $description) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['description' => $description]
            );
        }

        // Create roles and assign permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'delete users',
            'manage user status',
            'assign roles',
            'manage roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign permissions',
            'view deposits',
            'create deposits',
            'edit deposits',
            'delete deposits',
            'export deposits',
            'import deposits',
            'view shopping expenses',
            'create shopping expenses',
            'edit shopping expenses',
            'delete shopping expenses',
            'export shopping expenses',
            'view meals',
            'create meals',
            'edit meals',
            'delete meals',
            'export meals',
            'bulk create meals',
        ]);

        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $managerRole->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'manage user status',
            'view deposits',
            'create deposits',
            'edit deposits',
            'export deposits',
            'view shopping expenses',
            'create shopping expenses',
            'edit shopping expenses',
            'export shopping expenses',
            'view meals',
            'create meals',
            'edit meals',
            'export meals',
            'bulk create meals',
        ]);

        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions([
            'view users',
            'view deposits',
            'create deposits',
            'view shopping expenses',
            'create shopping expenses',
            'view meals',
            'create meals',
        ]);

        // Create super admin role with all permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdminRole->syncPermissions(Permission::all());
    }
}
