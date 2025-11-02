import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface RotateInProps extends HTMLMotionProps<'div'> {
    delay?: number;
    duration?: number;
    axis?: 'x' | 'y' | 'z';
}

/**
 * RotateIn component with 3D rotation entrance animation
 * Rotates element into view with perspective
 */
export function RotateIn({
    children,
    delay = 0,
    duration = 0.8,
    axis = 'y',
    ...props
}: RotateInProps) {
    const getInitial = () => {
        switch (axis) {
            case 'x':
                return { opacity: 0, rotateX: -90, scale: 0.8 };
            case 'y':
                return { opacity: 0, rotateY: -90, scale: 0.8 };
            case 'z':
                return { opacity: 0, rotateZ: -90, scale: 0.8 };
        }
    };

    const getAnimate = () => {
        switch (axis) {
            case 'x':
                return { opacity: 1, rotateX: 0, scale: 1 };
            case 'y':
                return { opacity: 1, rotateY: 0, scale: 1 };
            case 'z':
                return { opacity: 1, rotateZ: 0, scale: 1 };
        }
    };

    return (
        <motion.div
            initial={getInitial()}
            animate={getAnimate()}
            transition={{
                delay,
                duration,
                ease: [0.4, 0, 0.2, 1],
            }}
            style={{
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
