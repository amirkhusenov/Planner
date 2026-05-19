import { ICON_PATHS } from '../../constants/iconPaths'
import type { ThreadComment } from './taskCommentTypes'

interface TaskCommentThreadMobileProps {
  comments: ThreadComment[]
  commentDraft: string
  isImageProcessing: boolean
  onCommentDraftChange: (value: string) => void
  onCloseComment: () => void
  onPickImage: () => void
  onSubmitComment: (event: React.FormEvent<HTMLFormElement>) => void
}

function isUrlLine(line: string) {
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(line.trim())
}

function toHref(line: string) {
  return line.startsWith('http://') || line.startsWith('https://') ? line : `https://${line}`
}

export default function TaskCommentThreadMobile({
  comments,
  commentDraft,
  isImageProcessing,
  onCommentDraftChange,
  onCloseComment,
  onPickImage,
  onSubmitComment,
}: TaskCommentThreadMobileProps) {
  return (
    <>
      <button
        className="task-comment-thread__overlay task-comment-thread__overlay--mobile"
        type="button"
        aria-label="Закрыть комментарии"
        onClick={onCloseComment}
      />

      <section className="task-comment-thread task-comment-thread--mobile" aria-label="Комментарии">
        <div className="task-comment-thread__handle" aria-hidden="true" />

        <div className="task-comment-thread__list">
          {comments.map((item) => (
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

                    return <p key={`${item.id}-line-${index}`} className="task-comment-thread__line">{line}</p>
                  })}
                </div>
              ) : null}

              {item.imageUrl ? (
                <img className="task-comment-thread__image-upload" src={item.imageUrl} alt="Прикрепленное изображение" />
              ) : null}
            </article>
          ))}
        </div>

        <form className="task-comment-thread__composer-wrap" onSubmit={onSubmitComment}>
          <div className="task-comment-thread__composer">
            <input
              className="task-row__comment-input"
              type="text"
              placeholder="Добавить комментарий..."
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  onCloseComment()
                }
              }}
            />
            <div className="task-row__comment-tools">
              <button className="task-row__comment-tool" type="button" aria-label="Прикрепить файл" onClick={onPickImage}>
                <img src={ICON_PATHS.tasks.attach} alt="" aria-hidden="true" />
              </button>
              <button className="task-row__comment-tool" type="submit" aria-label="Отправить комментарий" disabled={isImageProcessing}>
                <img src={ICON_PATHS.tasks.send} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </section>
    </>
  )
}
