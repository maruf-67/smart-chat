import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface FadeInProps extends HTMLMotionProps<'div'> {
    delay?: number;
    duration?: number;
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.6,
    ...props
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
