import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'components', dest: '.' },
        { src: 'javaScript', dest: '.' },
        { src: 'fonts', dest: '.' },
        { src: 'output.css', dest: '.' },
        { src: 'assets', dest: '.' },
        { src: 'Sandbox', dest: '.' },
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        programs: resolve(__dirname, 'programs.html'),
        impact: resolve(__dirname, 'impact.html'),
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    open: true,
    watch: {
      usePolling: true,
      ignored: ['!**/dist/**']
    }
  }
})
