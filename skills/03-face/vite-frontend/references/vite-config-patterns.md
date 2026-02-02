# Vite Configuration Patterns

Advanced Vite configuration for production applications.

## Basic Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## Environment Variables

### Defining Variables
```bash
# .env (local development)
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=My App
VITE_FEATURE_FLAG=true

# .env.production (production build)
VITE_API_URL=https://api.myapp.com
VITE_APP_NAME=My App
VITE_FEATURE_FLAG=false

# .env.staging (staging environment)
VITE_API_URL=https://staging-api.myapp.com
```

### Using Variables
```typescript
// Only variables prefixed with VITE_ are exposed
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Built-in variables
const isDev = import.meta.env.DEV;        // true in development
const isProd = import.meta.env.PROD;      // true in production
const mode = import.meta.env.MODE;        // 'development' | 'production' | 'staging'
```

### TypeScript Support
```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_FEATURE_FLAG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Proxy Configuration

### API Proxy for Development
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Simple proxy
      '/api': 'http://localhost:3001',

      // With path rewrite
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },

      // WebSocket proxy
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },

      // Multiple backends
      '/users': 'http://localhost:3002',
      '/products': 'http://localhost:3003',
    },
  },
});
```

### Proxy with Authentication
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Custom-Header', 'value');
          });
        },
      },
    },
  },
});
```

---

## Build Optimization

### Code Splitting
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Vendor chunk for UI libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          // Vendor chunk for utilities
          'utils-vendor': ['date-fns', 'lodash-es'],
        },
      },
    },
  },
});
```

### Dynamic Import Chunking
```typescript
// Automatic chunk for dynamically imported modules
const Dashboard = lazy(() => import('./routes/dashboard'));
const Settings = lazy(() => import('./routes/settings'));
```

### Chunk Size Warnings
```typescript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // KB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split each package into its own chunk
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
});
```

---

## Path Aliases

### Configuration
```typescript
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
});
```

### TypeScript Support
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

---

## Plugin Ecosystem

### Essential Plugins
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    // React with SWC (faster builds)
    react(),

    // Bundle analyzer (generates stats.html)
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
    }),

    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),

    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

### SVG as Components
```typescript
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
});

// Usage
import { ReactComponent as Logo } from './logo.svg';
// or
import Logo from './logo.svg?react';
```

### PWA Support
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

---

## Development Server

### HTTPS for Local Development
```typescript
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    port: 3000,
  },
});
```

### Custom Certificates
```typescript
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem'),
    },
  },
});
```

### CORS Configuration
```typescript
export default defineConfig({
  server: {
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:3002'],
      credentials: true,
    },
  },
});
```

---

## Production Build

### Output Configuration
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // or 'hidden' for production
    minify: 'esbuild', // or 'terser' for more control
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
```

### Legacy Browser Support
```typescript
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
});
```

---

## Monorepo Configuration

### Workspace Packages
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@myorg/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@myorg/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  optimizeDeps: {
    include: ['@myorg/ui', '@myorg/utils'],
  },
});
```

---

## Full Production Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'production' && compression({ algorithm: 'gzip' }),
    mode === 'analyze' && visualizer({ open: true }),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));
```
