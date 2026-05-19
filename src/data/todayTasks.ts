import type { Task } from '../types/task'

export const TODAY_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Заказать продукты на неделю',
    priority: 'high',
    timeRange: '16:00 - 17:00',
    status: 'todo',
  },
  {
    id: 'task-2',
    title: 'Позвонить в страховую компанию',
    priority: 'high',
    timeRange: '16:00 - 17:00',
    status: 'done',
  },
  {
    id: 'task-3',
    title: 'Записаться на прием к врачу',
    priority: 'low',
    timeRange: '16:00 - 17:00',
    status: 'in_progress',
  },
  {
    id: 'task-4',
    title: 'Отправить посылку бабушке',
    priority: 'low',
    timeRange: '16:00 - 17:00',
    status: 'todo',
  },
  {
    id: 'task-5',
    title: 'Подготовить отчет для начальника',
    priority: 'low',
    timeRange: '16:00 - 17:00',
    status: 'todo',
  },
  {
    id: 'task-6',
    title: 'Забронировать столик в ресторане',
    priority: 'medium',
    timeRange: '16:00 - 17:00',
    status: 'todo',
  },
]

export const COMPLETED_TASKS: Task[] = [
  {
    id: 'completed-1',
    title: 'Заказать продукты на неделю в онлайн-магазине',
    priority: 'medium',
    timeRange: '11:00 - 12:00',
    status: 'done',
  },
  {
    id: 'completed-2',
    title: 'Заказать продукты на неделю в онлайн-магазине',
    priority: 'medium',
    timeRange: '11:00 - 12:00',
    status: 'done',
  },
]

