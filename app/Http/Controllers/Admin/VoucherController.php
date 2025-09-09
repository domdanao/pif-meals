<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = Voucher::with(['student:id,name,course,year_level', 'timeSlot', 'claimedByStaff:id,name']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('scheduled_date', $request->date);
        }

        if ($request->filled('time_slot_id')) {
            $query->where('time_slot_id', $request->time_slot_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('student_name', 'like', "%{$search}%")
                    ->orWhere('student_course', 'like', "%{$search}%");
            });
        }

        // Show all vouchers by default unless a specific status filter is applied

        $vouchers = $query->orderBy('scheduled_date')
            ->orderBy('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($voucher) => [
                'id' => $voucher->id,
                'reference_number' => $voucher->reference_number,
                'student_name' => $voucher->student_name,
                'student_course' => $voucher->student_course,
                'student_year' => $voucher->student_year,
                'student_phone' => $voucher->student_phone,
                'scheduled_date' => $voucher->scheduled_date->format('Y-m-d'),
                'scheduled_date_formatted' => $voucher->scheduled_date->format('M d, Y'),
                'time_slot' => $voucher->timeSlot->display_name ?? 'N/A',
                'status' => $voucher->status,
                'claimed_at' => $voucher->claimed_at?->format('M d, Y H:i'),
                'claimed_by' => $voucher->claimedByStaff?->name,
                'created_at' => $voucher->created_at->format('M d, Y H:i'),
                'can_claim' => $voucher->status === 'active',
                'can_void' => in_array($voucher->status, ['active', 'expired']),
            ]);

        $timeSlots = TimeSlot::where('is_active', true)->get();

        return Inertia::render('admin/vouchers/index', [
            'vouchers' => $vouchers,
            'time_slots' => $timeSlots,
            'filters' => $request->only(['status', 'date', 'time_slot_id', 'search']),
            'stats' => [
                'active' => Voucher::where('status', 'active')->count(),
                'claimed' => Voucher::where('status', 'claimed')->count(),
                'expired' => Voucher::where('status', 'expired')->count(),
                'cancelled' => Voucher::where('status', 'cancelled')->count(),
            ],
        ]);
    }

    public function show(Voucher $voucher)
    {
        $voucher->load(['student', 'timeSlot', 'claimedByStaff', 'documents']);

        return Inertia::render('admin/vouchers/show', [
            'voucher' => [
                'id' => $voucher->id,
                'reference_number' => $voucher->reference_number,
                'student_name' => $voucher->student_name,
                'student_course' => $voucher->student_course,
                'student_year' => $voucher->student_year,
                'student_phone' => $voucher->student_phone,
                'scheduled_date' => $voucher->scheduled_date->format('Y-m-d'),
                'scheduled_date_formatted' => $voucher->scheduled_date->format('l, F d, Y'),
                'time_slot' => $voucher->timeSlot->display_name ?? 'N/A',
                'status' => $voucher->status,
                'claimed_at' => $voucher->claimed_at?->format('M d, Y H:i'),
                'claimed_by' => $voucher->claimedByStaff?->name,
                'created_at' => $voucher->created_at->format('M d, Y H:i'),
                'student' => $voucher->student ? [
                    'id' => $voucher->student->id,
                    'name' => $voucher->student->name,
                    'email' => $voucher->student->email,
                    'course' => $voucher->student->course,
                    'year_level' => $voucher->student->year_level,
                    'student_id' => $voucher->student->student_id,
                ] : null,
                'documents' => $voucher->documents->map(fn ($doc) => [
                    'id' => $doc->id,
                    'file_url' => $doc->file_url,
                    'file_type' => $doc->file_type,
                    'original_filename' => $doc->original_filename,
                ]),
                'can_claim' => $voucher->status === 'active',
                'can_void' => in_array($voucher->status, ['active', 'expired']),
                'can_expire' => $voucher->status === 'active',
            ],
        ]);
    }

    public function claim(Request $request, Voucher $voucher)
    {
        if ($voucher->status !== 'active') {
            return back()->withErrors(['voucher' => 'Voucher cannot be claimed.']);
        }

        try {
            DB::transaction(function () use ($voucher) {
                $voucher->update([
                    'status' => 'claimed',
                    'claimed_at' => now(),
                    'claimed_by_staff_id' => auth()->id(),
                ]);

                // Log admin activity here if you have the system
            });

            return back()->with('success', "Voucher {$voucher->reference_number} has been successfully claimed.");
        } catch (\Exception $e) {
            return back()->withErrors(['voucher' => 'Failed to claim voucher. Please try again.']);
        }
    }

    public function void(Request $request, Voucher $voucher)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (! in_array($voucher->status, ['active', 'expired'])) {
            return back()->withErrors(['voucher' => 'Voucher cannot be voided.']);
        }

        try {
            DB::transaction(function () use ($voucher) {
                $voucher->update([
                    'status' => 'cancelled',
                    // You might want to add a 'void_reason' column to store the reason
                ]);

                // Log admin activity here
            });

            return back()->with('success', "Voucher {$voucher->reference_number} has been voided.");
        } catch (\Exception $e) {
            return back()->withErrors(['voucher' => 'Failed to void voucher. Please try again.']);
        }
    }

    public function expire(Request $request, Voucher $voucher)
    {
        if ($voucher->status !== 'active') {
            return back()->withErrors(['voucher' => 'Voucher cannot be expired.']);
        }

        try {
            $voucher->update([
                'status' => 'expired',
            ]);

            return back()->with('success', "Voucher {$voucher->reference_number} has been marked as expired.");
        } catch (\Exception $e) {
            return back()->withErrors(['voucher' => 'Failed to expire voucher. Please try again.']);
        }
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:claim,expire,void',
            'voucher_ids' => 'required|array|min:1',
            'voucher_ids.*' => 'exists:vouchers,id',
            'reason' => 'required_if:action,void|string|max:500',
        ]);

        $vouchers = Voucher::whereIn('id', $request->voucher_ids)->get();
        $successCount = 0;
        $errors = [];

        DB::transaction(function () use ($vouchers, $request, &$successCount, &$errors) {
            foreach ($vouchers as $voucher) {
                try {
                    switch ($request->action) {
                        case 'claim':
                            if ($voucher->status === 'active') {
                                $voucher->update([
                                    'status' => 'claimed',
                                    'claimed_at' => now(),
                                    'claimed_by_staff_id' => auth()->id(),
                                ]);
                                $successCount++;
                            } else {
                                $errors[] = "Voucher {$voucher->reference_number} cannot be claimed.";
                            }
                            break;

                        case 'expire':
                            if ($voucher->status === 'active') {
                                $voucher->update(['status' => 'expired']);
                                $successCount++;
                            } else {
                                $errors[] = "Voucher {$voucher->reference_number} cannot be expired.";
                            }
                            break;

                        case 'void':
                            if (in_array($voucher->status, ['active', 'expired'])) {
                                $voucher->update(['status' => 'cancelled']);
                                $successCount++;
                            } else {
                                $errors[] = "Voucher {$voucher->reference_number} cannot be voided.";
                            }
                            break;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to process voucher {$voucher->reference_number}.";
                }
            }
        });

        $message = "{$successCount} voucher(s) processed successfully.";
        if (! empty($errors)) {
            $message .= ' Some vouchers could not be processed.';
        }

        return back()->with('success', $message)->withErrors($errors);
    }

    public function quickClaim(Request $request)
    {
        $request->validate([
            'reference_number' => 'required|string|exists:vouchers,reference_number',
        ]);

        $voucher = Voucher::where('reference_number', $request->reference_number)->first();

        if ($voucher->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Voucher cannot be claimed.',
                'voucher' => null,
            ], 400);
        }

        try {
            DB::transaction(function () use ($voucher) {
                $voucher->update([
                    'status' => 'claimed',
                    'claimed_at' => now(),
                    'claimed_by_staff_id' => auth()->id(),
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => "Voucher {$voucher->reference_number} claimed successfully.",
                'voucher' => [
                    'reference_number' => $voucher->reference_number,
                    'student_name' => $voucher->student_name,
                    'time_slot' => $voucher->timeSlot->display_name ?? 'N/A',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to claim voucher.',
                'voucher' => null,
            ], 500);
        }
    }
}
