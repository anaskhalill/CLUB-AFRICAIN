'use client';

import { useRef, useState, useEffect } from 'react';

interface SpinningTextProps {
    text: string;
    className?: string;
}

export function SpinningText({ text, className = '' }: SpinningTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState(0);
    const animationRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let angle = 0;
        const radius = 120; // Radius of the circular path

        const animate = () => {
            angle += 0.5; // Adjust speed here
            setRotation(angle);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Split text into characters for individual positioning
    const characters = text.split('');

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center ${className}`}
            style={{ height: '350px', width: '100%' }}
        >
            {characters.map((char, index) => {
                const totalChars = characters.length;
                const anglePerChar = (2 * Math.PI) / totalChars;
                const angle = (index * anglePerChar * 180) / Math.PI + rotation;

                return (
                    <span
                        key={index}
                        className="absolute text-lg font-medium text-white/80"
                        style={{
                            transform: `rotate(${angle}deg) translateY(-120px)`,
                            transformOrigin: 'center 120px',
                        }}
                    >
                        {char}
                    </span>
                );
            })}
            {/* Center circle */}
            <div className="h-4 w-4 rounded-full bg-white/20" />
        </div>
    );
}
