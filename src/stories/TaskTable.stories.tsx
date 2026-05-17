import type { Meta, StoryObj } from '@storybook/react-vite'
import TaskTable from '../components/tasks/TaskTable'
import { TODAY_TASKS } from '../data/todayTasks'

const meta = {
  title: 'Tasks/TaskTable',
  component: TaskTable,
  args: {
    tasks: TODAY_TASKS,
  },
} satisfies Meta<typeof TaskTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

