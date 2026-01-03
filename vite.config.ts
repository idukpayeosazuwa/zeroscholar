import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Enable source maps for debugging in production
        sourcemap: false,
        // Optimize chunk sizes
        rollupOptions: {
          output: {
            // Hash-based filenames ensure cache busting only when content changes
            entryFileNames: 'js/[name]-[hash].js',
            chunkFileNames: 'js/[name]-[hash].js',
            assetFileNames: ({ name }) => {
              if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
                return 'images/[name]-[hash][extname]';
              } else if (/\.css$/.test(name ?? '')) {
                return 'css/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            }
          }
        }
      }
    };
});
