<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clear existing session data to avoid conflicts
        DB::table('sessions')->truncate();

        Schema::table('sessions', function (Blueprint $table) {
            // Drop the existing foreign key and index first
            $table->dropIndex(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('sessions', function (Blueprint $table) {
            // Add UUID user_id column
            $table->uuid('user_id')->nullable()->after('id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear session data
        DB::table('sessions')->truncate();

        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        Schema::table('sessions', function (Blueprint $table) {
            // Restore original foreignId structure
            $table->foreignId('user_id')->nullable()->after('id')->index();
        });
    }
};
