<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class MealCountRule implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            return;
        }

        $mealCount = (float) $value;

        // Check if it's a valid number
        if (! is_numeric($value)) {
            $fail('The :attribute must be a valid number.');

            return;
        }

        // Check range
        if ($mealCount < 0) {
            $fail('The :attribute cannot be negative.');

            return;
        }

        if ($mealCount > 10) {
            $fail('The :attribute cannot exceed 10 meals.');

            return;
        }

        // Check if it's in 0.5 increments
        if (fmod($mealCount * 2, 1) !== 0.0) {
            $fail('The :attribute must be in 0.5 increments (e.g., 1, 1.5, 2).');
        }
    }
}
