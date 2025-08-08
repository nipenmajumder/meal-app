<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class FutureDateRule implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            return;
        }

        $date = \Carbon\Carbon::parse($value);
        $today = \Carbon\Carbon::today();

        if ($date->isAfter($today)) {
            $fail('The :attribute cannot be in the future.');
        }
    }
}
