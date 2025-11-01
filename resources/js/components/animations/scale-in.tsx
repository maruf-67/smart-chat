import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface ScaleInProps extends HTMLMotionProps<'div'> {
    delay?: number;
    duration?: number;
}

export function ScaleIn({
    children,
    delay = 0,
    duration = 0.3,
    ...props
}: ScaleInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
