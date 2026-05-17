import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isStorybook =
  process.env.STORYBOOK === 'true' ||
  process.env.npm_lifecycle_event === 'storybook' ||
  process.env.npm_lifecycle_event === 'build-storybook'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    ...(!isStorybook ? [tanstackStart()] : []),
    viteReact(),
  ],
})
