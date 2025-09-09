import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircleIcon, ExclamationTriangleIcon, QrCodeIcon, TicketIcon } from '@heroicons/react/24/outline';
import QRScanner from '../../../components/QRScanner';
import AppLayout from '../../../layouts/app-layout';

interface ClaimResult {
    success: boolean;
    message: string;
    voucher?: {
        reference_number: string;
        student_name: string;
        time_slot: string;
    };
}

export default function VoucherScan() {
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanResult, setScanResult] = useState<ClaimResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleScan = async (scannedText: string) => {
        console.log('QR Code scanned:', scannedText);
        setIsProcessing(true);
        setError('');
        setScanResult(null);

        try {
            console.log('Making request to:', '/admin/vouchers/quick-claim');
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken ? 'Found' : 'Missing');
            
            const response = await fetch('/admin/vouchers/quick-claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    reference_number: scannedText.trim()
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                // Handle HTTP error responses
                const errorText = await response.text();
                console.error('HTTP Error Response:', errorText);
                
                if (response.status === 401) {
                    setError('Authentication required. Please log in again.');
                } else if (response.status === 403) {
                    setError('Permission denied. Admin access required.');
                } else if (response.status === 419) {
                    setError('Session expired. Please refresh the page.');
                } else if (response.status === 422) {
                    // Validation error
                    try {
                        const errorData = JSON.parse(errorText);
                        setError(errorData.message || 'Invalid voucher reference.');
                    } catch {
                        setError('Invalid voucher reference.');
                    }
                } else {
                    setError(`Server error (${response.status}). Please try again.`);
                }
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            setScanResult(data);
            
            if (!data.success) {
                setError(data.message);
            }
        } catch (err) {
            console.error('Network/Parse error:', err);
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Network connection failed. Check your internet connection.');
            } else if (err instanceof SyntaxError) {
                setError('Server response format error. Please try again.');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleStartScan = () => {
        setIsScanning(true);
        setScanResult(null);
        setError('');
    };

    const handleStopScan = () => {
        setIsScanning(false);
    };

    const resetScanner = () => {
        setScanResult(null);
        setError('');
        setIsScanning(false);
    };

    const navigateToVoucherList = () => {
        router.visit('/admin/vouchers');
    };

    return (
        <AppLayout>
            <Head title="Scan Voucher QR Code - PIF Meals Admin" />
            
            <div className="py-6">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Scan Voucher QR Code
                                </h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Scan a voucher QR code to automatically claim it
                                </p>
                            </div>
                            <button
                                onClick={navigateToVoucherList}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <TicketIcon className="h-4 w-4 mr-2" />
                                View All Vouchers
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Scanner Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-6">
                                <QrCodeIcon className="h-6 w-6 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    QR Code Scanner
                                </h2>
                            </div>

                            {isProcessing ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Processing voucher...</p>
                                </div>
                            ) : (
                                <QRScanner
                                    onScan={handleScan}
                                    onError={handleScanError}
                                    isScanning={isScanning}
                                    onStartScan={handleStartScan}
                                    onStopScan={handleStopScan}
                                />
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-center">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                        <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Scan Results
                            </h2>

                            {!scanResult ? (
                                <div className="text-center py-12">
                                    <QrCodeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Scan a QR code to see results here
                                    </p>
                                </div>
                            ) : scanResult.success ? (
                                <div className="space-y-4">
                                    <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                                        <div>
                                            <h3 className="font-semibold text-green-800 dark:text-green-400">
                                                Voucher Claimed Successfully!
                                            </h3>
                                            <p className="text-green-600 dark:text-green-300 text-sm">
                                                {scanResult.message}
                                            </p>
                                        </div>
                                    </div>

                                    {scanResult.voucher && (
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Voucher Details
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                                                    <span className="font-mono text-gray-900 dark:text-white">
                                                        {scanResult.voucher.reference_number}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Student:</span>
                                                    <span className="text-gray-900 dark:text-white">
                                                        {scanResult.voucher.student_name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Time Slot:</span>
                                                    <span className="text-gray-900 dark:text-white">
                                                        {scanResult.voucher.time_slot}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={resetScanner}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Scan Another Voucher
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                                        <div>
                                            <h3 className="font-semibold text-red-800 dark:text-red-400">
                                                Failed to Claim Voucher
                                            </h3>
                                            <p className="text-red-600 dark:text-red-300 text-sm">
                                                {scanResult.message}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetScanner}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            How to Use the Scanner:
                        </h3>
                        <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">1</span>
                                Click "Start Scanning" to activate your device's camera
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">2</span>
                                Point your camera at the voucher's QR code
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">3</span>
                                The voucher will automatically be claimed when scanned
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 text-xs flex items-center justify-center mr-2 mt-0.5 font-semibold">4</span>
                                View the results and scan another voucher if needed
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
