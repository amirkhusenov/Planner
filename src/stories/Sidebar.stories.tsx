import type { Meta, StoryObj } from '@storybook/react-vite'
import Sidebar from '../components/layout/Sidebar'

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

