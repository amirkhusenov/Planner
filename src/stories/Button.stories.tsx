import type { Meta, StoryObj } from '@storybook/react-vite'
import Button from '#components/ui/Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Добавить задачу',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Отмена',
  },
}

