# Design Libraries Reference

Libraries that complement our UI stack.

## Stack Defaults (Use These First)

| Category | Library | Notes |
|----------|---------|-------|
| Icons | lucide-react | Clean line icons, tree-shakeable |
| Animation | Framer Motion 11+ | Gestures, layout animations |
| Animation | tailwindcss-animate | CSS keyframe utilities |
| Components | shadcn/ui | 50+ pre-styled components |
| Primitives | Radix UI | Accessible headless primitives |
| Styling | Tailwind CSS | Utility-first CSS |
| Utilities | clsx, tailwind-merge, cva | Class name helpers |

---

## Extended Options

### Icons

| Library | Best For | Install |
|---------|----------|---------|
| lucide-react | Clean line icons (default) | `npm i lucide-react` |
| @phosphor-icons/react | Multiple weights (thin/light/regular/bold/fill/duotone) | `npm i @phosphor-icons/react` |
| @heroicons/react | Tailwind ecosystem, outline/solid variants | `npm i @heroicons/react` |
| react-icons | All-in-one (FA, Material, Feather, etc.) | `npm i react-icons` |
| @fortawesome/react-fontawesome | Brand icons, social media | `npm i @fortawesome/react-fontawesome` |

**Usage Pattern:**
```tsx
// lucide-react (default)
import { Search, Menu, X } from 'lucide-react';

// phosphor
import { MagnifyingGlass } from '@phosphor-icons/react';

// heroicons
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// react-icons (tree-shake specific packs)
import { FaGithub } from 'react-icons/fa';
```

---

### Illustrations

| Library | Type | URL | Best For |
|---------|------|-----|----------|
| unDraw | Flat SVG | undraw.co | Marketing pages, empty states |
| Humaans | Characters | humaaans.com | Team pages, onboarding |
| Storyset | Animated | storyset.com | Landing pages, features |
| Open Peeps | Hand-drawn | openpeeps.com | Casual/friendly UIs |
| Blush | Mix-and-match | blush.design | Custom illustrations |

**Usage:**
- Download SVG/PNG and place in `/public/images/`
- For animated: use Lottie format when available

---

### Typography

| Service | Usage | Best For |
|---------|-------|----------|
| Google Fonts | `next/font` or `@fontsource/*` | Production apps |
| Variable Fonts | Single file, dynamic weight/width | Performance optimization |
| Bunny Fonts | GDPR-compliant Google Fonts proxy | EU compliance |

**Next.js Pattern:**
```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**Tailwind Config:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
};
```

---

### Animations

| Library | Use Case | Install |
|---------|----------|---------|
| Framer Motion | Gestures, layout animations, exit animations | `npm i framer-motion` |
| tailwindcss-animate | Simple CSS keyframes | `npm i tailwindcss-animate` |
| @lottiefiles/react-lottie-player | Icon animations, loaders | `npm i @lottiefiles/react-lottie-player` |
| GSAP | Complex scroll/timeline animations | `npm i gsap` |
| AutoAnimate | Zero-config list animations | `npm i @formkit/auto-animate` |

**Framer Motion Pattern:**
```tsx
import { motion, AnimatePresence } from 'framer-motion';

export function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

**Lottie Pattern:**
```tsx
import { Player } from '@lottiefiles/react-lottie-player';

export function LoadingSpinner() {
  return (
    <Player
      autoplay
      loop
      src="/animations/loading.json"
      style={{ height: 100, width: 100 }}
    />
  );
}
```

---

### Backgrounds & Patterns

| Tool | Output | URL |
|------|--------|-----|
| Haikei | SVG blobs, waves, gradients | haikei.app |
| SVG Backgrounds | Repeating patterns | svgbackgrounds.com |
| CSS Gradient | Gradient generator | cssgradient.io |
| Mesh Gradient | Mesh gradient generator | meshgradient.in |

**Usage:**
```tsx
// As background image
<div
  className="bg-cover bg-center"
  style={{ backgroundImage: 'url(/backgrounds/blob.svg)' }}
>
  Content
</div>

// As inline SVG for animation
import BlobSvg from '@/components/backgrounds/Blob';
```

---

### 3D & Interactive

| Tool | Type | URL |
|------|------|-----|
| Spline | 3D scenes | spline.design |
| Three.js | 3D graphics | threejs.org |
| React Three Fiber | React + Three.js | docs.pmnd.rs/react-three-fiber |

**Spline Embed:**
```tsx
import Spline from '@splinetool/react-spline';

export function Hero3D() {
  return (
    <Spline scene="https://prod.spline.design/xxx/scene.splinecode" />
  );
}
```

---

## Platform-Specific

### React Native / Expo

| Category | Library | Install |
|----------|---------|---------|
| Icons | @expo/vector-icons | Built-in (Ionicons, MaterialIcons, etc.) |
| Animation | react-native-reanimated | `npx expo install react-native-reanimated` |
| Styling | NativeWind | `npm i nativewind` |
| Gestures | react-native-gesture-handler | `npx expo install react-native-gesture-handler` |

```tsx
// Expo icons
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="heart" size={24} color="red" />
```

---

### Telegram Mini Apps

| Category | Approach |
|----------|----------|
| Icons | Inline SVG or lucide-react (small bundle) |
| Animation | CSS animations (avoid heavy JS libs) |
| Theme | Telegram CSS variables (`var(--tg-theme-*)`) |
| Styling | Tailwind + CSS variables |

```css
/* Match Telegram theme */
.button {
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
}
```

---

### ChatGPT Apps

| Category | Approach |
|----------|----------|
| Icons | lucide-react (consistent with ChatGPT UI) |
| Theme | ChatGPT CSS variables |
| Animation | Subtle CSS transitions |
| Styling | Tailwind |

```css
/* Match ChatGPT theme */
.message {
  background: var(--main-surface-primary);
  color: var(--text-primary);
}
```

---

## Recommendations by Project Type

| Project | Icons | Illustrations | Animation |
|---------|-------|---------------|-----------|
| SaaS Dashboard | lucide-react | None | Framer Motion |
| Marketing Site | Heroicons | unDraw/Storyset | GSAP/Lottie |
| Mobile App | Ionicons | Humaans | Reanimated |
| Developer Tool | Phosphor | None | tailwindcss-animate |
| E-commerce | lucide-react | Open Peeps | Framer Motion |

---

## Performance Tips

1. **Tree-shake icons**: Import individually, not `import * from`
2. **Lazy-load illustrations**: Use `next/image` or dynamic imports
3. **Defer animations**: Use `IntersectionObserver` for scroll-triggered
4. **Compress SVGs**: Use SVGO before adding to project
5. **Subset fonts**: Only include characters you need

```tsx
// Good - tree-shakes
import { Search, Menu } from 'lucide-react';

// Bad - imports entire library
import * as Icons from 'lucide-react';
```
