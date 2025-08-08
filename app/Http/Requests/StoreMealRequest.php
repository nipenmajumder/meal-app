<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreMealRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create meals');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'date' => ['required', 'date', new \App\Rules\FutureDateRule],
            'meal_count' => ['required', new \App\Rules\MealCountRule],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select a user.',
            'user_id.exists' => 'The selected user is invalid.',
            'date.required' => 'Please enter a date.',
            'date.date' => 'Please enter a valid date.',
            'date.before_or_equal' => 'The date cannot be in the future.',
            'meal_count.required' => 'Please enter the meal count.',
            'meal_count.numeric' => 'The meal count must be a number.',
            'meal_count.min' => 'The meal count must be at least 0.',
            'meal_count.max' => 'The meal count cannot exceed 10.',
        ];
    }
}
