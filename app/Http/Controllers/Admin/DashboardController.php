<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Pledge;
use App\Models\User;
use App\Models\Voucher;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get key metrics for the dashboard
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        // Available meals counts
        $availableMealsToday = Voucher::whereDate('scheduled_date', $today)
            ->where('status', 'active')
            ->count();

        $availableMealsTomorrow = Voucher::whereDate('scheduled_date', $tomorrow)
            ->where('status', 'active')
            ->count();

        // Pending claims (vouchers that should be claimed but haven't been)
        $pendingClaims = Voucher::where('scheduled_date', '<', $today)
            ->where('status', 'active')
            ->count();

        // Active pledges
        $activePledges = Pledge::where('status', 'active')->count();

        // Recent donations (last 7 days)
        $recentDonationsAmount = Donation::where('created_at', '>=', Carbon::now()->subDays(7))
            ->where('payment_status', 'completed')
            ->sum('amount');

        // Today's voucher schedule
        $todaysVouchers = Voucher::with(['student:id,name,course,year_level', 'timeSlot'])
            ->whereDate('scheduled_date', $today)
            ->orderBy('created_at')
            ->get()
            ->map(function ($voucher) {
                return [
                    'id' => $voucher->id,
                    'reference_number' => $voucher->reference_number,
                    'student_name' => $voucher->student_name,
                    'student_course' => $voucher->student_course,
                    'time_slot' => $voucher->timeSlot->display_name ?? 'N/A',
                    'status' => $voucher->status,
                    'created_at' => $voucher->created_at,
                ];
            });

        // Recent activity (last 10 voucher claims)
        $recentActivity = Voucher::with(['student:id,name', 'claimedByStaff:id,name'])
            ->where('status', 'claimed')
            ->orderBy('claimed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($voucher) {
                return [
                    'id' => $voucher->id,
                    'reference_number' => $voucher->reference_number,
                    'student_name' => $voucher->student_name,
                    'claimed_by' => $voucher->claimedByStaff->name ?? 'System',
                    'claimed_at' => $voucher->claimed_at,
                ];
            });

        // System health metrics
        $systemHealth = [
            'total_users' => User::count(),
            'total_vouchers_today' => Voucher::whereDate('created_at', $today)->count(),
            'total_donations_this_month' => Donation::whereMonth('created_at', now()->month)->count(),
            'database_status' => 'healthy', // You can add actual health checks here
        ];

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'available_meals_today' => $availableMealsToday,
                'available_meals_tomorrow' => $availableMealsTomorrow,
                'pending_claims' => $pendingClaims,
                'active_pledges' => $activePledges,
                'recent_donations_amount' => number_format($recentDonationsAmount, 2),
            ],
            'todays_vouchers' => $todaysVouchers,
            'recent_activity' => $recentActivity,
            'system_health' => $systemHealth,
        ]);
    }
}
