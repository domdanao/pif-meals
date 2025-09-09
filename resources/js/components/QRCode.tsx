import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
    value: string;
    size?: number;
    className?: string;
}

export default function QRCodeComponent({ 
    value, 
    size = 128, 
    className = '' 
}: QRCodeComponentProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }).catch(error => {
                console.error('Error generating QR code:', error);
            });
        }
    }, [value, size]);

    return (
        <canvas 
            ref={canvasRef} 
            className={`rounded-lg ${className}`}
            style={{ width: size, height: size }}
        />
    );
}
