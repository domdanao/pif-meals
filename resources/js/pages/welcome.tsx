import { Head, Link } from '@inertiajs/react';
import { HeartIcon, UserGroupIcon, GiftIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface WelcomeProps {
    metrics?: {
        available_meals: number;
        claimed_meals: number;
        active_pledges: number;
        total_donations: number;
    };
}

export default function Welcome({ metrics = { available_meals: 0, claimed_meals: 0, active_pledges: 0, total_donations: 0 } }: WelcomeProps) {
    return (
        <>
            <Head title="PIF Meals - Pay It Forward" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Hero Section */}
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-4xl py-16 sm:py-24">
                        {/* Header */}
                        <div className="text-center">
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                                    PIF Meals at{' '}
                                    <span className="text-blue-600 dark:text-blue-400">Banned Books</span>
                                </h1>
                                <p className="text-xl text-orange-600 dark:text-orange-400 font-semibold mt-2">
                                    *Pay-It-Forward
                                </p>
                            </div>
                        </div>

                        {/* Message to Students */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-blue-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    To UPLB Students:
                                </h2>
                                <div className="text-lg text-gray-700 dark:text-gray-300 space-y-2">
                                    <p>"Wala pa ba stipend mo?</p>
                                    <p>O kinapos ang budget?</p>
                                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                                        Me libreng meal ka bukas dito sa Banned Books, just present proof of enrollment to staff from 11am to 1pm, or 5-7pm"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Live Metrics */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-12">
                            <MetricCard
                                icon={<GiftIcon className="h-8 w-8" />}
                                value={metrics.available_meals}
                                label="Meals Available"
                                color="bg-green-500"
                            />
                            <MetricCard
                                icon={<HeartIcon className="h-8 w-8" />}
                                value={metrics.active_pledges}
                                label="Students Pledged"
                                color="bg-pink-500"
                            />
                            <MetricCard
                                icon={<ChartBarIcon className="h-8 w-8" />}
                                value={metrics.claimed_meals}
                                label="Meals Claimed"
                                color="bg-blue-500"
                            />
                            <MetricCard
                                icon={<UserGroupIcon className="h-8 w-8" />}
                                value={metrics.total_donations}
                                label="Total Donors"
                                color="bg-purple-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/students/request-meal"
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
                            >
                                🍽️ CLICK TO AVAIL MEAL
                            </Link>
                            <Link
                                href="/donate"
                                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
                            >
                                💝 DONATE MEALS
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Donor Section */}
                <div className="bg-white dark:bg-gray-800 py-16">
                    <div className="mx-auto max-w-4xl px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                To UP Alumni & Supporters:
                            </h2>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8">
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                                    "Are you a UP Alumni? Many students in UPLB do not have enough money for meals, 
                                    and we would like to support them by providing free meals supported by UP graduates."
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                    <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">₱65</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">provides ingredients for</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₱100</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">meal value to student</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">♥️</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">Banned Books provides facilities</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="bg-gray-900 dark:bg-black py-8">
                    <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                        <p className="text-gray-300 italic text-lg">
                            "Every meal makes a difference in a student's day. Thank you to all donors and students paying it forward!"
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: string;
}

function MetricCard({ icon, value, label, color }: MetricCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center border">
            <div className={cn("inline-flex p-3 rounded-full text-white mb-4", color)}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {label}
            </div>
        </div>
    );
}
