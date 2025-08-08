<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Dashboard
            'view dashboard',

            // Meals
            'view meals',
            'create meals',
            'edit meals',
            'delete meals',
            'bulk import meals',
            'export meals',

            // Deposits
            'view deposits',
            'create deposits',
            'edit deposits',
            'delete deposits',
            'bulk import deposits',
            'export deposits',

            // Shopping Expenses
            'view shopping expenses',
            'create shopping expenses',
            'edit shopping expenses',
            'delete shopping expenses',
            'export shopping expenses',

            // Utilities
            'view utilities',
            'create utilities',
            'edit utilities',
            'delete utilities',
            'export utilities',

            // Users
            'view users',
            'create users',
            'edit users',
            'delete users',
            'manage user status',

            // Roles & Permissions
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'manage permissions',

            // Reports & Analytics
            'view reports',
            'export reports',
            'view analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $mealManagerRole = Role::firstOrCreate(['name' => 'Meal Manager']);
        $memberRole = Role::firstOrCreate(['name' => 'Member']);

        // Assign permissions to roles

        // Admin gets all permissions
        $adminRole->syncPermissions(Permission::all());

        // Meal Manager gets most permissions except user/role management
        $mealManagerPermissions = Permission::query()
            ->whereNotIn('name', [
                'create users',
                'delete users',
                'view roles',
                'create roles',
                'edit roles',
                'delete roles',
                'manage permissions',
                'view users',
                'view roles',
                'view permissions',
            ])
            ->get();
        $mealManagerRole->syncPermissions($mealManagerPermissions);

        // Member gets only view permissions
        $memberPermissions = Permission::query()
            ->where('name', 'like', 'view %')
            ->whereNotIn('name', [
                'view users',
                'view roles',
                'view permissions',
            ])
            ->get();

        $memberRole->syncPermissions($memberPermissions);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
