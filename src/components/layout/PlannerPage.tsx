import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
  type Over,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { COMPLETED_TASKS, TODAY_TASKS } from '../../data/todayTasks'
import type { Task } from '../../types/task'
import PlannerShell from './PlannerShell'
import MonthlyTasksGrid from '../tasks/MonthlyTasksGrid'
import TaskBoardHeader, { type TaskBoardView } from '../tasks/TaskBoardHeader'
import TaskTable from '../tasks/TaskTable'
import { TASK_LIST_IDS, isTaskListId, type TaskListId } from '../tasks/taskDnd'
import WeeklyTasksGrid from '../tasks/WeeklyTasksGrid'
import Button from '../ui/Button'

type TaskListsState = Record<TaskListId, Task[]>

function resolveTaskListId(taskId: string, taskLists: TaskListsState): TaskListId | null {
  if (taskLists[TASK_LIST_IDS.active].some((task) => task.id === taskId)) {
    return TASK_LIST_IDS.active
  }

  if (taskLists[TASK_LIST_IDS.completed].some((task) => task.id === taskId)) {
    return TASK_LIST_IDS.completed
  }

  return null
}

function resolveOverListId(over: Over | null): TaskListId | null {
  if (!over) {
    return null
  }

  const dataContainerId = over.data.current?.containerId
  if (isTaskListId(dataContainerId)) {
    return dataContainerId
  }

  return isTaskListId(over.id) ? over.id : null
}

function moveTaskBetweenLists(
  taskLists: TaskListsState,
  fromListId: TaskListId,
  toListId: TaskListId,
  taskId: string,
  overId: string,
): TaskListsState {
  const fromList = taskLists[fromListId]
  const toList = taskLists[toListId]

  const fromIndex = fromList.findIndex((task) => task.id === taskId)
  if (fromIndex < 0) {
    return taskLists
  }

  const targetIndex = toList.findIndex((task) => task.id === overId)
  const insertionIndex = targetIndex >= 0 ? targetIndex : toList.length

  const nextFromList = fromList.filter((task) => task.id !== taskId)
  const nextToList = [...toList]
  nextToList.splice(insertionIndex, 0, fromList[fromIndex])

  return {
    ...taskLists,
    [fromListId]: nextFromList,
    [toListId]: nextToList,
  }
}

export default function PlannerPage() {
  const [view, setView] = useState<TaskBoardView>('day')
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 22))
  const [taskLists, setTaskLists] = useState<TaskListsState>(() => ({
    [TASK_LIST_IDS.active]: [...TODAY_TASKS],
    [TASK_LIST_IDS.completed]: [...COMPLETED_TASKS],
  }))
  const [dragSnapshot, setDragSnapshot] = useState<TaskListsState | null>(null)

  const tasks = taskLists[TASK_LIST_IDS.active]
  const completedTasks = taskLists[TASK_LIST_IDS.completed]

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 140,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const deleteTask = (task: Task) => {
    setTaskLists((prev) => ({
      ...prev,
      [TASK_LIST_IDS.active]: prev[TASK_LIST_IDS.active].filter((item) => item.id !== task.id),
    }))
  }

  const restoreTask = (task: Task) => {
    setTaskLists((prev) => {
      const nextCompletedTasks = prev[TASK_LIST_IDS.completed].filter((item) => item.id !== task.id)
      if (prev[TASK_LIST_IDS.active].some((item) => item.id === task.id)) {
        return {
          ...prev,
          [TASK_LIST_IDS.completed]: nextCompletedTasks,
        }
      }

      return {
        ...prev,
        [TASK_LIST_IDS.completed]: nextCompletedTasks,
        [TASK_LIST_IDS.active]: [task, ...prev[TASK_LIST_IDS.active]],
      }
    })
  }

  const handleDragStart = () => {
    setDragSnapshot(taskLists)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      return
    }

    const taskId = String(active.id)
    const overId = String(over.id)

    setTaskLists((prev) => {
      const fromListId = resolveTaskListId(taskId, prev)
      const toListId = resolveOverListId(over)

      if (!fromListId || !toListId || fromListId === toListId) {
        return prev
      }

      return moveTaskBetweenLists(prev, fromListId, toListId, taskId, overId)
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragSnapshot(null)

    if (!over) {
      return
    }

    const taskId = String(active.id)
    const overId = String(over.id)

    setTaskLists((prev) => {
      const currentListId = resolveTaskListId(taskId, prev)
      const overListId = resolveOverListId(over)

      if (!currentListId || !overListId) {
        return prev
      }

      if (currentListId !== overListId) {
        return moveTaskBetweenLists(prev, currentListId, overListId, taskId, overId)
      }

      const currentList = prev[currentListId]
      const activeIndex = currentList.findIndex((task) => task.id === taskId)
      const overIndex = currentList.findIndex((task) => task.id === overId)

      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
        return prev
      }

      return {
        ...prev,
        [currentListId]: arrayMove(currentList, activeIndex, overIndex),
      }
    })
  }

  const handleDragCancel = () => {
    if (dragSnapshot) {
      setTaskLists(dragSnapshot)
    }

    setDragSnapshot(null)
  }

  return (
    <PlannerShell>
      <TaskBoardHeader
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
      />

      {view === 'week' ? (
        <WeeklyTasksGrid selectedDate={selectedDate} />
      ) : view === 'month' ? (
        <MonthlyTasksGrid
          selectedDate={selectedDate}
          onDaySelect={(date) => {
            setSelectedDate(date)
            setView('day')
          }}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          autoScroll
          modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <TaskTable
            tasks={tasks}
            listId={TASK_LIST_IDS.active}
            onToggleTaskState={deleteTask}
          />

          {tasks.length > 0 ? (
            <div className="planner-content__actions">
              <Button icon={<Plus size={14} />}>Добавить задачу</Button>
            </div>
          ) : (
            <section className="planner-empty-state" aria-label="Нет задач">
              <h2 className="planner-empty-state__title">Задач пока нет</h2>
              <p className="planner-empty-state__text">Самое время добавить первую задачу</p>
              <div className="planner-empty-state__actions">
                <Button icon={<Plus size={14} />}>Добавить задачу</Button>
              </div>
            </section>
          )}

          <section className="completed-tasks" aria-label="Завершенные задачи">
            <h2 className="completed-tasks__title">Завершенные задачи</h2>
            <TaskTable
              tasks={completedTasks}
              listId={TASK_LIST_IDS.completed}
              isCompleted
              onToggleTaskState={restoreTask}
            />
          </section>
        </DndContext>
      )}
    </PlannerShell>
  )
}
