<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilities', function (Blueprint $table) {
            // Add missing columns and constraints
            $table->decimal('amount', 10, 2)->change();
            $table->date('date')->change();
            
            // Add user relationship
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Add indexes
            $table->index(['user_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::table('utilities', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['date']);
        });
    }
};
