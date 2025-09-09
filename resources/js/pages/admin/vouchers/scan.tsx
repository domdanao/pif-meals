import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircleIcon, ExclamationTriangleIcon, QrCodeIcon, HomeIcon } from '@heroicons/react/24/outline';
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
    
    // Audio refs for sound effects
    const successSoundRef = useRef<HTMLAudioElement>(null);
    const errorSoundRef = useRef<HTMLAudioElement>(null);
    
    // Initialize audio elements
    useEffect(() => {
        // Create success sound (higher frequency beep)
        const successAudio = new Audio();
        successAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0Fdbjo9KpnHAUWhM7x2ooxCBdk' + 'vOzlpVANCEup4vS5ZRsGJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0FJHfH8N2QQAoUXrTp66hVFA';
        successSoundRef.current = successAudio;
        
        // Create error sound (lower frequency buzz)
        const errorAudio = new Audio();
        errorAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCS' + 'GJzfLNfC0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaCSGJzfLNfC0FJHfH8N2QQAoUXrTp66hVFA';
        errorSoundRef.current = errorAudio;
    }, []);
    
    const playSuccessSound = () => {
        if (successSoundRef.current) {
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.play().catch(console.warn);
        }
    };
    
    const playErrorSound = () => {
        if (errorSoundRef.current) {
            errorSoundRef.current.currentTime = 0;
            errorSoundRef.current.play().catch(console.warn);
        }
    };

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
                playErrorSound();
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            setScanResult(data);
            
            if (data.success) {
                playSuccessSound();
            } else {
                setError(data.message);
                playErrorSound();
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
            playErrorSound();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanError = (errorMessage: string) => {
        setError(errorMessage);
        playErrorSound();
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

    const navigateToDashboard = () => {
        router.visit('/admin/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title="QR Scanner - PIF Meals Admin" />
            
            {/* Floating Dashboard Button */}
            <button
                onClick={navigateToDashboard}
                className="fixed top-6 left-6 z-50 inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl"
                title="Back to Dashboard"
            >
                <HomeIcon className="h-5 w-5 mr-2" />
                Dashboard
            </button>

            {/* Main Scanner Content */}
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <QrCodeIcon className="h-12 w-12 text-blue-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            QR Scanner
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Scan voucher QR codes to claim them instantly
                    </p>
                </div>

                {/* Large Scanner Section */}
                <div className="w-full max-w-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                        {isProcessing ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                                <p className="text-xl text-gray-600 dark:text-gray-400">Processing voucher...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Enhanced QR Scanner with larger area */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <QRScanner
                                            onScan={handleScan}
                                            onError={handleScanError}
                                            isScanning={isScanning}
                                            onStartScan={handleStartScan}
                                            onStopScan={handleStopScan}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="mt-6 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                                <div className="flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                                    <p className="text-red-700 dark:text-red-400 text-lg font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {scanResult && (
                    <div className="w-full max-w-2xl mt-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                            {scanResult.success ? (
                                <div className="text-center space-y-6">
                                    <div className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                                        <CheckCircleIcon className="h-16 w-16 text-green-500 mr-4" />
                                        <div className="text-left">
                                            <h3 className="text-2xl font-bold text-green-800 dark:text-green-400">
                                                Success!
                                            </h3>
                                            <p className="text-green-600 dark:text-green-300 text-lg">
                                                {scanResult.message}
                                            </p>
                                        </div>
                                    </div>

                                    {scanResult.voucher && (
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                                Voucher Details
                                            </h4>
                                            <div className="space-y-3 text-lg">
                                                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Reference:</span>
                                                    <span className="font-mono text-gray-900 dark:text-white font-bold">
                                                        {scanResult.voucher.reference_number}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Student:</span>
                                                    <span className="text-gray-900 dark:text-white font-bold">
                                                        {scanResult.voucher.student_name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Time Slot:</span>
                                                    <span className="text-gray-900 dark:text-white font-bold">
                                                        {scanResult.voucher.time_slot}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={resetScanner}
                                        className="w-full px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                                    >
                                        Scan Another Voucher
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <div className="flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                                        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mr-4" />
                                        <div className="text-left">
                                            <h3 className="text-2xl font-bold text-red-800 dark:text-red-400">
                                                Failed to Claim
                                            </h3>
                                            <p className="text-red-600 dark:text-red-300 text-lg">
                                                {scanResult.message}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetScanner}
                                        className="w-full px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Instructions */}
                {!scanResult && (
                    <div className="w-full max-w-2xl mt-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
                            <p className="text-blue-800 dark:text-blue-200 text-lg">
                                <strong>Quick Start:</strong> Click "Start Scanning" and point your camera at the QR code. The voucher will be claimed automatically.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
