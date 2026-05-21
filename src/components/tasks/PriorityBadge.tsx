import clsx from 'clsx'
import { PRIORITY_LABELS } from '../../data/taskMeta'
import type { TaskPriority } from '../../types/task'

interface PriorityBadgeProps {
  priority: TaskPriority
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={clsx('priority-badge', `priority-badge--${priority}`)}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

