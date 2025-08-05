<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ShoppingExpenseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ShoppingExpense extends Model
{
    /** @use HasFactory<ShoppingExpenseFactory> */
    use HasFactory;

    protected $table = 'shopping_expenses';

    protected $fillable = [
        'user_id',
        'date',
        'amount',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
