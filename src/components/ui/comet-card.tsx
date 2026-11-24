"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const CometCard = ({
    rotateDepth = 17.5,
    translateDepth = 20,
    className,
    children,
}: {
    rotateDepth?: number;
    translateDepth?: number;
    className?: string;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastUpdate = useRef<number>(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(
        mouseYSpring,
        [-0.5, 0.5],
        [rotateDepth, -rotateDepth]
    );
    const rotateY = useTransform(
        mouseXSpring,
        [-0.5, 0.5],
        [-rotateDepth, rotateDepth]
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const now = performance.now();
        // Throttle to ~60fps (16ms) to avoid over-calculating on high-end mice
        if (now - lastUpdate.current < 16) return;
        lastUpdate.current = now;

        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
            }}
            className={cn("relative flex items-center justify-center", className)}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative group/card w-full h-full"
            >
                {children}
            </motion.div>
        </div>
    );
};

