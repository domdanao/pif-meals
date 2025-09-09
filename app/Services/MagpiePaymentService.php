<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Donation;
use App\Models\SystemMetric;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Magpie\Magpie;

class MagpiePaymentService
{
    private Magpie $magpie;

    public function __construct()
    {
        $this->magpie = new Magpie(config('magpie.secret_key'));
    }

    /**
     * Create checkout session using correct API endpoint
     * (SDK has wrong base URL - should be api.pay.magpie.im not new.pay.magpie.im)
     */
    private function createCheckoutSessionDirect(array $sessionData): array
    {
        try {
            Log::info('Making checkout session request to Magpie API', [
                'url' => 'https://api.pay.magpie.im/',
                'data' => $sessionData,
            ]);

            // Make direct HTTP call using Guzzle to correct Magpie API
            $client = new \GuzzleHttp\Client;

            $response = $client->post('https://api.pay.magpie.im/', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => 'Basic '.base64_encode(config('magpie.secret_key').':'),
                ],
                'json' => $sessionData,
                'timeout' => 30,
            ]);

            $responseBody = json_decode($response->getBody()->getContents(), true);

            Log::info('Magpie API response received', [
                'status' => $response->getStatusCode(),
                'response' => $responseBody,
            ]);

            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                // Map Magpie API response to expected format
                return [
                    'id' => $responseBody['id'] ?? null,
                    'url' => $responseBody['payment_url'] ?? null, // Map payment_url to url
                    'payment_url' => $responseBody['payment_url'] ?? null,
                    'status' => $responseBody['status'] ?? null,
                    'raw_response' => $responseBody,
                ];
            }

            throw new \Exception('Magpie API returned non-success status: '.$response->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Magpie checkout session request failed', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'data' => $sessionData,
            ]);
            throw $e;
        }
    }

    /**
     * Create a Magpie checkout session for a donation
     */
    public function createCheckoutSession(Donation $donation): array
    {
        try {
            $lineItems = [
                [
                    'name' => "Donation - {$donation->meal_count} ".($donation->meal_count === 1 ? 'Meal' : 'Meals'),
                    'amount' => (int) ($donation->amount * 100), // Convert to centavos
                    'quantity' => 1,
                    'description' => "Donation for {$donation->meal_count} meals to PIF Meals program",
                ],
            ];

            $sessionData = [
                'line_items' => $lineItems,
                'success_url' => URL::route('donation.payment.success', ['donation' => $donation->id]),
                'cancel_url' => URL::route('donation.payment.cancel', ['donation' => $donation->id]),
                'customer_email' => $donation->donor->email,
                'expires_at' => time() + 3600, // Expire in 1 hour
                'currency' => 'PHP',
                'payment_method_types' => ['card', 'qrph'],
                'submit_type' => 'pay',
                'metadata' => [
                    'donation_id' => $donation->id,
                    'donor_id' => $donation->donor_id,
                    'meal_count' => $donation->meal_count,
                    'app_name' => config('app.name'),
                ],
            ];

            // Use direct HTTP call to correct Magpie API endpoint
            $session = $this->createCheckoutSessionDirect($sessionData);

            // Update donation with session ID
            $donation->update([
                'magpie_checkout_session_id' => $session['id'],
                'magpie_metadata' => $session,
            ]);

            Log::info('Magpie checkout session created', [
                'donation_id' => $donation->id,
                'session_id' => $session['id'],
                'amount' => $donation->amount,
            ]);

            return $session;

        } catch (\Exception $e) {
            Log::error('Failed to create Magpie checkout session', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Retrieve and verify a checkout session using direct API call
     * (SDK has wrong base URL - should be api.pay.magpie.im not new.pay.magpie.im)
     */
    public function retrieveCheckoutSession(string $sessionId): array
    {
        try {
            Log::info('Retrieving Magpie checkout session', [
                'session_id' => $sessionId,
                'url' => 'https://api.pay.magpie.im/'.$sessionId,
            ]);

            // Make direct HTTP call using Guzzle to correct Magpie API
            $client = new \GuzzleHttp\Client;

            $response = $client->get('https://api.pay.magpie.im/'.$sessionId, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => 'Basic '.base64_encode(config('magpie.secret_key').':'),
                ],
                'timeout' => 30,
            ]);

            $sessionData = json_decode($response->getBody()->getContents(), true);

            Log::info('Retrieved Magpie checkout session', [
                'session_id' => $sessionId,
                'payment_status' => $sessionData['payment_status'] ?? 'unknown',
                'status_code' => $response->getStatusCode(),
            ]);

            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                return $sessionData;
            }

            throw new \Exception('Magpie API returned non-success status: '.$response->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Failed to retrieve Magpie checkout session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'class' => get_class($e),
            ]);

            throw $e;
        }
    }

    /**
     * Process payment completion with strict validation
     */
    public function processPaymentCompletion(Donation $donation, ?array $sessionData = null): bool
    {
        try {
            // Prevent processing if already completed
            if ($donation->payment_status === 'completed') {
                Log::info('Payment already completed, skipping', [
                    'donation_id' => $donation->id,
                ]);

                return true;
            }

            // Prevent processing if donation was cancelled/failed (race condition protection)
            if ($donation->payment_status === 'failed') {
                Log::warning('Attempted to complete payment for cancelled/failed donation', [
                    'donation_id' => $donation->id,
                    'current_status' => $donation->payment_status,
                ]);

                return false;
            }

            // Only process payments that are currently pending
            if ($donation->payment_status !== 'pending') {
                Log::warning('Attempted to process payment completion for non-pending donation', [
                    'donation_id' => $donation->id,
                    'current_status' => $donation->payment_status,
                ]);

                return false;
            }

            // If no session data provided, fetch it from Magpie API
            if (! $sessionData && $donation->magpie_checkout_session_id) {
                Log::info('Fetching session data from Magpie API for verification', [
                    'donation_id' => $donation->id,
                    'session_id' => $donation->magpie_checkout_session_id,
                ]);
                $sessionData = $this->retrieveCheckoutSession($donation->magpie_checkout_session_id);
            }

            if (! $sessionData) {
                Log::warning('No session data available for payment completion', [
                    'donation_id' => $donation->id,
                ]);

                return false;
            }

            $paymentStatus = $sessionData['payment_status'] ?? 'unknown';
            $sessionId = $sessionData['id'] ?? null;

            // Strict validation: only mark as completed if payment_status is explicitly 'paid'
            if ($paymentStatus === 'paid') {
                // Additional validation: check that session ID matches
                if ($sessionId !== $donation->magpie_checkout_session_id) {
                    Log::error('Session ID mismatch during payment completion', [
                        'donation_id' => $donation->id,
                        'expected_session_id' => $donation->magpie_checkout_session_id,
                        'received_session_id' => $sessionId,
                    ]);

                    return false;
                }

                // Validate amount matches (convert to centavos for comparison)
                $expectedAmount = (int) ($donation->amount * 100);
                $receivedAmount = $sessionData['amount_total'] ?? 0;

                if ($expectedAmount !== $receivedAmount) {
                    Log::error('Amount mismatch during payment completion', [
                        'donation_id' => $donation->id,
                        'expected_amount' => $expectedAmount,
                        'received_amount' => $receivedAmount,
                    ]);

                    return false;
                }

                $donation->update([
                    'payment_status' => 'completed',
                    'payment_reference' => $sessionId,
                    'magpie_payment_intent_id' => $sessionData['payment_intent'] ?? null,
                    'payment_completed_at' => now(),
                    'magpie_metadata' => $sessionData,
                ]);

                // Create meal inventory entries for each meal donated
                $this->createMealInventoryEntries($donation);

                // Update system metrics
                $this->updateSystemMetrics($donation);

                Log::info('Payment completed successfully with validation', [
                    'donation_id' => $donation->id,
                    'session_id' => $donation->magpie_checkout_session_id,
                    'amount' => $donation->amount,
                    'meal_count' => $donation->meal_count,
                    'payment_status' => $paymentStatus,
                ]);

                return true;
            }

            // Handle other payment statuses explicitly
            switch ($paymentStatus) {
                case 'unpaid':
                case 'canceled':
                case 'expired':
                    Log::info('Payment not completed - status indicates failure/cancellation', [
                        'donation_id' => $donation->id,
                        'payment_status' => $paymentStatus,
                    ]);

                    // Update donation status if it's not already failed
                    if ($donation->payment_status === 'pending') {
                        $donation->update(['payment_status' => 'failed']);
                    }
                    break;

                default:
                    Log::info('Payment status unclear, keeping as pending', [
                        'donation_id' => $donation->id,
                        'payment_status' => $paymentStatus,
                    ]);
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to process payment completion', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $donation->update([
                'payment_status' => 'failed',
            ]);

            return false;
        }
    }

    /**
     * Mark payment as cancelled
     */
    public function markPaymentCancelled(Donation $donation): void
    {
        // Only mark as cancelled if currently pending (prevent race conditions)
        if ($donation->payment_status !== 'pending') {
            Log::warning('Attempted to cancel donation that is not pending', [
                'donation_id' => $donation->id,
                'current_status' => $donation->payment_status,
                'session_id' => $donation->magpie_checkout_session_id,
            ]);

            return;
        }

        $donation->update([
            'payment_status' => 'failed', // Using 'failed' as we don't have 'cancelled' in enum
            'payment_completed_at' => null, // Ensure no completion time is set
            'payment_reference' => null, // Clear any payment reference
            'magpie_payment_intent_id' => null, // Clear payment intent
        ]);

        Log::info('Payment marked as cancelled', [
            'donation_id' => $donation->id,
            'session_id' => $donation->magpie_checkout_session_id,
            'previous_status' => 'pending',
        ]);
    }

    /**
     * Update system metrics after successful donation
     */
    private function updateSystemMetrics(Donation $donation): void
    {
        try {
            // Update total donations received (amount)
            $currentDonations = SystemMetric::getMetric('total_donations_received');
            SystemMetric::setMetric('total_donations_received', $currentDonations + (int) ($donation->amount * 100)); // Store in centavos

            // Update total meals available
            $currentMeals = SystemMetric::getMetric('total_meals_available');
            SystemMetric::setMetric('total_meals_available', $currentMeals + $donation->meal_count);

            // Update total donors count (this is approximate - counts unique donations instead of unique donors)
            $totalCompletedDonations = Donation::completed()->count();
            SystemMetric::setMetric('total_donors_count', $totalCompletedDonations);

            Log::info('System metrics updated after donation', [
                'donation_id' => $donation->id,
                'donation_amount' => $donation->amount,
                'meal_count' => $donation->meal_count,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update system metrics', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);
            // Don't throw - this shouldn't fail the donation completion
        }
    }

    /**
     * Create meal inventory entries for completed donations with strict validation
     */
    private function createMealInventoryEntries(Donation $donation): void
    {
        // Triple check: only create for truly completed donations
        if ($donation->payment_status !== 'completed') {
            Log::warning('Attempted to create meal inventory for non-completed donation', [
                'donation_id' => $donation->id,
                'payment_status' => $donation->payment_status,
            ]);

            return;
        }

        // Check if meal inventory already exists
        $existingCount = $donation->mealInventory()->count();
        if ($existingCount > 0) {
            Log::info('Meal inventory already exists, skipping creation', [
                'donation_id' => $donation->id,
                'existing_count' => $existingCount,
                'expected_count' => $donation->meal_count,
            ]);

            return;
        }

        // Create meal inventory entries
        try {
            for ($i = 0; $i < $donation->meal_count; $i++) {
                $donation->mealInventory()->create([
                    'status' => 'available',
                ]);
            }

            // Verify creation was successful
            $createdCount = $donation->mealInventory()->count();
            if ($createdCount !== $donation->meal_count) {
                Log::error('Meal inventory creation count mismatch', [
                    'donation_id' => $donation->id,
                    'expected_count' => $donation->meal_count,
                    'created_count' => $createdCount,
                ]);
            } else {
                Log::info('Meal inventory entries created successfully', [
                    'donation_id' => $donation->id,
                    'meal_count' => $donation->meal_count,
                    'created_count' => $createdCount,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create meal inventory entries', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Process webhook data from Magpie
     */
    public function processWebhook(array $webhookData): bool
    {
        try {
            $eventType = $webhookData['type'] ?? null;
            $sessionData = $webhookData['data']['object'] ?? null;

            if (! $sessionData) {
                Log::warning('Webhook received without session data', $webhookData);

                return false;
            }

            $sessionId = $sessionData['id'] ?? null;
            if (! $sessionId) {
                Log::warning('Webhook received without session ID', $webhookData);

                return false;
            }

            // Find donation by session ID
            $donation = Donation::where('magpie_checkout_session_id', $sessionId)->first();
            if (! $donation) {
                Log::warning('No donation found for webhook session ID', [
                    'session_id' => $sessionId,
                    'event_type' => $eventType,
                ]);

                return false;
            }

            Log::info('Processing Magpie webhook', [
                'event_type' => $eventType,
                'session_id' => $sessionId,
                'donation_id' => $donation->id,
            ]);

            switch ($eventType) {
                case 'checkout.session.completed':
                    return $this->processPaymentCompletion($donation, $sessionData);

                case 'checkout.session.expired':
                    $donation->update(['payment_status' => 'failed']);
                    Log::info('Checkout session expired', ['donation_id' => $donation->id]);

                    return true;

                default:
                    Log::info('Unhandled webhook event type', [
                        'event_type' => $eventType,
                        'donation_id' => $donation->id,
                    ]);

                    return true;
            }

        } catch (\Exception $e) {
            Log::error('Failed to process Magpie webhook', [
                'error' => $e->getMessage(),
                'webhook_data' => $webhookData,
            ]);

            return false;
        }
    }
}
