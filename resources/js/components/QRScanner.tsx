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
    const [selectedCameraLabel, setSelectedCameraLabel] = useState<string>('');

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
            
            // Prefer rear camera over front camera for QR scanning
            let selectedDeviceId: string | undefined;
            if (availableDevices.length > 0) {
                // Look for rear-facing camera first (better for QR scanning)
                const rearCamera = availableDevices.find(device => 
                    device.label.toLowerCase().includes('back') ||
                    device.label.toLowerCase().includes('rear') ||
                    device.label.toLowerCase().includes('environment') ||
                    !device.label.toLowerCase().includes('front') && !device.label.toLowerCase().includes('user')
                );
                
                selectedDeviceId = rearCamera ? rearCamera.deviceId : availableDevices[0].deviceId;
                const selectedCamera = rearCamera || availableDevices[0];
                setSelectedCameraLabel(selectedCamera.label);
                console.log('QRScanner: Available cameras:', availableDevices.map(d => ({ id: d.deviceId, label: d.label })));
                console.log('QRScanner: Selected camera:', selectedCamera.label);
            }
            console.log('QRScanner: Using device ID:', selectedDeviceId);
            
            console.log('QRScanner: Starting video decode...');
            
            // If no specific device found, try using facingMode constraint for rear camera
            if (!selectedDeviceId) {
                try {
                    // Use MediaTrackConstraints to prefer rear camera
                    const constraints = {
                        video: {
                            facingMode: { ideal: 'environment' } // 'environment' = rear camera, 'user' = front camera
                        }
                    };
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    setSelectedCameraLabel('Rear Camera (Environment)');
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        await videoRef.current.play();
                        
                        // Now use ZXing to decode from the video element
                        await codeReader.decodeFromVideoElement(
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
                    }
                } catch (constraintError) {
                    console.warn('QRScanner: Failed to use facingMode constraint, falling back to device selection:', constraintError);
                    // Fallback to original method
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
                }
            } else {
                // Use the selected device ID
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
            }
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
        
        // Clean up video stream if we created it manually
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
                track.stop();
            });
            videoRef.current.srcObject = null;
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
                <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Position the QR code within the scanning area
                    </p>
                    {selectedCameraLabel && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Using: {selectedCameraLabel}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
