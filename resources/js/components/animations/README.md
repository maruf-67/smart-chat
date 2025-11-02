# Animation Components

This directory contains reusable Framer Motion animation components for the smart-chat application.

## Available Components

### 1. FadeIn

Smoothly fades in content.

```tsx
import { FadeIn } from '@/components/animations/fade-in';

<FadeIn delay={0.1} duration={0.5}>
    <div>Your content here</div>
</FadeIn>;
```

**Props:**

- `delay?: number` - Animation delay in seconds (default: 0)
- `duration?: number` - Animation duration in seconds (default: 0.5)
- All standard `div` props

---

### 2. SlideIn

Slides content in from specified direction.

```tsx
import { SlideIn } from '@/components/animations/slide-in';

<SlideIn direction="bottom" delay={0.2} duration={0.4}>
    <div>Your content here</div>
</SlideIn>;
```

**Props:**

- `direction?: 'top' | 'bottom' | 'left' | 'right'` - Slide direction (default: 'bottom')
- `delay?: number` - Animation delay in seconds (default: 0)
- `duration?: number` - Animation duration in seconds (default: 0.4)
- All standard `div` props

---

### 3. ScaleIn

Scales content from 95% to 100% while fading in.

```tsx
import { ScaleIn } from '@/components/animations/scale-in';

<ScaleIn delay={0.15} duration={0.3}>
    <div>Your content here</div>
</ScaleIn>;
```

**Props:**

- `delay?: number` - Animation delay in seconds (default: 0)
- `duration?: number` - Animation duration in seconds (default: 0.3)
- All standard `div` props

---

### 4. StaggerChildren

Animates children with staggered delays (perfect for lists).

```tsx
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';

<StaggerChildren staggerDelay={0.1} childDelay={0.2}>
    <div className="grid gap-4">
        <StaggerItem>
            <Stat label="Total Chats" value="24" />
        </StaggerItem>
        <StaggerItem>
            <Stat label="Active Agents" value="3" />
        </StaggerItem>
        <StaggerItem>
            <Stat label="Messages" value="142" />
        </StaggerItem>
    </div>
</StaggerChildren>;
```

**StaggerChildren Props:**

- `staggerDelay?: number` - Delay between each child animation (default: 0.1)
- `childDelay?: number` - Initial delay before first child (default: 0.1)
- All standard `div` props

**StaggerItem Props:**

- `delay?: number` - Additional delay for this specific item (default: 0)
- All standard `div` props

---

## Animation Variants

Pre-defined animation variants are available in `@/lib/animation-variants.ts`:

- `fadeInVariants`
- `slideInFromBottomVariants`
- `slideInFromTopVariants`
- `slideInFromLeftVariants`
- `slideInFromRightVariants`
- `scaleInVariants`
- `staggerContainerVariants`
- `staggerItemVariants`
- `pageTransitionVariants`

---

## Usage Examples

### Dashboard Stats with Stagger

```tsx
<StaggerChildren staggerDelay={0.08} childDelay={0.2}>
    <div className="grid gap-4 md:grid-cols-4">
        <StaggerItem>
            <Stat label="Total Chats" value="24" />
        </StaggerItem>
        <StaggerItem>
            <Stat label="Active Agents" value="3" />
        </StaggerItem>
        <StaggerItem>
            <Stat label="Pending" value="5" />
        </StaggerItem>
        <StaggerItem>
            <Stat label="Messages" value="142" />
        </StaggerItem>
    </div>
</StaggerChildren>
```

### Hero Section

```tsx
<FadeIn delay={0.1}>
    <h1>Welcome back, Admin!</h1>
    <p>Here's an overview of your system.</p>
</FadeIn>

<SlideIn direction="bottom" delay={0.3}>
    <div className="grid gap-4">
        {/* Your content */}
    </div>
</SlideIn>
```

### Interactive Cards

```tsx
<ScaleIn delay={0.2}>
    <div className="rounded-lg border p-6 transition-all hover:shadow-lg">
        <h2>Recent Activity</h2>
        <p>View your latest updates</p>
    </div>
</ScaleIn>
```

---

## Performance Tips

1. **Use `delay` wisely**: Space out animations to create a polished feel (0.1-0.2s between elements)
2. **Keep `duration` short**: 0.3-0.5s feels snappy (avoid > 1s)
3. **Combine with Tailwind transitions**: Add `transition-all hover:scale-105` for hover effects
4. **Use StaggerChildren for lists**: More efficient than multiple individual animations

---

## Browser Support

Requires Framer Motion 12.x, which supports:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers with CSS transforms and transitions

---

## Implementation

All components use:

- **Easing**: `[0.4, 0, 0.2, 1]` (easeOut cubic-bezier)
- **TypeScript**: Full type safety with HTMLMotionProps
- **Accessibility**: Respects `prefers-reduced-motion`
