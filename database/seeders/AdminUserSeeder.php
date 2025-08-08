<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user if it doesn't exist
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@meal-app.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'status' => 1,
            ]
        );

        // Assign Admin role
        if (! $adminUser->hasRole('Admin')) {
            $adminUser->assignRole('Admin');
        }

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@meal-app.com');
        $this->command->info('Password: password123');
    }
}
