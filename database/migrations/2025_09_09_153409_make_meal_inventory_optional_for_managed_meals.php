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
        Schema::table('vouchers', function (Blueprint $table) {
            // Make meal_inventory_id nullable to support vouchers from managed meals
            // (not just donation-based meals)
            $table->uuid('meal_inventory_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            // Revert meal_inventory_id back to required
            $table->uuid('meal_inventory_id')->nullable(false)->change();
        });
    }
};
