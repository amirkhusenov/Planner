import { useEffect, useRef, useState } from 'react'
import { ICON_PATHS } from '../../constants/iconPaths'
import type { Task } from '../../types/task'
import PriorityBadge from './PriorityBadge'
import StatusBadge from './StatusBadge'

interface TaskRowProps {
  task: Task
  isCompleted: boolean
  isCommentOpen: boolean
  onToggleComment: () => void
  onCloseComment: () => void
}

interface ThreadComment {
  id: string
  author: string
  time: string
  text: string
  imageUrl?: string
}

function createCommentId() {
  return `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatNow() {
  return 'Только что'
}

function isUrlLine(line: string) {
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(line.trim())
}

function toHref(line: string) {
  return line.startsWith('http://') || line.startsWith('https://') ? line : `https://${line}`
}

export default function TaskRow({
  task,
  isCompleted,
  isCommentOpen,
  onToggleComment,
  onCloseComment,
}: TaskRowProps) {
  const [commentDraft, setCommentDraft] = useState('')
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)
  const [threadComments, setThreadComments] = useState<ThreadComment[]>([])
  const [isImageProcessing, setIsImageProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingImageObjectUrlRef = useRef<string | null>(null)

  const hasThread = threadComments.length > 0

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
    <article className={`task-row${isCommentOpen ? ' is-comment-open' : ''}${isCompleted ? ' is-completed' : ''}`}>
      <input
        ref={fileInputRef}
        className="task-row__file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button className="task-row__drag" type="button" aria-label="Переместить задачу">
        <img src={ICON_PATHS.tasks.drag} alt="" aria-hidden="true" />
      </button>
      <div className="task-row__priority">
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="task-row__title">{task.title}</p>
      <p className="task-row__time">
        <img src={ICON_PATHS.tasks.calendar} alt="" aria-hidden="true" className="task-row__time-icon" />
        <span>{task.timeRange}</span>
      </p>
      <div className="task-row__status-wrap">
        <StatusBadge status={task.status} />
      </div>
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
      <button className="task-row__delete" type="button" aria-label="Удалить задачу">
        <img src={isCompleted ? ICON_PATHS.tasks.return : ICON_PATHS.tasks.delete} alt="" aria-hidden="true" />
      </button>

      {isCommentOpen && !hasThread ? (
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
            <button className="task-row__comment-tool" type="button" aria-label="Прикрепить файл" onClick={handlePickImage}>
              <img src={ICON_PATHS.tasks.attach} alt="" aria-hidden="true" />
            </button>
            <button className="task-row__comment-tool" type="submit" aria-label="Отправить комментарий" disabled={isImageProcessing}>
              <img src={ICON_PATHS.tasks.send} alt="" aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : null}

      {isCommentOpen && hasThread ? (
        <section className="task-comment-thread" aria-label="Комментарии">
          <div className="task-comment-thread__list">
            {threadComments.map((item) => (
              <article key={item.id} className="task-comment-thread__item">
                <div className="task-comment-thread__head">
                  <div className="task-comment-thread__author-block">
                    <span className="task-comment-thread__avatar">И</span>
                    <div className="task-comment-thread__meta">
                      <p className="task-comment-thread__author">{item.author}</p>
                      <p className="task-comment-thread__time">{item.time}</p>
                    </div>
                  </div>
                  <button className="task-comment-thread__more" type="button" aria-label="Действия">
                    <img src={ICON_PATHS.tasks.menu} alt="" aria-hidden="true" />
                  </button>
                </div>

                {item.text ? (
                  <div className="task-comment-thread__text">
                    {item.text.split(/\r?\n/).map((line, index) => {
                      const trimmed = line.trim()
                      if (!trimmed) {
                        return null
                      }

                      if (isUrlLine(trimmed)) {
                        return (
                          <a
                            key={`${item.id}-line-${index}`}
                            className="task-comment-thread__link"
                            href={toHref(trimmed)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {trimmed}
                          </a>
                        )
                      }

                      return <p key={`${item.id}-line-${index}`}>{line}</p>
                    })}
                  </div>
                ) : null}

                {item.imageUrl ? (
                  <img className="task-comment-thread__image-upload" src={item.imageUrl} alt="Прикрепленное изображение" />
                ) : null}
              </article>
            ))}
          </div>

          <form className="task-comment-thread__composer-wrap" onSubmit={handleSubmitComment}>
            <div className="task-comment-thread__composer">
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
              />
              <div className="task-row__comment-tools">
                <button className="task-row__comment-tool" type="button" aria-label="Прикрепить файл" onClick={handlePickImage}>
                  <img src={ICON_PATHS.tasks.attach} alt="" aria-hidden="true" />
                </button>
                <button className="task-row__comment-tool" type="submit" aria-label="Отправить комментарий" disabled={isImageProcessing}>
                  <img src={ICON_PATHS.tasks.send} alt="" aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>
        </section>
      ) : null}
    </article>
  )
}
