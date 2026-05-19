import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PlannerShell from '../components/layout/PlannerShell'
import Button from '../components/ui/Button'
import InputField from '../components/ui/InputField'
import WorkCalendarNav from '../components/ui/WorkCalendarNav'
import { ICON_PATHS } from '../constants/iconPaths'

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
})

type GoalsView = 'all' | 'week' | 'month' | 'year'
type GoalStatsRange = Exclude<GoalsView, 'all'>

interface GoalItem {
  id: string
  title: string
  periodLabel: string
  valueLabel: string
  targetLabel: string
  progress: number
  scope: GoalStatsRange
  deadlineLabel: string
  currentValue: number
  targetValue: number
  timeline: Record<GoalStatsRange, number[]>
}

const MONTH_GENITIVE_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const

const WEEKDAY_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const

const GOAL_ITEMS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Похудение',
    periodLabel: '6 месяцев • до 12 сентября, 2026',
    valueLabel: '112 > 80',
    targetLabel: '112 > 80',
    progress: 46,
    scope: 'month',
    deadlineLabel: 'До 12 сентября 2026',
    currentValue: 112,
    targetValue: 80,
    timeline: {
      week: [24, 28, 30, 26, 32, 36, 40],
      month: [2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12, 14, 14, 14, 16],
      year: [16, 18, 20, 24, 28, 32, 36, 38, 40, 42, 44, 46],
    },
  },
  {
    id: 'goal-2',
    title: 'Прочесть 12 книг',
    periodLabel: '12 месяцев • до 1 января, 2027',
    valueLabel: '3 > 12',
    targetLabel: '3 > 12',
    progress: 30,
    scope: 'year',
    deadlineLabel: 'До 1 января 2027',
    currentValue: 3,
    targetValue: 12,
    timeline: {
      week: [8, 10, 12, 12, 14, 16, 18],
      month: [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 10, 12],
      year: [2, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 12],
    },
  },
]

const GOAL_RING_SIZE = 155
const GOAL_RING_STROKE = 16
const GOAL_RING_RADIUS = (GOAL_RING_SIZE - GOAL_RING_STROKE) / 2
const GOAL_RING_CIRCUMFERENCE = 2 * Math.PI * GOAL_RING_RADIUS
const DEFAULT_RESULT_DATE = new Date(2026, 3, 22)

function addDays(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + value)
}

function resultDateLabel(date: Date) {
  return `${date.getDate()} ${MONTH_GENITIVE_RU[date.getMonth()]}`
}

function navDateLabel(date: Date) {
  const weekday = WEEKDAY_SHORT_RU[date.getDay()]
  return `${weekday}, ${date.getDate()} ${MONTH_GENITIVE_RU[date.getMonth()]}`
}

function goalStatDateLabel(range: GoalStatsRange, index: number) {
  if (range === 'year') {
    return `${index + 1} месяц`
  }

  const date = range === 'week'
    ? new Date(2026, 3, 20 + index)
    : new Date(2026, 3, 1 + index)

  return `${WEEKDAY_SHORT_RU[date.getDay()]}, ${date.getDate()} ${MONTH_GENITIVE_RU[date.getMonth()]}`
}

function GoalProgressRing({ progress, targetLabel }: { progress: number; targetLabel: string }) {
  const safeProgress = Math.max(0, Math.min(100, progress))
  const offset = GOAL_RING_CIRCUMFERENCE * (1 - safeProgress / 100)

  return (
    <div className="goals-card__ring" aria-label={`Прогресс цели ${safeProgress}%`}>
      <svg
        className="goals-card__ring-svg"
        width={GOAL_RING_SIZE}
        height={GOAL_RING_SIZE}
        viewBox={`0 0 ${GOAL_RING_SIZE} ${GOAL_RING_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="goals-card__ring-track"
          cx={GOAL_RING_SIZE / 2}
          cy={GOAL_RING_SIZE / 2}
          r={GOAL_RING_RADIUS}
        />
        <circle
          className="goals-card__ring-progress"
          cx={GOAL_RING_SIZE / 2}
          cy={GOAL_RING_SIZE / 2}
          r={GOAL_RING_RADIUS}
          style={{
            strokeDasharray: GOAL_RING_CIRCUMFERENCE,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      <div className="goals-card__ring-inner">
        <p className="goals-card__ring-target">{targetLabel}</p>
        <p className="goals-card__ring-value">{safeProgress}%</p>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>(GOAL_ITEMS)
  const [view, setView] = useState<GoalsView>('all')
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')

  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null)
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false)
  const [isDeleteGoalModalOpen, setIsDeleteGoalModalOpen] = useState(false)
  const [editGoalName, setEditGoalName] = useState('')
  const [editGoalDeadline, setEditGoalDeadline] = useState('')
  const [editGoalTarget, setEditGoalTarget] = useState('')
  const [editGoalCurrent, setEditGoalCurrent] = useState('')
  const [editResultDate, setEditResultDate] = useState(new Date(DEFAULT_RESULT_DATE))
  const [editStatsRange, setEditStatsRange] = useState<GoalStatsRange>('month')
  const [hoveredStatId, setHoveredStatId] = useState<string | null>(null)

  const visibleGoals = useMemo(
    () => (view === 'all' ? goals : goals.filter((item) => item.scope === view)),
    [goals, view],
  )
  const editTimeline = useMemo(
    () => editingGoal?.timeline[editStatsRange] ?? [],
    [editingGoal, editStatsRange],
  )
  const editTimelineMax = useMemo(
    () => editTimeline.reduce((max, value) => (value > max ? value : max), 0),
    [editTimeline],
  )

  const isAnyModalOpen = isGoalModalOpen || isEditGoalModalOpen || isDeleteGoalModalOpen

  const openGoalModal = () => {
    setGoalName('')
    setCurrentAmount('')
    setTargetAmount('')
    setDeadline('')
    setIsEditGoalModalOpen(false)
    setIsGoalModalOpen(true)
  }

  const closeGoalModal = () => {
    setIsGoalModalOpen(false)
  }

  const openEditGoalModal = (goal: GoalItem) => {
    setEditingGoal(goal)
    setEditGoalName(goal.title)
    setEditGoalDeadline(goal.deadlineLabel)
    setEditGoalTarget(String(goal.targetValue))
    setEditGoalCurrent(String(goal.currentValue))
    setEditResultDate(new Date(DEFAULT_RESULT_DATE))
    setEditStatsRange('month')
    setHoveredStatId(null)
    setIsDeleteGoalModalOpen(false)
    setIsGoalModalOpen(false)
    setIsEditGoalModalOpen(true)
  }

  const closeEditGoalModal = () => {
    setIsEditGoalModalOpen(false)
    setIsDeleteGoalModalOpen(false)
    setHoveredStatId(null)
  }

  const openDeleteGoalModal = () => {
    if (!editingGoal) {
      return
    }

    setIsGoalModalOpen(false)
    setIsEditGoalModalOpen(false)
    setIsDeleteGoalModalOpen(true)
  }

  const closeDeleteGoalModal = () => {
    setIsDeleteGoalModalOpen(false)
  }

  const closeAllModals = () => {
    setIsGoalModalOpen(false)
    setIsEditGoalModalOpen(false)
    setIsDeleteGoalModalOpen(false)
    setHoveredStatId(null)
  }

  const handleGoalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    closeGoalModal()
  }

  const handleEditGoalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    closeEditGoalModal()
  }

  const handleDeleteGoal = () => {
    if (!editingGoal) {
      return
    }

    setGoals((prev) => prev.filter((goal) => goal.id !== editingGoal.id))
    closeAllModals()
    setEditingGoal(null)
  }

  useEffect(() => {
    if (!isAnyModalOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAnyModalOpen])

  return (
    <PlannerShell showMobileTop={false}>
      <section className="goals-page">
        <header className="goals-header">
          <h1 className="goals-header__title">Цели</h1>

          <div className="segmented-control" role="tablist" aria-label="Период целей">
            <button
              type="button"
              className={`segmented-control__item${view === 'all' ? ' is-active' : ''}`}
              onClick={() => setView('all')}
            >
              Все
            </button>
            <button
              type="button"
              className={`segmented-control__item${view === 'week' ? ' is-active' : ''}`}
              onClick={() => setView('week')}
            >
              На неделю
            </button>
            <button
              type="button"
              className={`segmented-control__item${view === 'month' ? ' is-active' : ''}`}
              onClick={() => setView('month')}
            >
              На месяц
            </button>
            <button
              type="button"
              className={`segmented-control__item${view === 'year' ? ' is-active' : ''}`}
              onClick={() => setView('year')}
            >
              На год
            </button>
          </div>
        </header>

        <div className="goals-grid" aria-label="Список целей">
          {visibleGoals.map((goal) => (
            <article key={goal.id} className="activity-card goals-card">
              <div className="goals-card__content">
                <h2 className="goals-card__title">{goal.title}</h2>
                <p className="goals-card__period">{goal.periodLabel}</p>
                <p className="goals-card__value-label">{goal.valueLabel}</p>

                <Button
                  variant="ghost"
                  icon={<Plus size={16} strokeWidth={2.5} />}
                  onClick={() => openEditGoalModal(goal)}
                >
                  Редактировать
                </Button>
              </div>

              <GoalProgressRing progress={goal.progress} targetLabel={goal.targetLabel} />
            </article>
          ))}
        </div>

        <div className="goals-page__actions">
          <Button icon={<Plus size={14} />} onClick={openGoalModal}>Добавить цель</Button>
        </div>
      </section>

      <button
        type="button"
        className={`goals-modal-overlay${isAnyModalOpen ? ' is-open' : ''}`}
        aria-label="Закрыть модальное окно"
        onClick={closeAllModals}
      />

      <section
        className={`goals-modal${isGoalModalOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Добавить цель"
      >
        <div className="goals-modal__head">
          <h2 className="goals-modal__title">Добавить активность</h2>
          <button type="button" className="goals-modal__close" onClick={closeGoalModal} aria-label="Закрыть">
            <img src={ICON_PATHS.common.exit} alt="" aria-hidden="true" />
          </button>
        </div>

        <form className="goals-modal__form" onSubmit={handleGoalSubmit}>
          <InputField
            label="Название цели"
            placeholder="Похудеть, Прочесть книги"
            value={goalName}
            onChange={(event) => setGoalName(event.target.value)}
          />

          <div className="goals-modal__numbers">
            <InputField
              label="Текущее количество"
              placeholder="0"
              value={currentAmount}
              onChange={(event) => setCurrentAmount(event.target.value)}
            />
            <InputField
              label="Итоговое количество"
              placeholder="5"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
            />
          </div>

          <InputField
            label="Сроки"
            placeholder="До 1 января 2027"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            after={<img src={ICON_PATHS.tasks.calendar} alt="" aria-hidden="true" className="goals-modal__calendar-icon" />}
          />

          <div className="goals-modal__actions">
            <Button variant="ghost" onClick={closeGoalModal}>Отменить</Button>
            <Button type="submit" icon={<Plus size={16} strokeWidth={2.5} />}>Добавить цель</Button>
          </div>
        </form>
      </section>

      <section
        className={`goals-edit-modal${isEditGoalModalOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Редактировать цель"
      >
        <div className="goals-edit-modal__head">
          <h2 className="goals-edit-modal__title">{editingGoal?.title ?? 'Редактировать цель'}</h2>

          <div className="goals-edit-modal__head-actions">
            <button type="button" className="goals-edit-modal__delete" onClick={openDeleteGoalModal}>
              <img src={ICON_PATHS.tasks.delete} alt="" aria-hidden="true" />
              <span>Удалить цель</span>
            </button>

            <button
              type="button"
              className="goals-edit-modal__close"
              onClick={closeEditGoalModal}
              aria-label="Закрыть"
            >
              <img src={ICON_PATHS.common.exit} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="goals-edit-modal__separator" />

        <form className="goals-edit-modal__form" onSubmit={handleEditGoalSubmit}>
          <InputField
            label="Название цели"
            value={editGoalName}
            onChange={(event) => setEditGoalName(event.target.value)}
          />

          <InputField
            label="Сроки"
            value={editGoalDeadline}
            onChange={(event) => setEditGoalDeadline(event.target.value)}
            after={<img src={ICON_PATHS.tasks.calendar} alt="" aria-hidden="true" className="goals-modal__calendar-icon" />}
          />

          <InputField
            label="Итоговое количество"
            value={editGoalTarget}
            onChange={(event) => setEditGoalTarget(event.target.value)}
          />

          <div className="goals-edit-modal__result-head">
            <h3 className="goals-edit-modal__section-title">
              Результат <span className="goals-edit-modal__section-title-muted">{resultDateLabel(editResultDate)}</span>
            </h3>

            <WorkCalendarNav
              label={navDateLabel(editResultDate)}
              rootClassName="goals-edit-modal__date-nav"
              arrowClassName="goals-edit-modal__date-arrow"
              labelClassName="goals-edit-modal__date-label"
              ariaLabel="Навигация по дате результата"
              prevAriaLabel="Предыдущая дата результата"
              nextAriaLabel="Следующая дата результата"
              onPrev={() => setEditResultDate((prev) => addDays(prev, -1))}
              onNext={() => setEditResultDate((prev) => addDays(prev, 1))}
            />
          </div>

          <InputField
            label="Текущее количество"
            value={editGoalCurrent}
            onChange={(event) => setEditGoalCurrent(event.target.value)}
          />

          <div className="goals-edit-modal__stats-head">
            <h3 className="goals-edit-modal__section-title">Статистика</h3>

            <div className="segmented-control goals-edit-modal__segments" role="tablist" aria-label="Период статистики цели">
              <button
                type="button"
                className={`segmented-control__item${editStatsRange === 'week' ? ' is-active' : ''}`}
                onClick={() => setEditStatsRange('week')}
              >
                Неделя
              </button>
              <button
                type="button"
                className={`segmented-control__item${editStatsRange === 'month' ? ' is-active' : ''}`}
                onClick={() => setEditStatsRange('month')}
              >
                Месяц
              </button>
              <button
                type="button"
                className={`segmented-control__item${editStatsRange === 'year' ? ' is-active' : ''}`}
                onClick={() => setEditStatsRange('year')}
              >
                Год
              </button>
            </div>
          </div>

          <div className="goals-edit-modal__chart" aria-label="Статистика прогресса">
            {editTimeline.map((value, index) => {
              const pointId = `${editingGoal?.id ?? 'goal'}-${editStatsRange}-${index}`
              const relativeHeight = editTimelineMax > 0 ? (value / editTimelineMax) * 100 : 0
              const chartHeight = Math.max(8, relativeHeight)

              return (
                <div
                  key={pointId}
                  className="goals-edit-modal__bar-wrap"
                  style={{ height: `${chartHeight}%` }}
                >
                  <button
                    type="button"
                    className="goals-edit-modal__bar-hit"
                    onMouseEnter={() => setHoveredStatId(pointId)}
                    onMouseLeave={() => setHoveredStatId(null)}
                    onFocus={() => setHoveredStatId(pointId)}
                    onBlur={() => setHoveredStatId(null)}
                    aria-label={`${goalStatDateLabel(editStatsRange, index)} — ${value}`}
                  >
                    <span className="goals-edit-modal__bar" />
                  </button>

                  {hoveredStatId === pointId ? (
                    <div className="goals-edit-modal__tooltip" role="status" aria-live="polite">
                      <p className="goals-edit-modal__tooltip-date">{goalStatDateLabel(editStatsRange, index)}</p>
                      <p className="goals-edit-modal__tooltip-value">{value}</p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="goals-edit-modal__actions">
            <Button variant="ghost" onClick={closeEditGoalModal}>Отменить</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </section>

      <section
        className={`goals-delete-modal${isDeleteGoalModalOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Удалить цель"
      >
        <div className="goals-delete-modal__head">
          <div className="goals-delete-modal__title-wrap">
            <h2 className="goals-delete-modal__title">
              Удалить цель
              <span className="goals-delete-modal__goal-name">{editingGoal?.title ?? ''}</span>
            </h2>
          </div>

          <button
            type="button"
            className="goals-delete-modal__close"
            onClick={closeDeleteGoalModal}
            aria-label="Закрыть"
          >
            <img src={ICON_PATHS.common.exit} alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="goals-delete-modal__body">
          <p className="goals-delete-modal__text">Вы уверены, что хотите удалить цель?</p>
          <p className="goals-delete-modal__text">Восстановить ее не получится</p>
        </div>

        <div className="goals-delete-modal__actions">
          <button type="button" className="goals-delete-modal__cancel" onClick={closeDeleteGoalModal}>
            Отменить
          </button>
          <button type="button" className="goals-delete-modal__confirm" onClick={handleDeleteGoal}>
            Удалить
          </button>
        </div>
      </section>
    </PlannerShell>
  )
}
