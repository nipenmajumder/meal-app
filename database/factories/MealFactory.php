<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Meal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Meal>
 */
final class MealFactory extends Factory
{
    protected $model = Meal::class;

    public function definition(): array
    {
        return [
            'date' => $this->faker->dateTimeThisMonth(),
            'meal_count' => $this->faker->numberBetween(1, 5),
        ];
    }
}
