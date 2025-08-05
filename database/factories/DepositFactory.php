<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Deposit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deposit>
 */
final class DepositFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Deposit::class;

    public function definition(): array
    {
        return [
            'amount' => $this->faker->randomFloat(2, 500, 2500),
            'date' => $this->faker->dateTimeThisMonth(),
        ];
    }
}
