import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { CameraIcon, XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';

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
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [maxZoom, setMaxZoom] = useState<number>(3);
    const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

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
                    // Use enhanced MediaTrackConstraints for rear camera with close-up focus
                    const constraints = {
                        video: {
                            facingMode: { ideal: 'environment' }, // 'environment' = rear camera
                            width: { ideal: 1280, max: 1920 },
                            height: { ideal: 720, max: 1080 },
                            focusMode: { ideal: 'continuous' },
                            focusDistance: { ideal: 0.1 }, // Close focus for QR codes
                            zoom: { ideal: zoomLevel, max: maxZoom }
                        }
                    };
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    setCurrentStream(stream);
                    setSelectedCameraLabel('Rear Camera (Environment)');
                    
                    // Get camera capabilities for zoom control
                    const videoTrack = stream.getVideoTracks()[0];
                    if (videoTrack) {
                        const capabilities = videoTrack.getCapabilities();
                        if (capabilities.zoom) {
                            setMaxZoom(capabilities.zoom.max || 3);
                            console.log('Camera zoom range:', capabilities.zoom);
                        }
                    }
                    
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

    const handleZoomChange = async (newZoom: number) => {
        if (!currentStream) return;
        
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack) {
            try {
                await videoTrack.applyConstraints({
                    zoom: newZoom
                });
                setZoomLevel(newZoom);
                console.log('Zoom applied:', newZoom);
            } catch (error) {
                console.warn('Zoom not supported or failed:', error);
            }
        }
    };

    const stopScanning = () => {
        if (codeReader) {
            codeReader.reset();
        }
        
        // Clean up video stream if we created it manually
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
            setCurrentStream(null);
        }
        
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
                    className={`w-full max-w-lg mx-auto rounded-2xl border-4 border-gray-300 dark:border-gray-600 shadow-2xl ${
                        isScanning ? 'block' : 'hidden'
                    }`}
                    style={{ aspectRatio: '4/3', minHeight: '400px' }}
                    playsInline
                    muted
                />
                
                {isScanning && (
                    <>
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border-4 border-blue-500 rounded-2xl shadow-lg">
                                <div className="w-full h-full border-4 border-blue-400 rounded-2xl animate-pulse opacity-60"></div>
                            </div>
                        </div>
                        
                        {/* Stop button */}
                        <button
                            onClick={stopScanning}
                            className="absolute top-6 right-6 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        
                        {/* Zoom controls */}
                        {maxZoom > 1 && (
                            <div className="absolute bottom-6 right-6 flex flex-col space-y-3">
                                <button
                                    onClick={() => handleZoomChange(Math.min(maxZoom, zoomLevel + 0.5))}
                                    disabled={zoomLevel >= maxZoom}
                                    className="bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-colors disabled:opacity-30 shadow-lg"
                                    title="Zoom In"
                                >
                                    <MagnifyingGlassPlusIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleZoomChange(Math.max(1, zoomLevel - 0.5))}
                                    disabled={zoomLevel <= 1}
                                    className="bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-colors disabled:opacity-30 shadow-lg"
                                    title="Zoom Out"
                                >
                                    <MagnifyingGlassMinusIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {!isScanning && (
                <div className="text-center py-16">
                    <CameraIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                        Point your camera at a QR code to scan
                    </p>
                    <button
                        onClick={startScanning}
                        className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <CameraIcon className="h-6 w-6 mr-3" />
                        Start Scanning
                    </button>
                </div>
            )}
            
            {isScanning && (
                <div className="text-center space-y-3 mt-6">
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                        Position the QR code within the scanning area
                    </p>
                    {selectedCameraLabel && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Using: {selectedCameraLabel}
                        </p>
                    )}
                    {maxZoom > 1 && zoomLevel > 1 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Zoom: {zoomLevel.toFixed(1)}x
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
