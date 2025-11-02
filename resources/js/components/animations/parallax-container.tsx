import { cn } from '@/lib/utils';
import type { HTMLMotionProps } from 'framer-motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxContainerProps extends HTMLMotionProps<'div'> {
    speed?: number;
}

/**
 * ParallaxContainer component with scroll-based parallax effect
 * Creates depth by moving elements at different speeds on scroll
 */
export function ParallaxContainer({
    children,
    speed = 0.5,
    className,
    style,
    ...props
}: ParallaxContainerProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

    return (
        <motion.div
            ref={ref}
            className={cn('relative', className)}
            style={{ ...style, y }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
