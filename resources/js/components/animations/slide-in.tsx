import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface SlideInProps extends HTMLMotionProps<'div'> {
    direction?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    duration?: number;
}

export function SlideIn({
    children,
    direction = 'bottom',
    delay = 0,
    duration = 0.6,
    ...props
}: SlideInProps) {
    const getInitial = () => {
        switch (direction) {
            case 'top':
                return { opacity: 0, y: -40 };
            case 'bottom':
                return { opacity: 0, y: 40 };
            case 'left':
                return { opacity: 0, x: -40 };
            case 'right':
                return { opacity: 0, x: 40 };
        }
    };

    return (
        <motion.div
            initial={getInitial()}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{
                delay,
                duration,
                ease: [0.4, 0, 0.2, 1],
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
