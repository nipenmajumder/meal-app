<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UtilityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class Utility extends Model
{
    /** @use HasFactory<UtilityFactory> */
    use HasFactory;

    protected $table = 'utilities';

    protected $fillable = [
        'user_id',
        'date',
        'amount',
    ];
}
