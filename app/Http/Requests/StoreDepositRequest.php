<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreDepositRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'date' => ['required', 'date', 'before_or_equal:today'],
            'amount' => ['required', 'numeric', 'min:0', 'max:99999.99'],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select a user.',
            'user_id.exists' => 'The selected user is invalid.',
            'date.required' => 'Please provide a date.',
            'date.date' => 'Please provide a valid date.',
            'date.before_or_equal' => 'Date cannot be in the future.',
            'amount.required' => 'Please provide an amount.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount cannot be negative.',
            'amount.max' => 'Amount cannot exceed 99,999.99.',
        ];
    }
}
