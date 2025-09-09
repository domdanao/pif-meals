import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SimpleToast } from '@/components/simple-toast';

interface DonateProps {
    stats: {
        total_donations_received: number;
        total_meals_donated: number;
        total_donors: number;
        meals_available: number;
    };
}

interface FormData {
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    amount: number;
    meal_count: number;
    message: string;
}

const donationPresets = [
    { meals: 1, amount: 65, label: '1 Meal', description: 'Feed one student' },
    { meals: 3, amount: 195, label: '3 Meals', description: 'Help for 3 days', popular: true },
    { meals: 5, amount: 325, label: '5 Meals', description: 'A week of support' },
    { meals: 10, amount: 650, label: '10 Meals', description: 'Two weeks of meals' },
];


export default function Donate({ stats }: DonateProps) {
    const [customAmount, setCustomAmount] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        amount: 195, // Default to 3 meals
        meal_count: 3,
        message: '',
    });

    const handlePresetClick = (preset: typeof donationPresets[0]) => {
        setData({
            ...data,
            amount: preset.amount,
            meal_count: preset.meals,
        });
        setCustomAmount(false);
    };

    const handleCustomAmountChange = (amount: number) => {
        const mealCount = Math.floor(amount / 65);
        setData({
            ...data,
            amount: amount,
            meal_count: mealCount,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted with data:', data);
        console.log('Current errors:', errors);
        console.log('Processing status:', processing);
        
        // Basic client-side validation
        if (!data.donor_name.trim()) {
            console.log('Missing donor name');
            return;
        }
        if (!data.donor_email.trim()) {
            console.log('Missing donor email');
            return;
        }
        if (data.amount < 65) {
            console.log('Amount too low:', data.amount);
            return;
        }
        
        console.log('Submitting to /donate');
        setIsRedirecting(true); // Set loading state immediately
        post('/donate', {
            onError: () => {
                // Re-enable button if there's an error
                setIsRedirecting(false);
            }
            // Don't reset isRedirecting on success since we'll be redirected away
        });
    };

    return (
        <>
            <Head title="Donate Meals - PIF Meals" />
            <SimpleToast />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="mx-auto max-w-2xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
                            ← Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Donate Meals to Students
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Enter your details below and we'll redirect you to secure payment
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ₱{stats.total_donations_received.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Raised</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.total_meals_donated.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Meals Donated</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.total_donors.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Kind Donors</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.meals_available.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Available Now</div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Donation Details
                                </h2>
                                
                                {/* Show any general errors */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Please fix the following errors:</h4>
                                        <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm space-y-1">
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                    {/* Donation Amount Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Choose Donation Amount *
                                        </label>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            {donationPresets.map((preset) => (
                                                <div
                                                    key={preset.meals}
                                                    className={cn(
                                                        "relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:shadow-md",
                                                        data.amount === preset.amount && !customAmount
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                            : "border-gray-300 dark:border-gray-600 hover:border-blue-300"
                                                    )}
                                                    onClick={() => handlePresetClick(preset)}
                                                >
                                                    {preset.popular && (
                                                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                            Popular
                                                        </div>
                                                    )}
                                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                        ₱{preset.amount}
                                                    </div>
                                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                                                        {preset.label}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        {preset.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Amount */}
                                        <div className="flex items-center space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setCustomAmount(true)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg border transition-all",
                                                    customAmount
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                                        : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300"
                                                )}
                                            >
                                                Custom Amount
                                            </button>
                                            {customAmount && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-600 dark:text-gray-400">₱</span>
                                                    <input
                                                        type="number"
                                                        min="65"
                                                        step="1"
                                                        value={data.amount}
                                                        onChange={(e) => handleCustomAmountChange(parseInt(e.target.value) || 0)}
                                                        className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        = {data.meal_count} meal{data.meal_count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
                                    </div>

                                    {/* Donor Information */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.donor_name}
                                            onChange={(e) => setData('donor_name', e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                errors.donor_name ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                                            )}
                                            placeholder="Juan Dela Cruz"
                                        />
                                        {errors.donor_name && <p className="mt-1 text-sm text-red-600">{errors.donor_name}</p>}
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                value={data.donor_email}
                                                onChange={(e) => setData('donor_email', e.target.value)}
                                                className={cn(
                                                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                    errors.donor_email ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                                                )}
                                                placeholder="juan@email.com"
                                            />
                                            {errors.donor_email && <p className="mt-1 text-sm text-red-600">{errors.donor_email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Mobile Number (optional)
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.donor_phone}
                                                onChange={(e) => setData('donor_phone', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="09123456789"
                                            />
                                            {errors.donor_phone && <p className="mt-1 text-sm text-red-600">{errors.donor_phone}</p>}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Secure Payment
                                        </h4>
                                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                                            After clicking "Proceed to Payment", you'll be redirected to Magpie's secure checkout where you can choose from multiple payment methods including GCash, Maya, Credit/Debit Cards, and Bank Transfer.
                                        </p>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Message to Students (optional)
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                            placeholder="A few words of encouragement for the students..."
                                            maxLength={500}
                                        />
                                        <div className="mt-1 text-xs text-gray-500">
                                            {data.message.length}/500 characters
                                        </div>
                                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={processing || isRedirecting}
                                            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                        >
                                            {(processing || isRedirecting) ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    {isRedirecting ? 'Redirecting to Payment...' : 'Processing...'}
                                                </span>
                                            ) : (
                                                `Proceed to Payment - ₱${data.amount.toLocaleString()}`
                                            )}
                                        </button>
                                    </div>

                                    {/* Impact Message */}
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Your Impact
                                        </h4>
                                        <p className="text-green-700 dark:text-green-300 text-lg">
                                            Your donation will help feed <strong>{data.meal_count}</strong> UPLB student{data.meal_count !== 1 ? 's' : ''} in need.
                                        </p>
                                        <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                                            Meals will be available immediately after payment confirmation.
                                        </p>
                                    </div>
                                </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

