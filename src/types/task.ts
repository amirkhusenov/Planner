export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  priority: TaskPriority
  timeRange: string
  status: TaskStatus
}

