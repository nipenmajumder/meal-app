<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

final class DepositSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = \App\Models\User::active()->get();
        $currentMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        // Create deposits for each user for the current month
        foreach ($users as $user) {
            // Create 3-5 random deposits for each user this month
            $depositCount = rand(3, 5);
            
            for ($i = 0; $i < $depositCount; $i++) {
                $date = fake()->dateTimeBetween($currentMonth, $endOfMonth);
                
                \App\Models\Deposit::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'date' => $date->format('Y-m-d'),
                    ],
                    [
                        'amount' => fake()->randomFloat(2, 500, 2500),
                    ]
                );
            }
        }

        // Create some deposits for the previous month too
        $previousMonth = now()->subMonth();
        $startOfPreviousMonth = $previousMonth->startOfMonth();
        $endOfPreviousMonth = $previousMonth->endOfMonth();

        foreach ($users as $user) {
            $depositCount = rand(2, 4);
            
            for ($i = 0; $i < $depositCount; $i++) {
                $date = fake()->dateTimeBetween($startOfPreviousMonth, $endOfPreviousMonth);
                
                \App\Models\Deposit::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'date' => $date->format('Y-m-d'),
                    ],
                    [
                        'amount' => fake()->randomFloat(2, 400, 2000),
                    ]
                );
            }
        }
    }
}
