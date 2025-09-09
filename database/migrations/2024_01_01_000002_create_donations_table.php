<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('donor_id');
            $table->decimal('amount', 10, 2);
            $table->integer('meal_count');
            $table->string('payment_method', 50);
            $table->string('payment_reference')->nullable();
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])
                ->default('pending');

            $table->timestamps();

            // Foreign keys
            $table->foreign('donor_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
