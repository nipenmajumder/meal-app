<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\MealFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Meal extends Model
{
    /** @use HasFactory<MealFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'meal_count',
    ];

    protected $casts = [
        'date' => 'date',
        'meal_count' => 'decimal:1',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
