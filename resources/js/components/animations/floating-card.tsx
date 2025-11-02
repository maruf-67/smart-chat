import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface FloatingCardProps extends HTMLMotionProps<'div'> {
    delay?: number;
    duration?: number;
}

/**
 * FloatingCard component with gentle levitation animation
 * Creates a subtle floating effect for cards and elements
 */
export function FloatingCard({
    children,
    delay = 0,
    duration = 3,
    ...props
}: FloatingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: [20, 0, -10, 0, 20],
            }}
            transition={{
                opacity: { delay, duration: 0.6 },
                y: {
                    delay: delay + 0.6,
                    duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
