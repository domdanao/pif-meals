import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface QRScannerProps {
    onScan: (result: string) => void;
    onError?: (error: string) => void;
    isScanning: boolean;
    onStartScan: () => void;
    onStopScan: () => void;
}

export default function QRScanner({ 
    onScan, 
    onError, 
    isScanning, 
    onStartScan, 
    onStopScan 
}: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        console.log('QRScanner: Initializing scanner...');
        const reader = new BrowserMultiFormatReader();
        setCodeReader(reader);

        // Get available video devices
        reader.listVideoInputDevices().then((devices) => {
            console.log('QRScanner: Found devices:', devices);
            setAvailableDevices(devices);
            if (devices.length > 0) {
                setHasPermission(true);
                console.log('QRScanner: Permission granted, devices available');
            } else {
                console.log('QRScanner: No devices found');
                setHasPermission(false);
                onError?.('No camera devices found.');
            }
        }).catch((error) => {
            console.error('QRScanner: Error getting video devices:', error);
            setHasPermission(false);
            onError?.('Camera access is required to scan QR codes.');
        });

        return () => {
            console.log('QRScanner: Cleaning up...');
            reader.reset();
        };
    }, [onError]);

    const startScanning = async () => {
        console.log('QRScanner: Start scanning button clicked');
        console.log('QRScanner: CodeReader available:', !!codeReader);
        console.log('QRScanner: Video ref available:', !!videoRef.current);
        console.log('QRScanner: Available devices:', availableDevices);
        
        if (!codeReader || !videoRef.current) {
            console.error('QRScanner: Missing codeReader or videoRef');
            return;
        }

        try {
            console.log('QRScanner: Calling onStartScan');
            onStartScan();
            
            // Use the first available camera (typically back camera on mobile)
            const selectedDeviceId = availableDevices.length > 0 ? availableDevices[0].deviceId : undefined;
            console.log('QRScanner: Using device ID:', selectedDeviceId);
            
            console.log('QRScanner: Starting video decode...');
            await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result, error) => {
                    if (result) {
                        console.log('QRScanner: QR code detected:', result.getText());
                        const scannedText = result.getText();
                        onScan(scannedText);
                        stopScanning();
                    }
                    if (error && !(error instanceof NotFoundException)) {
                        console.error('QR scan error:', error);
                        onError?.('Error scanning QR code. Please try again.');
                    }
                }
            );
            console.log('QRScanner: Video decode started successfully');
        } catch (error) {
            console.error('QRScanner: Error starting scan:', error);
            onError?.('Failed to start camera. Please check permissions.');
            onStopScan();
        }
    };

    const stopScanning = () => {
        if (codeReader) {
            codeReader.reset();
        }
        onStopScan();
    };

    if (hasPermission === null) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Checking camera permissions...</p>
            </div>
        );
    }

    if (hasPermission === false) {
        return (
            <div className="text-center py-8">
                <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">
                    Camera access is required to scan QR codes.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please enable camera permissions in your browser and refresh the page.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Always render video element, but hide/show based on scanning state */}
            <div className="relative">
                <video
                    ref={videoRef}
                    className={`w-full max-w-md mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 ${
                        isScanning ? 'block' : 'hidden'
                    }`}
                    style={{ aspectRatio: '1/1' }}
                    playsInline
                    muted
                />
                
                {isScanning && (
                    <>
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 border-2 border-blue-500 rounded-lg">
                                <div className="w-full h-full border-2 border-blue-500 rounded-lg animate-pulse opacity-50"></div>
                            </div>
                        </div>
                        
                        {/* Stop button */}
                        <button
                            onClick={stopScanning}
                            className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>
            
            {!isScanning && (
                <div className="text-center py-8">
                    <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Point your camera at a QR code to scan
                    </p>
                    <button
                        onClick={startScanning}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <CameraIcon className="h-5 w-5 mr-2" />
                        Start Scanning
                    </button>
                </div>
            )}
            
            {isScanning && (
                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Position the QR code within the scanning area
                    </p>
                </div>
            )}
        </div>
    );
}
