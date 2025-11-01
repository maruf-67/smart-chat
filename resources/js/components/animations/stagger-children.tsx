import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerChildrenProps
    extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    staggerDelay?: number;
    childDelay?: number;
}

export function StaggerChildren({
    children,
    staggerDelay = 0.1,
    childDelay = 0.1,
    ...props
}: StaggerChildrenProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: childDelay,
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {
    delay?: number;
}

export function StaggerItem({
    children,
    delay = 0,
    ...props
}: StaggerItemProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                        delay,
                    },
                },
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
