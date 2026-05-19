export const TASK_LIST_IDS = {
  active: 'tasks-active-list',
  completed: 'tasks-completed-list',
} as const

export type TaskListId = (typeof TASK_LIST_IDS)[keyof typeof TASK_LIST_IDS]

export function isTaskListId(value: unknown): value is TaskListId {
  return value === TASK_LIST_IDS.active || value === TASK_LIST_IDS.completed
}
