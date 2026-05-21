import clsx from 'clsx'
import { STATUS_LABELS } from '../../data/taskMeta'
import type { TaskStatus } from '../../types/task'

interface StatusBadgeProps {
  status: TaskStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={clsx('status-badge', `status-badge--${status}`)}>{STATUS_LABELS[status]}</span>
}

