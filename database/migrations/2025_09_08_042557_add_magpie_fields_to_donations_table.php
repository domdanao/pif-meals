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
        Schema::table('donations', function (Blueprint $table) {
            $table->string('magpie_checkout_session_id')->nullable()->after('payment_reference');
            $table->string('magpie_payment_intent_id')->nullable()->after('magpie_checkout_session_id');
            $table->json('magpie_metadata')->nullable()->after('magpie_payment_intent_id');
            $table->timestamp('payment_completed_at')->nullable()->after('payment_status');

            $table->index('magpie_checkout_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropIndex(['magpie_checkout_session_id']);
            $table->dropColumn([
                'magpie_checkout_session_id',
                'magpie_payment_intent_id',
                'magpie_metadata',
                'payment_completed_at',
            ]);
        });
    }
};
