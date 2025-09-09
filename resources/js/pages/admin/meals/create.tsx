import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChefHat, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Props {
    categories: string[];
}

export default function CreateMeal({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        category: '',
        is_vegetarian: false,
        is_halal: false,
        contains_nuts: false,
        contains_dairy: false,
        allergen_info: '',
        image_url: '',
        quantity_available: 0,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/meals');
    };

    return (
        <AppLayout>
            <Head title="Add New Meal - PIF Meals Admin" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
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
                                        Add New Meal
                                    </h1>
                                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                                        Create a new meal for students
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meal Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Chicken Adobo with Rice"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                {/* Price */}
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Price (₱)
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Leave empty for free meals</p>
                                    {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <div className="flex">
                                        <select
                                            id="category"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select category...</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Or type new..."
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="flex-1 px-3 py-2 border-l-0 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe the meal, ingredients, or preparation..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                            </div>

                            {/* Dietary Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dietary Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_vegetarian}
                                            onChange={(e) => setData('is_vegetarian', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Vegetarian</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_halal}
                                            onChange={(e) => setData('is_halal', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Halal</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.contains_nuts}
                                            onChange={(e) => setData('contains_nuts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Contains Nuts</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.contains_dairy}
                                            onChange={(e) => setData('contains_dairy', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Contains Dairy</span>
                                    </label>
                                </div>
                            </div>

                            {/* Allergen Information */}
                            <div>
                                <label htmlFor="allergen_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional Allergen Information
                                </label>
                                <textarea
                                    id="allergen_info"
                                    rows={2}
                                    value={data.allergen_info}
                                    onChange={(e) => setData('allergen_info', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Additional allergen warnings or dietary notes..."
                                />
                                {errors.allergen_info && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.allergen_info}</p>}
                            </div>

                            {/* Image URL and Quantity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Image URL */}
                                <div>
                                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        id="image_url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/meal-image.jpg"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Optional: URL to meal image</p>
                                    {errors.image_url && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image_url}</p>}
                                </div>

                                {/* Quantity Available */}
                                <div>
                                    <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Quantity Available *
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity_available"
                                        min="0"
                                        value={data.quantity_available}
                                        onChange={(e) => setData('quantity_available', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    {errors.quantity_available && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity_available}</p>}
                                </div>
                            </div>

                            {/* Active Status */}
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Active (meal will be available to students)
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-xl">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/admin/meals"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Creating...' : 'Create Meal'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
