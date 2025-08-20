<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Optimize meals table queries
        Schema::table('meals', function (Blueprint $table) {
            // Already has: user_id_date_index, date_index, user_id_date_unique
            // Add composite index for common date range queries
            $table->index(['date', 'meal_count'], 'meals_date_meal_count_index');
        });

        // Optimize deposits table queries
        Schema::table('deposits', function (Blueprint $table) {
            // Already has: user_id_date_index, date_index
            // Add composite index for amount-based queries
            $table->index(['date', 'amount'], 'deposits_date_amount_index');
        });

        // Optimize shopping_expenses table queries
        Schema::table('shopping_expenses', function (Blueprint $table) {
            // Already has: user_id_date_index, date_index
            // Add composite index for amount-based queries
            $table->index(['date', 'amount'], 'shopping_expenses_date_amount_index');
        });

        // Optimize utilities table queries
        Schema::table('utilities', function (Blueprint $table) {
            // Already has: user_id_date_index, date_index
            // Add composite index for amount-based queries
            $table->index(['date', 'amount'], 'utilities_date_amount_index');
        });

        // Optimize users table for role-based queries
        Schema::table('users', function (Blueprint $table) {
            // Already has: email_unique, status_index
            // Add composite index for name searches with status
            $table->index(['status', 'name'], 'users_status_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meals', function (Blueprint $table) {
            $table->dropIndex('meals_date_meal_count_index');
        });

        Schema::table('deposits', function (Blueprint $table) {
            $table->dropIndex('deposits_date_amount_index');
        });

        Schema::table('shopping_expenses', function (Blueprint $table) {
            $table->dropIndex('shopping_expenses_date_amount_index');
        });

        Schema::table('utilities', function (Blueprint $table) {
            $table->dropIndex('utilities_date_amount_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_status_name_index');
        });
    }
};
