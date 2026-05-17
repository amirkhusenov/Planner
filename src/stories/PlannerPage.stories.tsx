import type { Meta, StoryObj } from '@storybook/react-vite'
import PlannerPage from '../components/layout/PlannerPage'

const meta = {
  title: 'Pages/PlannerRoot',
  component: PlannerPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlannerPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

