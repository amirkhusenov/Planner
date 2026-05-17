import { useEffect, useState } from 'react'
import type { Task } from '../../types/task'
import TaskRow from './TaskRow'

interface TaskTableProps {
  tasks: Task[]
  isCompleted?: boolean
}

export default function TaskTable({ tasks, isCompleted = false }: TaskTableProps) {
  const [openCommentTaskId, setOpenCommentTaskId] = useState<string | null>(null)

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

  return (
    <section className="tasks-table" aria-label="Список задач на сегодня">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          isCompleted={isCompleted}
          isCommentOpen={openCommentTaskId === task.id}
          onToggleComment={() => {
            setOpenCommentTaskId((prev) => (prev === task.id ? null : task.id))
          }}
          onCloseComment={() => setOpenCommentTaskId(null)}
        />
      ))}
    </section>
  )
}
