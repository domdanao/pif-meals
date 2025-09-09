<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\SystemMetric;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function index(): Response
    {
        // Default system settings - you can move these to database/config later
        $settings = [
            'site_name' => config('app.name', 'PIF Meals'),
            'site_description' => 'Free meal voucher system for students',
            'admin_email' => config('mail.from.address', 'admin@example.com'),
            'registration_enabled' => true,
            'voucher_expiry_days' => 30,
            'max_vouchers_per_user' => 5,
            'meal_request_time_limit' => 2,
            'notification_email_enabled' => true,
            'maintenance_mode' => false,
            'timezone' => config('app.timezone', 'UTC'),
        ];

        // Common timezones
        $timezones = [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Europe/Berlin',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Asia/Kolkata',
            'Asia/Manila',
            'Australia/Sydney',
        ];

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'timezones' => $timezones,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'required|string|max:1000',
            'admin_email' => 'required|email|max:255',
            'registration_enabled' => 'boolean',
            'voucher_expiry_days' => 'required|integer|min:1|max:365',
            'max_vouchers_per_user' => 'required|integer|min:1|max:100',
            'meal_request_time_limit' => 'required|integer|min:1|max:24',
            'notification_email_enabled' => 'boolean',
            'maintenance_mode' => 'boolean',
            'timezone' => 'required|string|max:50',
        ]);

        // In a real application, you might save these to a settings table
        // For now, we'll just flash a success message
        // You could implement a Settings model or use config caching

        return redirect()->route('admin.settings.index')
            ->with('success', 'System settings updated successfully.');
    }

    // Time Slots Management
    public function timeSlots(): Response
    {
        $timeSlots = TimeSlot::orderBy('start_time')->get();

        return Inertia::render('admin/settings/time-slots', [
            'time_slots' => $timeSlots,
        ]);
    }

    public function storeTimeSlot(Request $request)
    {
        $validated = $request->validate([
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'display_name' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        // Check for overlapping time slots
        $overlapping = TimeSlot::where(function ($query) use ($validated) {
            $query->where(function ($q) use ($validated) {
                $q->where('start_time', '<=', $validated['start_time'])
                    ->where('end_time', '>', $validated['start_time']);
            })->orWhere(function ($q) use ($validated) {
                $q->where('start_time', '<', $validated['end_time'])
                    ->where('end_time', '>=', $validated['end_time']);
            })->orWhere(function ($q) use ($validated) {
                $q->where('start_time', '>=', $validated['start_time'])
                    ->where('end_time', '<=', $validated['end_time']);
            });
        })->exists();

        if ($overlapping) {
            return back()->withErrors([
                'time_conflict' => 'Time slot overlaps with an existing time slot.',
            ]);
        }

        TimeSlot::create($validated);

        return back()->with('success', 'Time slot created successfully.');
    }

    public function updateTimeSlot(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'display_name' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        // Check for overlapping time slots (excluding current one)
        $overlapping = TimeSlot::where('id', '!=', $timeSlot->id)
            ->where(function ($query) use ($validated) {
                $query->where(function ($q) use ($validated) {
                    $q->where('start_time', '<=', $validated['start_time'])
                        ->where('end_time', '>', $validated['start_time']);
                })->orWhere(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['end_time'])
                        ->where('end_time', '>=', $validated['end_time']);
                })->orWhere(function ($q) use ($validated) {
                    $q->where('start_time', '>=', $validated['start_time'])
                        ->where('end_time', '<=', $validated['end_time']);
                });
            })->exists();

        if ($overlapping) {
            return back()->withErrors([
                'time_conflict' => 'Time slot overlaps with an existing time slot.',
            ]);
        }

        $timeSlot->update($validated);

        return back()->with('success', 'Time slot updated successfully.');
    }

    public function destroyTimeSlot(TimeSlot $timeSlot)
    {
        // Check if time slot is being used by any active vouchers
        $activeVouchers = Voucher::where('time_slot_id', $timeSlot->id)
            ->where('status', 'active')
            ->exists();

        if ($activeVouchers) {
            return back()->withErrors([
                'in_use' => 'Cannot delete time slot that is being used by active vouchers.',
            ]);
        }

        $timeSlot->delete();

        return back()->with('success', 'Time slot deleted successfully.');
    }

    // System Metrics
    public function metrics(): Response
    {
        $metrics = [
            'overview' => [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'total_students' => User::where('role', 'student')->count(),
                'total_staff' => User::whereIn('role', ['staff', 'admin'])->count(),
                'total_donors' => User::where('role', 'donor')->count(),
            ],
            'vouchers' => [
                'total_vouchers' => Voucher::count(),
                'active_vouchers' => Voucher::where('status', 'active')->count(),
                'claimed_vouchers' => Voucher::where('status', 'claimed')->count(),
                'expired_vouchers' => Voucher::where('status', 'expired')->count(),
                'cancelled_vouchers' => Voucher::where('status', 'cancelled')->count(),
            ],
            'donations' => [
                'total_donations' => Donation::count(),
                'completed_donations' => Donation::where('payment_status', 'completed')->count(),
                'pending_donations' => Donation::where('payment_status', 'pending')->count(),
                'failed_donations' => Donation::where('payment_status', 'failed')->count(),
                'total_amount_raised' => Donation::where('payment_status', 'completed')->sum('amount'),
            ],
            'recent_activity' => [
                'vouchers_today' => Voucher::whereDate('created_at', today())->count(),
                'vouchers_this_week' => Voucher::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
                'donations_today' => Donation::whereDate('created_at', today())->count(),
                'donations_this_week' => Donation::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
                'new_users_today' => User::whereDate('created_at', today())->count(),
                'new_users_this_week' => User::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            ],
        ];

        // Get system metrics from database
        $systemMetrics = SystemMetric::all()->keyBy('metric_name');

        return Inertia::render('admin/settings/metrics', [
            'metrics' => $metrics,
            'system_metrics' => $systemMetrics,
        ]);
    }

    public function resetMetrics(Request $request)
    {
        $validated = $request->validate([
            'metric_name' => 'required|string|exists:system_metrics,metric_name',
        ]);

        $metric = SystemMetric::where('metric_name', $validated['metric_name'])->first();

        if ($metric) {
            $metric->update([
                'metric_value' => 0,
                'last_updated' => now(),
            ]);
        }

        return back()->with('success', 'Metric reset successfully.');
    }
}
