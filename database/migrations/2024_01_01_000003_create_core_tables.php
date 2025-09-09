<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Meal inventory table
        Schema::create('meal_inventory', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('donation_id');
            $table->enum('status', ['available', 'reserved', 'claimed', 'expired'])
                ->default('available');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('donation_id')->references('id')->on('donations')->onDelete('cascade');
            $table->index('status');
        });

        // Time slots table
        Schema::create('time_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->time('start_time');
            $table->time('end_time');
            $table->string('display_name', 50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Vouchers table
        Schema::create('vouchers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference_number', 20)->unique();
            $table->uuid('student_id');
            $table->uuid('meal_inventory_id');
            $table->uuid('time_slot_id');

            // Scheduling
            $table->date('scheduled_date');

            // Status tracking
            $table->enum('status', ['active', 'claimed', 'expired', 'cancelled'])
                ->default('active');
            $table->timestamp('claimed_at')->nullable();
            $table->uuid('claimed_by_staff_id')->nullable();

            // Student info snapshot (for staff reference)
            $table->string('student_name');
            $table->string('student_course', 100)->nullable();
            $table->string('student_year', 10)->nullable();
            $table->string('student_phone', 20)->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('meal_inventory_id')->references('id')->on('meal_inventory')->onDelete('cascade');
            $table->foreign('time_slot_id')->references('id')->on('time_slots')->onDelete('cascade');
            $table->foreign('claimed_by_staff_id')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('reference_number');
            $table->index(['student_id', 'scheduled_date']);
            $table->index(['status', 'scheduled_date']);
        });

        // Pledges table
        Schema::create('pledges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('voucher_id');
            $table->enum('status', ['active', 'fulfilled', 'cancelled'])->default('active');
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('voucher_id')->references('id')->on('vouchers')->onDelete('cascade');
        });

        // Student documents table
        Schema::create('student_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('voucher_id')->nullable();
            $table->text('file_url');
            $table->string('file_type', 10);
            $table->integer('file_size')->nullable();
            $table->string('original_filename')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('voucher_id')->references('id')->on('vouchers')->onDelete('cascade');
        });

        // System metrics table
        Schema::create('system_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('metric_name', 50)->unique();
            $table->integer('metric_value')->default(0);
            $table->timestamp('last_updated')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_metrics');
        Schema::dropIfExists('student_documents');
        Schema::dropIfExists('pledges');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('time_slots');
        Schema::dropIfExists('meal_inventory');
    }
};
