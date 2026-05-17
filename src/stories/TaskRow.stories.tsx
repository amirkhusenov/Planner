import type { Meta, StoryObj } from '@storybook/react-vite'
import TaskRow from '../components/tasks/TaskRow'
import { TODAY_TASKS } from '../data/todayTasks'

const meta = {
  title: 'Tasks/TaskRow',
  component: TaskRow,
  args: {
    task: TODAY_TASKS[0],
  },
} satisfies Meta<typeof TaskRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

