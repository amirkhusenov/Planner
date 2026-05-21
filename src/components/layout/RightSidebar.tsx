import clsx from 'clsx'
import { useState } from 'react'
import { ICON_PATHS } from '#constants/iconPaths'

interface OverviewItem {
  id: string
  label: string
  percent: number
  ratio: string
}

const OVERVIEW_ITEMS: OverviewItem[] = [
  { id: 'overview-1', label: 'Задачи на сегодня', percent: 20, ratio: '2/10' },
  { id: 'overview-2', label: 'Задачи на сегодня', percent: 90, ratio: '9/10' },
  { id: 'overview-3', label: 'Задачи на сегодня', percent: 40, ratio: '4/10' },
]

const GOAL_PROGRESS = 46
const GOAL_RING_SIZE = 228
const GOAL_RING_STROKE = 28
const GOAL_RING_RADIUS = (GOAL_RING_SIZE - GOAL_RING_STROKE) / 2
const GOAL_RING_CIRCUMFERENCE = 2 * Math.PI * GOAL_RING_RADIUS

export default function RightSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const goalOffset = GOAL_RING_CIRCUMFERENCE * (1 - GOAL_PROGRESS / 100)

  return (
    <aside
      className={clsx('right-sidebar', {
        'is-open': isOpen,
        'is-collapsed': !isOpen,
      })}
      aria-label="Правая панель"
    >
      <div className="right-sidebar__header">
        <h2 className="right-sidebar__title">Обзор</h2>
        <img
          className="right-sidebar__menu"
          src={ICON_PATHS.sidebar.hamburger}
          alt={isOpen ? 'Свернуть правую панель' : 'Открыть правую панель'}
          width={20}
          height={20}
          onClick={() => setIsOpen((prev) => !prev)}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setIsOpen((prev) => !prev)
            }
          }}
        />
      </div>

      <div className="right-sidebar__content" aria-hidden={!isOpen}>
        {OVERVIEW_ITEMS.map((item) => (
          <article key={item.id} className="overview-card">
            <p className="overview-card__label">{item.label}</p>
            <div className="overview-card__headline">
              <p className="overview-card__percent">{item.percent}%</p>
              <p className="overview-card__ratio">{item.ratio}</p>
            </div>
            <div className="overview-card__track" aria-hidden="true">
              <span
                className="overview-card__fill"
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </article>
        ))}

        <article className="overview-goal">
          <div className="overview-goal__top">
            <p className="overview-card__label">Мои цели</p>
            <div className="overview-goal__arrows" aria-hidden="true">
              <img src={ICON_PATHS.sidebar.arrow2} alt="" />
              <img src={ICON_PATHS.sidebar.arrow2} alt="" className="is-next" />
            </div>
          </div>
          <h3 className="overview-goal__name">Похудение</h3>

          <div className="overview-goal__ring" aria-label={`Прогресс цели ${GOAL_PROGRESS}%`}>
            <svg
              className="overview-goal__ring-svg"
              width={GOAL_RING_SIZE}
              height={GOAL_RING_SIZE}
              viewBox={`0 0 ${GOAL_RING_SIZE} ${GOAL_RING_SIZE}`}
              aria-hidden="true"
            >
              <circle
                className="overview-goal__ring-track"
                cx={GOAL_RING_SIZE / 2}
                cy={GOAL_RING_SIZE / 2}
                r={GOAL_RING_RADIUS}
              />
              <circle
                className="overview-goal__ring-progress"
                cx={GOAL_RING_SIZE / 2}
                cy={GOAL_RING_SIZE / 2}
                r={GOAL_RING_RADIUS}
                style={{
                  strokeDasharray: GOAL_RING_CIRCUMFERENCE,
                  strokeDashoffset: goalOffset,
                }}
              />
            </svg>
            <div className="overview-goal__ring-inner">
              <p className="overview-goal__target">112 {'>'} 80</p>
              <p className="overview-goal__value">{GOAL_PROGRESS}%</p>
            </div>
          </div>
        </article>
      </div>
    </aside>
  )
}

