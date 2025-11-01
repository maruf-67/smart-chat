import type { HTMLMotionProps } from 'framer-motion';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { MouseEvent } from 'react';
import { useCallback, useRef } from 'react';

interface TiltCardProps extends Omit<HTMLMotionProps<'div'>, 'onMouseMove'> {
    tiltAmount?: number;
}

/**
 * TiltCard component with 3D tilt effect on mouse hover
 * Creates an interactive 3D perspective effect based on cursor position
 * Optimized with reduced spring stiffness and simplified shadow calculations
 */
export function TiltCard({
    children,
    tiltAmount = 8, // Reduced from 15 for subtler effect
    ...props
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const lastUpdate = useRef<number>(0);

    // Motion values for rotation
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    // Optimized spring config for smoother, less jarring animations
    const springConfig = { stiffness: 150, damping: 25 };
    const rotateXSpring = useSpring(rotateX, springConfig);
    const rotateYSpring = useSpring(rotateY, springConfig);

    // Throttled mouse move handler (16ms = ~60fps)
    const handleMouseMove = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            const now = Date.now();
            if (now - lastUpdate.current < 16) return; // Throttle to 60fps
            lastUpdate.current = now;

            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Calculate mouse position relative to card center
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate rotation values
            const rotY = ((mouseX - width / 2) / width) * tiltAmount;
            const rotX = -((mouseY - height / 2) / height) * tiltAmount;

            rotateX.set(rotX);
            rotateY.set(rotY);
        },
        [tiltAmount, rotateX, rotateY],
    );

    const handleMouseLeave = useCallback(() => {
        rotateX.set(0);
        rotateY.set(0);
    }, [rotateX, rotateY]);

    return (
        <motion.div
            ref={ref}
            style={{
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }} // Reduced from 1.05 for subtler effect
            transition={{ type: 'spring', stiffness: 150, damping: 25 }} // Match spring config
            {...props}
        >
            {children}
        </motion.div>
    );
}
