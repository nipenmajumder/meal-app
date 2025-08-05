<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ShoppingExpense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShoppingExpense>
 */
final class ShoppingExpenseFactory extends Factory
{
    protected $model = ShoppingExpense::class;

    public function definition(): array
    {
        return [
            'amount' => $this->faker->randomFloat(2, 50, 300),
            'date' => $this->faker->dateTimeThisMonth(),
        ];
    }
}
