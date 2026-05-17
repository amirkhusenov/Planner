import type { Meta, StoryObj } from '@storybook/react-vite'
import TaskBoardHeader from '../components/tasks/TaskBoardHeader'

const meta = {
  title: 'Tasks/TaskBoardHeader',
  component: TaskBoardHeader,
} satisfies Meta<typeof TaskBoardHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

