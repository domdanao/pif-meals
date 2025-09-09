import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChefHat, Plus, Search, Filter, Eye, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Meal {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    category: string | null;
    is_vegetarian: boolean;
    is_halal: boolean;
    contains_nuts: boolean;
    contains_dairy: boolean;
    allergen_info: string | null;
    image_url: string | null;
    quantity_available: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    creator: {
        name: string;
        email: string;
    };
    formatted_price: string;
    dietary_info: string[];
}

interface Props {
    meals: {
        data: Meal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        status?: string;
        dietary?: string;
    };
}

export default function MealsIndex({ meals, categories, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/meals', { 
            ...filters, 
            search: searchTerm || undefined 
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/meals', { 
            ...filters, 
            [key]: value === 'all' ? undefined : value 
        }, { preserveState: true });
    };

    const toggleMealStatus = (meal: Meal) => {
        router.patch(`/admin/meals/${meal.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = (meal: Meal) => {
        setSelectedMeal(meal);
        setShowDeleteDialog(true);
    };

    const handleDelete = () => {
        if (!selectedMeal) return;
        setIsDeleting(true);
        router.delete(`/admin/meals/${selectedMeal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // Page will refresh via Inertia and remove the deleted item
            },
            onError: () => {
                setIsDeleting(false);
            },
            onFinish: () => {
                setShowDeleteDialog(false);
                setSelectedMeal(null);
            },
        });
    };

    const getStatusBadge = (meal: Meal) => {
        if (!meal.is_active) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Inactive</span>;
        }
        
        if (meal.quantity_available <= 0) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Out of Stock</span>;
        }
        
        if (meal.quantity_available <= 10) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Low Stock</span>;
        }
        
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Available</span>;
    };

    return (
        <AppLayout>
            <Head title="Meal Management - PIF Meals Admin" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ChefHat className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Meal Management
                                    </h1>
                                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                                        Manage meals available for students
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/admin/meals/create"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Meal
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <form onSubmit={handleSearch} className="flex">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search meals..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Search
                                    </button>
                                </form>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <select
                                    value={filters.category || 'all'}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full py-2 pl-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    {(categories ?? []).map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={filters.status || 'all'}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full py-2 pl-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                </select>
                            </div>

                            {/* Dietary Filter */}
                            <div>
                                <select
                                    value={filters.dietary || 'all'}
                                    onChange={(e) => handleFilterChange('dietary', e.target.value)}
                                    className="w-full py-2 pl-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Dietary</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="halal">Halal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {meals?.data?.length || 0} of {meals?.total || 0} meals
                        </p>
                        {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
                            <Link
                                href="/admin/meals"
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                                Clear all filters
                            </Link>
                        )}
                    </div>

                    {/* Meals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {(meals?.data || []).map((meal) => (
                            <div key={meal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Meal Image Placeholder */}
                                <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {meal.image_url ? (
                                        <img 
                                            src={meal.image_url} 
                                            alt={meal.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ChefHat className="h-12 w-12 text-gray-400" />
                                    )}
                                </div>

                                <div className="p-4">
                                    {/* Status and Price */}
                                    <div className="flex items-center justify-between mb-2">
                                        {getStatusBadge(meal)}
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {meal.formatted_price}
                                        </span>
                                    </div>

                                    {/* Meal Name */}
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {meal.name}
                                    </h3>

                                    {/* Category */}
                                    {meal.category && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                                            {meal.category}
                                        </p>
                                    )}

                                    {/* Description */}
                                    {meal.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {meal.description}
                                        </p>
                                    )}

                                    {/* Dietary Info */}
                                    {Array.isArray(meal.dietary_info) && meal.dietary_info.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {meal.dietary_info.map((info) => (
                                                <span 
                                                    key={info}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {info}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quantity */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Qty: <span className="font-medium">{meal.quantity_available}</span>
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Link
                                                href={`/admin/meals/${meal.id}`}
                                                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Link>
                                            <Link
                                                href={`/admin/meals/${meal.id}/edit`}
                                                className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => confirmDelete(meal)}
                                                className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                                                title="Delete meal"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => toggleMealStatus(meal)}
                                                className={`inline-flex items-center px-2 py-1 rounded transition-colors ${
                                                    meal.is_active 
                                                        ? 'text-green-600 hover:text-green-700 dark:text-green-400' 
                                                        : 'text-gray-500 hover:text-gray-600 dark:text-gray-400'
                                                }`}
                                                title={meal.is_active ? 'Deactivate meal' : 'Activate meal'}
                                            >
                                                {meal.is_active ? (
                                                    <ToggleRight className="h-5 w-5" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {(!meals?.data || meals.data.length === 0) && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No meals found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {Object.keys(filters).some(key => filters[key as keyof typeof filters])
                                    ? "Try adjusting your filters to see more results."
                                    : "Get started by adding your first meal."
                                }
                            </p>
                            <Link
                                href="/admin/meals/create"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Meal
                            </Link>
                        </div>
                    )}

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Meal</DialogTitle>
                                <DialogDescription>
                                    {selectedMeal ? (
                                        <span>
                                            Are you sure you want to delete "{selectedMeal.name}"? This action cannot be undone.
                                        </span>
                                    ) : (
                                        'Are you sure you want to delete this meal? This action cannot be undone.'
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    disabled={isDeleting}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isDeleting ? 'Deleting...' : 'Delete Meal'}
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Pagination */}
                    {(meals?.last_page || 0) > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-xl shadow-sm">
                            <div className="flex flex-1 justify-between sm:hidden">
                                {meals?.links?.[0]?.url && (
                                    <Link
                                        href={meals.links[0].url}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {meals?.links?.[meals.links.length - 1]?.url && (
                                    <Link
                                        href={meals.links[meals.links.length - 1].url}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {((meals?.current_page || 1) - 1) * (meals?.per_page || 12) + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {Math.min((meals?.current_page || 1) * (meals?.per_page || 12), meals?.total || 0)}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">{meals?.total || 0}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {(meals?.links || []).map((link, index) => {
                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 cursor-default"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }
                                            
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                                        link.active
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
