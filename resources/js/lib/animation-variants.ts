/**
 * Reusable Framer Motion animation variants
 * Used across the application for consistent animations
 */

export const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1], // easeOut cubic-bezier
        },
    },
};

export const slideInFromBottomVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const slideInFromTopVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const slideInFromLeftVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const slideInFromRightVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export const pageTransitionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.6, 1],
        },
    },
};
