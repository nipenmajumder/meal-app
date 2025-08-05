<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\Utility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Utility>
 */
final class UtilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Utility::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 50, 300),
            'date' => $this->faker->dateTimeThisMonth(),
        ];
    }
}
