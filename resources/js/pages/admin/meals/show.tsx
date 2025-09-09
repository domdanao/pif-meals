import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ChefHat, Edit, Calendar, User, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
    meal: Meal;
}

export default function ShowMeal({ meal }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/admin/meals/${meal.id}`, {
            onSuccess: () => {
                // Redirect will be handled by the backend
            },
            onError: () => {
                setIsDeleting(false);
            },
            onFinish: () => {
                setShowDeleteDialog(false);
            },
        });
    };

    const getStatusBadge = () => {
        if (!meal.is_active) {
            return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Inactive</span>;
        }
        
        if (meal.quantity_available <= 0) {
            return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Out of Stock</span>;
        }
        
        if (meal.quantity_available <= 10) {
            return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Low Stock</span>;
        }
        
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Available</span>;
    };

    return (
        <AppLayout>
            <Head title={`${meal.name} - PIF Meals Admin`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href="/admin/meals"
                                    className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back to Meals
                                </Link>
                                <div className="flex items-center">
                                    <ChefHat className="h-8 w-8 text-blue-600 mr-3" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Meal Details
                                        </h1>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                                            View meal information
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={`/admin/meals/${meal.id}/edit`}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Meal
                                </Link>
                                <button
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Meal Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="md:flex">
                            {/* Image */}
                            <div className="md:flex-shrink-0">
                                <div className="h-48 w-full md:w-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {meal.image_url ? (
                                        <img 
                                            src={meal.image_url} 
                                            alt={meal.name}
                                            className="h-full w-full object-cover md:rounded-l-xl"
                                        />
                                    ) : (
                                        <ChefHat className="h-16 w-16 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-8 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {meal.name}
                                            </h2>
                                            {getStatusBadge()}
                                        </div>
                                        
                                        {meal.category && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                                                {meal.category}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {meal.formatted_price}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Qty: {meal.quantity_available}
                                        </p>
                                    </div>
                                </div>

                                {meal.description && (
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        {meal.description}
                                    </p>
                                )}

                                {/* Dietary Information */}
                                {meal.dietary_info.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Dietary Information:
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {meal.dietary_info.map((info) => (
                                                <span 
                                                    key={info}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {info}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Allergen Information */}
                                {meal.allergen_info && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Allergen Information:
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            {meal.allergen_info}
                                        </p>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <User className="h-4 w-4 mr-2" />
                                        Created by {meal.creator.name}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(meal.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Meal</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{meal.name}"? This action cannot be undone.
                                    The meal will be permanently removed from the system.
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
                </div>
            </div>
        </AppLayout>
    );
}
