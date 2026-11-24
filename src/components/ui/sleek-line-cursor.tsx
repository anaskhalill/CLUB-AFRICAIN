"use client";

import React, { useEffect, useRef, useState } from "react";

export function SleekLineCursor() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const mousePos = useRef({ x: 0, y: 0 });
    const pointsRef = useRef<{ x: number; y: number }[]>([]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);

        const animate = () => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const localX = mousePos.current.x - rect.left;
            const localY = mousePos.current.y - rect.top;

            // Update points for smooth trail
            const newPoints = [...pointsRef.current];
            newPoints.push({ x: localX, y: localY });

            // Keep only last N points for the trail
            if (newPoints.length > 20) {
                newPoints.shift();
            }

            // Smoothing effect
            for (let i = 0; i < newPoints.length - 1; i++) {
                newPoints[i].x += (newPoints[i + 1].x - newPoints[i].x) * 0.2;
                newPoints[i].y += (newPoints[i + 1].y - newPoints[i].y) * 0.2;
            }

            pointsRef.current = [...newPoints];
            setPoints([...newPoints]);
            requestAnimationFrame(animate);
        };

        const animFrame = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    if (points.length < 2) return null;

    // Build SVG path
    const pathData = points.reduce((acc, point, i) => {
        return acc + (i === 0 ? `M${point.x},${point.y}` : ` L${point.x},${point.y}`);
    }, "");

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
            <svg className="h-full w-full overflow-visible">
                <path
                    d={pathData}
                    fill="none"
                    stroke="#C8102E"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                    style={{
                        filter: "drop-shadow(0 0 8px rgba(200, 16, 46, 0.5))",
                    }}
                />
                {/* Cursor Head */}
                <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="6"
                    fill="#C8102E"
                    className="opacity-80"
                />
            </svg>
        </div>
    );
}
