import { Head, Link } from '@inertiajs/react';
import { CheckCircleIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface DonateSuccessProps {
    donation: {
        id: string;
        amount: number;
        meal_count: number;
        donor_name: string;
        formatted_amount: string;
        created_at: string;
    };
}

export default function DonateSuccess({ donation }: DonateSuccessProps) {
    const shareMessage = `I just donated ${donation.meal_count} meal${donation.meal_count !== 1 ? 's' : ''} to UPLB students through PIF Meals at Banned Books! Every ₱65 helps feed a student. Join me in supporting our students! 🍽️❤️`;
    
    const handleShare = async (platform: string) => {
        const url = window.location.origin;
        const encodedMessage = encodeURIComponent(shareMessage);
        const encodedUrl = encodeURIComponent(url);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedMessage}`;
                break;
            case 'copy':
                try {
                    await navigator.clipboard.writeText(`${shareMessage} ${url}`);
                    alert('Message copied to clipboard!');
                } catch (err) {
                    console.error('Failed to copy to clipboard:', err);
                }
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    return (
        <>
            <Head title="Thank You - Donation Successful" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-3xl py-16 sm:py-24">
                        {/* Success Icon */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                            
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
                                Thank You, {donation.donor_name}!
                            </h1>
                            
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                Your generous donation will help feed UPLB students in need
                            </p>
                        </div>

                        {/* Donation Summary Card */}
                        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 mb-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Donation Summary
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                            {donation.formatted_amount}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Amount Donated
                                        </div>
                                    </div>
                                    
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                                            {donation.meal_count}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Meal{donation.meal_count !== 1 ? 's' : ''} Provided
                                        </div>
                                    </div>
                                    
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                            {donation.meal_count}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Student{donation.meal_count !== 1 ? 's' : ''} Helped
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Transaction ID:</strong> {donation.id}<br />
                                    <strong>Date:</strong> {donation.created_at}
                                </div>
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                What Happens Next?
                            </h3>
                            
                            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <div>
                                        <strong>Your meals are now available:</strong> {donation.meal_count} meal{donation.meal_count !== 1 ? 's' : ''} have been added to the available pool for students.
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <div>
                                        <strong>Students can claim meals:</strong> UPLB students can now request these meals by showing proof of enrollment at Banned Books.
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                    <div>
                                        <strong>Meals are prepared fresh:</strong> Banned Books will prepare nutritious meals using your donation for ingredients.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share Your Impact */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-8 mb-8">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
                                    <ShareIcon className="w-6 h-6 mr-2" />
                                    Share Your Impact
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Inspire others to help UPLB students by sharing your donation!
                                </p>
                                
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Share on Facebook
                                    </button>
                                    
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Share on Twitter
                                    </button>
                                    
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Copy Message
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/"
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg text-center"
                            >
                                Return to Home
                            </Link>
                            
                            <Link
                                href="/donate"
                                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg text-center"
                            >
                                Donate Again
                            </Link>
                        </div>

                        {/* Thank You Message */}
                        <div className="text-center mt-12 p-8 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 rounded-2xl">
                            <HeartIcon className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                You're Making a Real Difference!
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 italic">
                                "Every meal you've provided represents hope, nourishment, and care for a UPLB student. 
                                Your generosity helps ensure that financial struggles don't prevent students from focusing on their education. 
                                From all the students who will benefit from your kindness - salamat!"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
