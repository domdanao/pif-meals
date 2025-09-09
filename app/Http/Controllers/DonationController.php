<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\MealInventory;
use App\Models\User;
use App\Services\MagpiePaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DonationController extends Controller
{
    public function __construct(
        private MagpiePaymentService $magpiePaymentService
    ) {}

    /**
     * Show the donation page
     */
    public function show()
    {
        // Get some stats for the donation page
        $stats = [
            'total_donations_received' => Donation::completed()->sum('amount'),
            'total_meals_donated' => Donation::completed()->sum('meal_count'),
            'total_donors' => Donation::completed()->distinct('donor_id')->count(),
            'meals_available' => MealInventory::where('status', 'available')->count(),
        ];

        return Inertia::render('donate', [
            'stats' => $stats,
        ]);
    }

    /**
     * Process the donation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email|max:255',
            'donor_phone' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:65', // Minimum one meal
            'meal_count' => 'required|integer|min:1',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Additional business logic validation
        $mealPrice = 65.00; // Price per meal
        $expectedMinAmount = $request->meal_count * $mealPrice;

        if ($request->amount < $expectedMinAmount) {
            return back()->withErrors([
                'amount' => "Minimum amount for {$request->meal_count} meal(s) is P{$expectedMinAmount}",
            ])->withInput();
        }

        try {
            DB::beginTransaction();

            // Find or create donor user
            $donor = User::where('email', $request->donor_email)->first();

            if (! $donor) {
                $donor = User::create([
                    'name' => $request->donor_name,
                    'email' => $request->donor_email,
                    'phone' => $request->donor_phone,
                    'password' => bcrypt(Str::random(32)), // Generate random password for donor-only users
                    'role' => 'donor',
                    'is_active' => true,
                ]);
            }

            // Create the donation
            $donation = Donation::create([
                'donor_id' => $donor->id,
                'amount' => $request->amount,
                'meal_count' => $request->meal_count,
                'payment_method' => 'magpie_checkout', // Will be handled by Magpie
                'payment_status' => 'pending',
            ]);

            // Create Magpie checkout session
            $checkoutSession = $this->magpiePaymentService->createCheckoutSession($donation);

            DB::commit();

            Log::info('Donation created, redirecting to Magpie checkout', [
                'donation_id' => $donation->id,
                'checkout_url' => $checkoutSession['url'] ?? 'unknown',
            ]);

            // Redirect to Magpie checkout page (use Inertia external redirect helper)
            return Inertia::location($checkoutSession['url']);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating donation or checkout session', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password']),
            ]);

            // Show verbose error for debugging (remove in production)
            $errorMessage = 'Error: '.$e->getMessage();
            if ($e->getPrevious()) {
                $errorMessage .= ' | Previous: '.$e->getPrevious()->getMessage();
            }
            $errorMessage .= ' | File: '.$e->getFile().':'.$e->getLine();

            return back()->withErrors(['error' => $errorMessage])->withInput();
        }
    }

    /**
     * Handle successful payment return from Magpie
     */
    public function paymentSuccess(Donation $donation)
    {
        try {
            Log::info('Payment success callback received', [
                'donation_id' => $donation->id,
                'current_payment_status' => $donation->payment_status,
                'amount' => $donation->amount,
                'session_id' => $donation->magpie_checkout_session_id,
            ]);

            // Process the payment completion with strict validation
            $paymentCompleted = $this->magpiePaymentService->processPaymentCompletion($donation);

            if ($paymentCompleted) {
                Log::info('Payment success processed and validated', [
                    'donation_id' => $donation->id,
                    'amount' => $donation->amount,
                    'final_status' => $donation->fresh()->payment_status,
                ]);

                return redirect()->route('donate.success', ['donation' => $donation->id])
                    ->with('success', 'Thank you for your generous donation!');
            } else {
                Log::warning('Payment success callback but payment not completed after validation', [
                    'donation_id' => $donation->id,
                    'current_status' => $donation->fresh()->payment_status,
                ]);

                return redirect()->route('donate')
                    ->with('warning', 'Payment is still being processed. You will receive a confirmation email shortly.');
            }

        } catch (\Exception $e) {
            Log::error('Error processing payment success', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('donate')
                ->with('error', 'There was an issue processing your payment. Please contact support if you were charged.');
        }
    }

    /**
     * Handle cancelled payment return from Magpie
     */
    public function paymentCancel(Donation $donation)
    {
        $this->magpiePaymentService->markPaymentCancelled($donation);

        Log::info('Payment cancelled by user', [
            'donation_id' => $donation->id,
        ]);

        return redirect()->route('donate')
            ->with('warning', 'Payment was cancelled. No charges were made. You can start a new donation anytime.');
    }

    /**
     * Handle Magpie webhooks
     */
    public function webhook(Request $request)
    {
        try {
            $webhookData = $request->all();

            Log::info('Magpie webhook received', [
                'event_type' => $webhookData['type'] ?? 'unknown',
                'webhook_id' => $webhookData['id'] ?? 'unknown',
            ]);

            $processed = $this->magpiePaymentService->processWebhook($webhookData);

            if ($processed) {
                return response()->json(['status' => 'success'], 200);
            } else {
                return response()->json(['status' => 'error'], 400);
            }

        } catch (\Exception $e) {
            Log::error('Error processing Magpie webhook', [
                'error' => $e->getMessage(),
                'webhook_data' => $request->all(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Show donation success page
     */
    public function success(Donation $donation)
    {
        // Ensure the donation is actually completed
        if ($donation->payment_status !== 'completed') {
            return redirect()->route('donate')
                ->with('error', 'Invalid donation status.');
        }

        return Inertia::render('donate-success', [
            'donation' => [
                'id' => $donation->id,
                'amount' => $donation->amount,
                'meal_count' => $donation->meal_count,
                'donor_name' => $donation->donor->name,
                'formatted_amount' => $donation->formatted_amount,
                'created_at' => $donation->created_at->format('M j, Y g:i A'),
                'payment_completed_at' => $donation->payment_completed_at?->format('M j, Y g:i A'),
            ],
        ]);
    }
}
