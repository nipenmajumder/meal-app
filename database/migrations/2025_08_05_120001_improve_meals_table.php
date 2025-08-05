<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meals', function (Blueprint $table) {
            // Change from float to decimal for better precision
            $table->decimal('meal_count', 3, 1)->change();
            
            // Add composite index for better query performance
            $table->index(['user_id', 'date']);
            $table->index('date');
            
            // Add unique constraint to prevent duplicate entries
            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::table('meals', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'date']);
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['date']);
        });
    }
};
