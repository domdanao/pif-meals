<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use App\Models\Role;
use App\Models\StudentDocument;
use App\Models\SystemMetric;
use App\Models\TimeSlot;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MealRequestController extends Controller
{
    public function create(): Response
    {
        $timeSlots = TimeSlot::active()->get();

        return Inertia::render('students/request-meal', [
            'time_slots' => $timeSlots,
        ]);
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check if user exists and has student role using the new role system
        $user = User::where('email', $request->email)
            ->whereHas('roles', function ($q) {
                $q->where('name', Role::STUDENT);
            })
            ->first();

        if ($user) {
            // Get the most recent document for this student
            $latestDocument = $user->documents()->latest()->first();

            $response = [
                'exists' => true,
                'user' => [
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'course' => $user->course,
                    'year_level' => $user->year_level,
                    'student_id' => $user->student_id,
                ],
            ];

            // Include document information if available
            if ($latestDocument) {
                $response['user']['existing_document'] = [
                    'file_url' => $latestDocument->file_url,
                    'original_filename' => $latestDocument->original_filename,
                    'file_type' => $latestDocument->file_type,
                    'file_size' => $latestDocument->formatted_file_size,
                    'uploaded_at' => $latestDocument->created_at->format('M j, Y'),
                ];
            }

            return response()->json($response);
        }

        return response()->json([
            'exists' => false,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user exists and has existing documents
        $existingUser = User::where('email', $request->email)->first();
        $hasExistingDocument = $existingUser && $existingUser->documents()->exists();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'course' => 'required|string|max:100',
            'year_level' => 'required|string|max:10',
            'student_id' => 'required|string|max:50',
            // Make file optional if user has existing document, required otherwise
            'proof_of_enrollment' => ($hasExistingDocument ? 'nullable' : 'required').'|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB
            'selected_date' => 'required|date|after:today',
            'time_slot_id' => 'required|exists:time_slots,id',
        ]);

        // Check if meals are available using the new managed meal system
        $availableMeal = Meal::where('is_active', true)
            ->where('quantity_available', '>', 0)
            ->first();

        if (! $availableMeal) {
            return back()->withErrors([
                'general' => 'Sorry, no meals are currently available. Please check back later.',
            ]);
        }

        // Decrease the available quantity of the selected meal
        $availableMeal->decrement('quantity_available');

        // Find any existing user with this email (regardless of roles)
        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // User exists - update their information and ensure they have student role
            $user->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'course' => $validated['course'],
                'year_level' => $validated['year_level'],
                'student_id' => $validated['student_id'],
            ]);

            // Assign student role if they don't have it
            if (! $user->hasRole(Role::STUDENT)) {
                $user->assignRole(Role::STUDENT);
            }
        } else {
            // Create new user with student role
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'role' => 'student', // Keep for backward compatibility during migration
                'course' => $validated['course'],
                'year_level' => $validated['year_level'],
                'student_id' => $validated['student_id'],
                'password' => Hash::make('temporary_password'), // Student can reset later
                'email_verified_at' => now(),
            ]);

            // Assign student role in the new system
            $user->assignRole(Role::STUDENT);
        }

        // Handle file upload (if provided)
        $document = null;
        if ($request->hasFile('proof_of_enrollment')) {
            $filePath = $request->file('proof_of_enrollment')->store('student-documents', 'public');

            // Create student document record
            $document = StudentDocument::create([
                'student_id' => $user->id,
                'file_url' => Storage::url($filePath),
                'file_type' => $request->file('proof_of_enrollment')->getClientOriginalExtension(),
                'file_size' => $request->file('proof_of_enrollment')->getSize(),
                'original_filename' => $request->file('proof_of_enrollment')->getClientOriginalName(),
            ]);
        } else {
            // For returning students without new upload, use their latest existing document
            $document = $user->documents()->latest()->first();
        }

        // Create voucher for managed meal (no meal_inventory_id needed)
        $voucher = Voucher::create([
            'student_id' => $user->id,
            // meal_inventory_id is now nullable for managed meals
            'time_slot_id' => $validated['time_slot_id'],
            'scheduled_date' => $validated['selected_date'],
            'student_name' => $user->name,
            'student_course' => $user->course,
            'student_year' => $user->year_level,
            'student_phone' => $user->phone,
        ]);

        // Link document to voucher (only if we have a document)
        if ($document) {
            // If it's a new document, link it to the voucher
            // If it's an existing document, we could optionally link it or leave the original voucher_id
            if ($request->hasFile('proof_of_enrollment')) {
                $document->update(['voucher_id' => $voucher->id]);
            }
            // For existing documents, we keep the original voucher_id intact
        }

        // Note: No need to update SystemMetric as home page now calculates dynamically from Meal model

        // Redirect to voucher display page
        return redirect()->route('students.voucher.show', $voucher->reference_number)
            ->with('success', 'Your meal request has been processed! Your voucher is ready.');
    }

    public function showVoucher(string $referenceNumber): Response
    {
        $voucher = Voucher::where('reference_number', $referenceNumber)
            ->with(['timeSlot', 'student'])
            ->firstOrFail();

        return Inertia::render('students/voucher', [
            'voucher' => $voucher,
        ]);
    }
}
