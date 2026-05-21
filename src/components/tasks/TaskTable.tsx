import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { Task } from '../../types/task'
import type { TaskListId } from './taskDnd'
import TaskRow from './TaskRow'

interface TaskTableProps {
  tasks: Task[]
  listId: TaskListId
  isCompleted?: boolean
  onToggleTaskState?: (task: Task) => void
}

interface SortableTaskRowProps {
  task: Task
  listId: TaskListId
  isCompleted: boolean
  isCommentOpen: boolean
  onToggleComment: () => void
  onCloseComment: () => void
  onToggleTaskState?: () => void
}

function SortableTaskRow({
  task,
  listId,
  isCompleted,
  isCommentOpen,
  onToggleComment,
  onCloseComment,
  onToggleTaskState,
}: SortableTaskRowProps) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: task.id,
      data: {
        type: 'task',
        containerId: listId,
      },
      disabled: isCommentOpen,
    })

  const rowStyle = useMemo<CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  )

  return (
    <TaskRow
      task={task}
      isCompleted={isCompleted}
      isCommentOpen={isCommentOpen}
      onToggleComment={onToggleComment}
      onCloseComment={onCloseComment}
      onToggleTaskState={onToggleTaskState}
      isDragging={isDragging}
      isDragOver={isOver && !isDragging}
      rowRef={setNodeRef}
      rowStyle={rowStyle}
      dragAttributes={attributes}
      dragListeners={listeners}
      dragHandleRef={setActivatorNodeRef}
    />
  )
}

export default function TaskTable({ tasks, listId, isCompleted = false, onToggleTaskState }: TaskTableProps) {
  const [openCommentTaskId, setOpenCommentTaskId] = useState<string | null>(null)

  const { isOver, setNodeRef } = useDroppable({
    id: listId,
    data: {
      type: 'task-list',
      containerId: listId,
    },
  })

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }

      if (
        target.closest('.task-row__actions') ||
        target.closest('.task-row__comment-box') ||
        target.closest('.task-comment-thread')
      ) {
        return
      }

      setOpenCommentTaskId(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  const sortableItems = useMemo(() => tasks.map((task) => task.id), [tasks])
  const isDropTarget = isOver && tasks.length === 0

  return (
    <section
      ref={setNodeRef}
      className={clsx('tasks-table', { 'is-drop-target': isDropTarget })}
      data-task-list-id={listId}
      aria-label="Список задач"
    >
      <SortableContext id={listId} items={sortableItems} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <div className="tasks-table__placeholder" aria-hidden="true" />
        ) : (
          tasks.map((task) => {
            const isCommentOpen = openCommentTaskId === task.id

            return (
              <SortableTaskRow
                key={task.id}
                task={task}
                listId={listId}
                isCompleted={isCompleted}
                isCommentOpen={isCommentOpen}
                onToggleComment={() => {
                  setOpenCommentTaskId((prev) => (prev === task.id ? null : task.id))
                }}
                onCloseComment={() => setOpenCommentTaskId(null)}
                onToggleTaskState={() => onToggleTaskState?.(task)}
              />
            )
          })
        )}
      </SortableContext>
    </section>
  )
}
