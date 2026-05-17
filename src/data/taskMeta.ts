import type { TaskPriority, TaskStatus } from '../types/task'

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Срочно',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Не начато',
  in_progress: 'В процессе',
  done: 'Приостановлено',
}

