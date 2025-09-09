<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MealController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Meal::query()->with('creator');

        // Apply filters
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('description', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'out_of_stock') {
                $query->where('quantity_available', '<=', 0);
            } elseif ($request->status === 'low_stock') {
                $query->whereBetween('quantity_available', [1, 10]);
            }
        }

        if ($request->filled('dietary')) {
            if ($request->dietary === 'vegetarian') {
                $query->vegetarian();
            } elseif ($request->dietary === 'halal') {
                $query->halal();
            }
        }

        $meals = $query->latest()->paginate(12)->withQueryString();

        // Get available categories for filter dropdown
        $categories = Meal::distinct('category')
            ->whereNotNull('category')
            ->pluck('category')
            ->sort()
            ->values();

        return Inertia::render('admin/meals/index', [
            'meals' => $meals,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status', 'dietary']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get existing categories for dropdown
        $categories = Meal::distinct('category')
            ->whereNotNull('category')
            ->pluck('category')
            ->sort()
            ->values();

        return Inertia::render('admin/meals/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'nullable|numeric|min:0|max:9999.99',
            'category' => 'nullable|string|max:255',
            'is_vegetarian' => 'boolean',
            'is_halal' => 'boolean',
            'contains_nuts' => 'boolean',
            'contains_dairy' => 'boolean',
            'allergen_info' => 'nullable|string|max:1000',
            'image_url' => 'nullable|url|max:255',
            'quantity_available' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = Auth::id();

        $meal = Meal::create($validated);

        return redirect()->route('admin.meals.show', $meal)
            ->with('success', 'Meal created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Meal $meal)
    {
        $meal->load('creator');

        return Inertia::render('admin/meals/show', [
            'meal' => $meal,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Meal $meal)
    {
        // Get existing categories for dropdown
        $categories = Meal::distinct('category')
            ->whereNotNull('category')
            ->pluck('category')
            ->sort()
            ->values();

        return Inertia::render('admin/meals/edit', [
            'meal' => $meal,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Meal $meal)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'nullable|numeric|min:0|max:9999.99',
            'category' => 'nullable|string|max:255',
            'is_vegetarian' => 'boolean',
            'is_halal' => 'boolean',
            'contains_nuts' => 'boolean',
            'contains_dairy' => 'boolean',
            'allergen_info' => 'nullable|string|max:1000',
            'image_url' => 'nullable|url|max:255',
            'quantity_available' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $meal->update($validated);

        return redirect()->route('admin.meals.show', $meal)
            ->with('success', 'Meal updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Meal $meal)
    {
        // TODO: Check if meal is referenced by vouchers or orders before deletion
        // For now, we'll soft delete by setting is_active to false
        $meal->update(['is_active' => false]);

        return redirect()->route('admin.meals.index')
            ->with('success', 'Meal deactivated successfully!');
    }

    /**
     * Toggle meal active status.
     */
    public function toggleStatus(Meal $meal)
    {
        $meal->update(['is_active' => ! $meal->is_active]);

        $status = $meal->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Meal {$status} successfully!");
    }

    /**
     * Bulk update meal quantities.
     */
    public function bulkUpdateQuantity(Request $request)
    {
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:meals,id',
            'updates.*.quantity_available' => 'required|integer|min:0',
        ]);

        foreach ($validated['updates'] as $update) {
            Meal::where('id', $update['id'])
                ->update(['quantity_available' => $update['quantity_available']]);
        }

        return back()->with('success', 'Meal quantities updated successfully!');
    }
}
