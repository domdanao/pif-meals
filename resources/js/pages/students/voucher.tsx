import { Head, Link } from '@inertiajs/react';
import { CalendarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HandPlatterIcon } from 'lucide-react';
import QRCodeComponent from '../../components/QRCode';

interface VoucherProps {
    voucher: {
        id: string;
        reference_number: string;
        scheduled_date: string;
        status: 'active' | 'claimed' | 'expired' | 'cancelled';
        student_name: string;
        student_course: string;
        student_year: string;
        student_phone: string;
        time_slot: {
            id: string;
            display_name: string;
            start_time: string;
            end_time: string;
        };
        created_at: string;
    };
}

export default function Voucher({ voucher }: VoucherProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100 border-green-200';
            case 'claimed':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'expired':
                return 'text-red-600 bg-red-100 border-red-200';
            case 'cancelled':
                return 'text-gray-600 bg-gray-100 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'claimed':
                return 'Claimed';
            case 'expired':
                return 'Expired';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    return (
        <>
            <Head title={`Voucher ${voucher.reference_number} - PIF Meals`} />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="mx-auto max-w-2xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link 
                            href="/" 
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
                        >
                            ← Back to Home
                        </Link>
                        <div className="flex items-center justify-center mb-4">
                            <HandPlatterIcon className="h-12 w-12 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Meal Voucher
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Present this voucher to claim your free meal at Banned Books
                        </p>
                    </div>

                    {/* Voucher Card */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
                        {/* Status Banner */}
                        <div className={`px-6 py-3 border-b ${getStatusColor(voucher.status)}`}>
                            <div className="flex items-center justify-center">
                                {voucher.status === 'active' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
                                <span className="font-semibold text-sm uppercase tracking-wide">
                                    {getStatusText(voucher.status)}
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Reference Number */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {voucher.reference_number}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Reference Number
                                </p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-8">
                                <QRCodeComponent 
                                    value={voucher.reference_number}
                                    size={200}
                                    className="border border-gray-200 dark:border-gray-600"
                                />
                            </div>

                            {/* Meal Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Meal Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div className="flex items-start space-x-3">
                                        <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Scheduled Date
                                            </p>
                                            <p className="text-gray-900 dark:text-white">
                                                {formatDate(voucher.scheduled_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="flex items-start space-x-3">
                                        <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Time Slot
                                            </p>
                                            <p className="text-gray-900 dark:text-white">
                                                {voucher.time_slot.display_name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Info */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                        Student Information
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">{voucher.student_name}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Course:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">{voucher.student_course}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Year:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">{voucher.student_year}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                                            <span className="ml-2 text-gray-900 dark:text-white">{voucher.student_phone}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-6 py-4">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Important Instructions:
                            </h4>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Present this voucher and a valid ID to Banned Books staff</li>
                                <li>• Arrive during your scheduled time slot</li>
                                <li>• Voucher expires at the end of your scheduled day</li>
                                <li>• Take a screenshot or save this page for offline access</li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 text-center">
                        <Link 
                            href="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
