import type { DraggableAttributes, SyntheticListenerMap } from '@dnd-kit/core'
import clsx from 'clsx'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ICON_PATHS } from '#constants/iconPaths'
import type { Task } from '../../types/task'
import PriorityBadge from './PriorityBadge'
import StatusBadge from './StatusBadge'
import TaskCommentThreadDesktop from './TaskCommentThreadDesktop'
import TaskCommentThreadMobile from './TaskCommentThreadMobile'
import type { ThreadComment } from './taskCommentTypes'

interface TaskRowProps {
  task: Task
  isCompleted: boolean
  isCommentOpen: boolean
  onToggleComment: () => void
  onCloseComment: () => void
  onToggleTaskState?: () => void
  isDragging?: boolean
  isDragOver?: boolean
  rowRef?: (element: HTMLElement | null) => void
  rowStyle?: CSSProperties
  dragAttributes?: DraggableAttributes
  dragListeners?: SyntheticListenerMap
  dragHandleRef?: (element: HTMLElement | null) => void
}

function createCommentId() {
  return `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatNow() {
  return 'Только что'
}

function useIsMobileCommentThread() {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 578px)').matches : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(max-width: 578px)')
    const handleChange = () => {
      setIsMobile(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobile
}

export default function TaskRow({
  task,
  isCompleted,
  isCommentOpen,
  onToggleComment,
  onCloseComment,
  onToggleTaskState,
  isDragging = false,
  isDragOver = false,
  rowRef,
  rowStyle,
  dragAttributes,
  dragListeners,
  dragHandleRef,
}: TaskRowProps) {
  const [commentDraft, setCommentDraft] = useState('')
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)
  const [threadComments, setThreadComments] = useState<ThreadComment[]>([])
  const [isImageProcessing, setIsImageProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingImageObjectUrlRef = useRef<string | null>(null)

  const hasThread = threadComments.length > 0
  const isCommentInlineOpen = isCommentOpen && !hasThread
  const isMobileCommentThread = useIsMobileCommentThread()

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = commentDraft.trim()
    if ((!value && !pendingImageUrl) || isImageProcessing) {
      return
    }

    setThreadComments((prev) => [
      {
        id: createCommentId(),
        author: 'Илья Тяпкин',
        time: formatNow(),
        text: value,
        imageUrl: pendingImageUrl ?? undefined,
      },
      ...prev,
    ])
    setCommentDraft('')
    setPendingImageUrl(null)
    pendingImageObjectUrlRef.current = null
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      return
    }

    setIsImageProcessing(true)
    if (pendingImageObjectUrlRef.current) {
      URL.revokeObjectURL(pendingImageObjectUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    pendingImageObjectUrlRef.current = objectUrl
    setPendingImageUrl(objectUrl)
    setIsImageProcessing(false)
    event.target.value = ''
  }

  useEffect(() => {
    return () => {
      if (pendingImageObjectUrlRef.current) {
        URL.revokeObjectURL(pendingImageObjectUrlRef.current)
      }
    }
  }, [])

  return (
    <article
      ref={rowRef}
      style={rowStyle}
      className={clsx('task-row', {
        'is-comment-open': isCommentInlineOpen,
        'is-completed': isCompleted,
        'is-dragging': isDragging,
        'is-drag-over': isDragOver,
      })}
    >
      <input
        ref={fileInputRef}
        className="task-row__file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button
        className="task-row__drag"
        type="button"
        ref={dragHandleRef}
        {...dragAttributes}
        {...dragListeners}
        aria-label="Переместить задачу"
      >
        <img src={ICON_PATHS.tasks.drag} alt="" aria-hidden="true" />
      </button>
      <div className="task-row__badges">
        <div className="task-row__priority">
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="task-row__status-wrap">
          <StatusBadge status={task.status} />
        </div>
      </div>
      <p className="task-row__title">{task.title}</p>
      <p className="task-row__time">
        <img src={ICON_PATHS.tasks.calendar} alt="" aria-hidden="true" className="task-row__time-icon" />
        <span>{task.timeRange}</span>
      </p>
      <button
        className="task-row__actions"
        type="button"
        aria-label="Комментарии"
        aria-expanded={isCommentOpen}
        onClick={onToggleComment}
      >
        <img src={ICON_PATHS.tasks.message} alt="" aria-hidden="true" className="task-row__action-icon" />
        <span className="task-row__action-count">{threadComments.length}</span>
      </button>
      <button
        className="task-row__delete"
        type="button"
        aria-label={
          isCompleted
            ? 'Восстановить задачу'
            : 'Удалить задачу'
        }
        onClick={onToggleTaskState}
      >
        <img src={isCompleted ? ICON_PATHS.tasks.return : ICON_PATHS.tasks.delete} alt="" aria-hidden="true" />
      </button>

      {isCommentInlineOpen ? (
        <form className="task-row__comment-box" onSubmit={handleSubmitComment}>
          <input
            className="task-row__comment-input"
            type="text"
            placeholder="Добавить комментарий..."
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                onCloseComment()
              }
            }}
            autoFocus
          />
          <div className="task-row__comment-tools">
            <button
              className="task-row__comment-tool"
              type="button"
              aria-label="Прикрепить файл"
              onClick={handlePickImage}
            >
              <img src={ICON_PATHS.tasks.attach} alt="" aria-hidden="true" />
            </button>
            <button
              className="task-row__comment-tool"
              type="submit"
              aria-label="Отправить комментарий"
              disabled={isImageProcessing}
            >
              <img src={ICON_PATHS.tasks.send} alt="" aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : null}

      {isCommentOpen && hasThread ? (
        isMobileCommentThread ? (
          <TaskCommentThreadMobile
            comments={threadComments}
            commentDraft={commentDraft}
            isImageProcessing={isImageProcessing}
            onCommentDraftChange={setCommentDraft}
            onCloseComment={onCloseComment}
            onPickImage={handlePickImage}
            onSubmitComment={handleSubmitComment}
          />
        ) : (
          <TaskCommentThreadDesktop
            comments={threadComments}
            commentDraft={commentDraft}
            isImageProcessing={isImageProcessing}
            onCommentDraftChange={setCommentDraft}
            onCloseComment={onCloseComment}
            onPickImage={handlePickImage}
            onSubmitComment={handleSubmitComment}
          />
        )
      ) : null}
    </article>
  )
}
