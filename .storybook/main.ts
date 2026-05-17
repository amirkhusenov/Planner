import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = (viteConfig.plugins ?? []).filter((plugin) => {
      const name = typeof plugin === 'object' && plugin && 'name' in plugin ? String(plugin.name) : ''
      return !name.includes('tanstack-start')
    })

    return viteConfig
  },
}

export default config
