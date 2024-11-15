import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import yaml from '@modyfi/vite-plugin-yaml';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    yaml()
  ],
  optimizeDeps: {
    exclude: ['react-virtualized']
  },
  resolve: {
    alias: [
      // React-virtualized fixes
      { 
        find: 'react-virtualized/dist/es/WindowScroller/utils/onScroll',
        replacement: 'react-virtualized/dist/commonjs/WindowScroller/utils/onScroll'
      },
      { 
        find: 'react-virtualized',
        replacement: 'react-virtualized/dist/commonjs'
      },
      // Existing aliases
      { find: 'components', replacement: path.resolve(__dirname, './src/components') },
      { find: 'core', replacement: path.resolve(__dirname, './src/core') },
      { find: 'hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: 'packages', replacement: path.resolve(__dirname, './src/packages') },
      { find: 'services', replacement: path.resolve(__dirname, './src/services') },
      { find: 'views', replacement: path.resolve(__dirname, './src/views') },
      { find: 'utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: 'locales', replacement: path.resolve(__dirname, './src/locales') },
      { find: 'config', replacement: path.resolve(__dirname, './src/config') },
      { find: 'area', replacement: path.resolve(__dirname, './src/area') },
      { find: 'pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: 'images', replacement: path.resolve(__dirname, './src/images') },
      // New alias for SCSS files
      { find: 'scss', replacement: path.resolve(__dirname, './src/scss') }
      //{ find: 'mocks', replacement: path.resolve(__dirname, './src/mocks') }
    ]
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});