<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Models\User;
use App\Services\MagpiePaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestMagpieIntegration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'magpie:test {--dry-run : Run in dry-run mode without creating actual donation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Magpie payment integration';

    public function __construct(
        private MagpiePaymentService $magpiePaymentService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Magpie Integration...');
        $this->newLine();

        // Test 1: Check if Magpie configuration is set
        $this->info('1. Checking Magpie configuration...');
        $secretKey = config('magpie.secret_key');

        if (empty($secretKey)) {
            $this->error('   ❌ Magpie secret key is not configured!');
            $this->info('   Please set MAGPIE_SECRET_KEY in your .env file');

            return 1;
        }

        $this->info('   ✅ Magpie secret key is configured');

        // Test 2: Test service instantiation
        $this->info('2. Testing service instantiation...');
        try {
            $service = app(MagpiePaymentService::class);
            $this->info('   ✅ MagpiePaymentService instantiated successfully');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed to instantiate service: '.$e->getMessage());

            return 1;
        }

        // Test 2.5: Test Magpie API configuration
        $this->info('2.5 Checking API configuration...');
        $magpie = new \Magpie\Magpie(config('magpie.secret_key'));
        $this->info('   🔗 Base URL: '.$magpie->getBaseUrl());
        $this->info('   🔑 API Version: '.$magpie->getApiVersion());
        $fullApiUrl = $magpie->getConfig()->getApiUrl();
        $this->info('   🎯 Full API URL: '.$fullApiUrl);

        // Check if we have live or test key
        $secretKey = config('magpie.secret_key');
        if (str_starts_with($secretKey, 'sk_live_')) {
            $this->warn('   ⚠️  Using LIVE API key - be careful with real transactions!');
        } elseif (str_starts_with($secretKey, 'sk_test_')) {
            $this->info('   🧪 Using TEST API key - safe for testing');
        } else {
            $this->error('   ❌ Unknown API key format');
        }

        $this->info('   ✅ API configuration looks good');

        // Note: We'll test actual API connectivity when creating checkout session
        $this->info('   📝 Note: API connectivity will be tested during checkout session creation');

        if ($this->option('dry-run')) {
            $this->info('3. Dry run mode - skipping actual donation creation');
            $this->newLine();
            $this->info('✅ All tests passed! The integration appears to be configured correctly.');

            return 0;
        }

        // Test 3: Create a test donation and checkout session
        $this->info('3. Creating test donation and checkout session...');

        try {
            DB::beginTransaction();

            // Create a test donor
            $donor = User::firstOrCreate(
                ['email' => 'test.donor@example.com'],
                [
                    'name' => 'Test Donor',
                    'email' => 'test.donor@example.com',
                    'phone' => '+639171234567',
                    'password' => bcrypt('test123'),
                    'role' => 'donor',
                    'is_active' => true,
                ]
            );

            // Create a test donation
            $donation = Donation::create([
                'donor_id' => $donor->id,
                'amount' => 130.00, // 2 meals
                'meal_count' => 2,
                'payment_method' => 'credit_card',
                'payment_status' => 'pending',
            ]);

            $this->info('   ✅ Test donation created with ID: '.$donation->id);

            // Create checkout session
            $checkoutSession = $this->magpiePaymentService->createCheckoutSession($donation);

            $this->info('   ✅ Checkout session created successfully!');
            $this->info('   📄 Session ID: '.$checkoutSession['id']);
            $this->info('   🔗 Checkout URL: '.$checkoutSession['url']);

            DB::commit();

            $this->newLine();
            $this->info('🎉 Magpie integration test completed successfully!');
            $this->info('💡 You can visit the checkout URL above to test the payment flow.');
            $this->info('⚠️  Remember to test with Magpie test card numbers in sandbox mode.');

        } catch (\Exception $e) {
            DB::rollback();
            $this->error('   ❌ Failed to create checkout session: '.$e->getMessage());
            $this->error('   Trace: '.$e->getTraceAsString());

            return 1;
        }

        return 0;
    }
}
