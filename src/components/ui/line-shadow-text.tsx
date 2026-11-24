"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface LineShadowTextProps {
    children: React.ReactNode;
    className?: string;
    shadowColor?: string;
    theme?: string;
}

export function LineShadowText({
    children,
    className = "",
    shadowColor,
    theme = "dark",
}: LineShadowTextProps) {
    // Determine shadow color based on theme or prop
    const color = useMemo(() => {
        if (shadowColor) return shadowColor;
        return theme === "dark" ? "#ffffff" : "#000000";
    }, [theme, shadowColor]);

    return (
        <span
            className={`relative inline-block ${className}`}
            style={{
                textShadow: `
          2px 2px 0 ${color},
          4px 4px 0 ${color},
          6px 6px 0 ${color},
          8px 8px 0 ${color},
          10px 10px 0 ${color},
          12px 12px 0 ${color},
          14px 14px 0 ${color},
          16px 16px 0 ${color},
          18px 18px 0 ${color},
          20px 20px 0 ${color}
        `,
            }}
        >
            {children}
        </span>
    );
}

// Alternative version with animation
export function AnimatedLineShadowText({
    children,
    className = "",
    shadowColor,
    theme = "dark",
}: LineShadowTextProps) {
    const color = useMemo(() => {
        if (shadowColor) return shadowColor;
        return theme === "dark" ? "#ffffff" : "#000000";
    }, [theme, shadowColor]);

    return (
        <motion.span
            initial={{
                textShadow: `
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color},
          0px 0px 0 ${color}
        `,
            }}
            animate={{
                textShadow: `
          2px 2px 0 ${color},
          4px 4px 0 ${color},
          6px 6px 0 ${color},
          8px 8px 0 ${color},
          10px 10px 0 ${color},
          12px 12px 0 ${color},
          14px 14px 0 ${color},
          16px 16px 0 ${color},
          18px 18px 0 ${color},
          20px 20px 0 ${color}
        `,
            }}
            transition={{
                duration: 0.8,
                ease: "easeOut"
            }}
            className={`relative inline-block ${className}`}
        >
            {children}
        </motion.span>
    );
}
