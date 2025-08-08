<?php

declare(strict_types=1);

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
        Schema::create('utilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->date('date'); // Changed from month to date for consistency
            $table->decimal('amount', 10, 2); // Added decimal precision
            $table->timestamps();

            // Add user relationship
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Add indexes for better performance
            $table->index(['user_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilities');
    }
};
