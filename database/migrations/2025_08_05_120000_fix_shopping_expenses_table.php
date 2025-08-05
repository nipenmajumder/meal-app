<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shopping_expenses', function (Blueprint $table) {
            // Fix decimal precision for amount (was missing decimal places)
            $table->decimal('amount', 10, 2)->change();
            
            // Add description column if it doesn't exist
            if (!Schema::hasColumn('shopping_expenses', 'description')) {
                $table->string('description')->nullable()->after('amount');
            }
            
            // Add indexes for better performance
            $table->index(['user_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::table('shopping_expenses', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['date']);
        });
    }
};
