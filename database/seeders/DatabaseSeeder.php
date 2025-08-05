<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Deposit;
use App\Models\Meal;
use App\Models\ShoppingExpense;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

final class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create()->each(function (User $user) {
            $user->meals()->saveMany(
                Meal::factory()->count(rand(1, 10))->make()
            );
            $user->deposits()->saveMany(
                Deposit::factory()->count(rand(1, 5))->make()
            );
            $user->shoppingExpenses()->saveMany(
                ShoppingExpense::factory()->count(rand(1, 5))->make()
            );
        });
    }
}
