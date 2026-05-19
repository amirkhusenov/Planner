import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PlannerShell from '../components/layout/PlannerShell'
import Button from '../components/ui/Button'
import InputField from '../components/ui/InputField'
import TextareaField from '../components/ui/TextareaField'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import WorkCalendarNav from '../components/ui/WorkCalendarNav'
import { ICON_PATHS } from '../constants/iconPaths'

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
})

type ActivityRange = 'week' | 'month' | 'year'

interface ActivityItem {
  id: string
  title: string
  planLabel: string
  progressLabel: string
  actionLabel: string
  timeline: Record<ActivityRange, number[]>
}

const WEEKDAY_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const
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
const MONTH_NOMINATIVE_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const
const HOURS_MIN = 0
const HOURS_MAX = 23
const MINUTES_MIN = 0
const MINUTES_MAX = 59
const DEFAULT_SESSION_DATE = new Date(2026, 3, 22)

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'gym',
    title: 'Спортзал',
    planLabel: 'План на неделю',
    progressLabel: '12 часов 46 минут из 16 часов',
    actionLabel: 'Добавить занятие',
    timeline: {
      week: [22, 66, 80, 52, 67, 36, 100],
      month: [8, 32, 50, 42, 24, 8, 26, 18, 14, 5, 6, 14, 15, 42, 7, 31, 16, 59, 16, 74, 16, 39, 27, 21, 36, 45, 25, 74, 34, 90],
      year: [24, 36, 55, 46, 70, 28, 62, 44, 58, 67, 39, 81],
    },
  },
  {
    id: 'steps',
    title: 'Шаги',
    planLabel: 'План на неделю',
    progressLabel: '251 483 из 300 000',
    actionLabel: 'Добавить шаги',
    timeline: {
      week: [20, 58, 76, 44, 59, 32, 100],
      month: [12, 25, 44, 38, 17, 8, 32, 47, 35, 28, 31, 39, 52, 21, 14, 6, 18, 27, 45, 66, 29, 40, 53, 64, 22, 33, 48, 57, 79, 95],
      year: [31, 42, 50, 58, 46, 37, 64, 52, 61, 74, 69, 88],
    },
  },
]

function renderProgressLabel(value: string) {
  const marker = ' из '
  const markerIndex = value.indexOf(marker)

  if (markerIndex < 0) {
    return value
  }

  const before = value.slice(0, markerIndex)
  const after = value.slice(markerIndex + marker.length)

  return (
    <>
      {before}{' '}
      <span className="activity-card__progress-muted">из {after}</span>
    </>
  )
}

function defaultPlanningText(activityTitle: string) {
  if (activityTitle === 'Шаги') {
    return 'Планирую делать шаги'
  }

  if (activityTitle === 'Спортзал') {
    return 'Планирую посещать спортзал'
  }

  return 'Планирую делать активность'
}

function singleFieldLabel(activityTitle?: string) {
  if (activityTitle === 'Шаги') {
    return 'Количество шагов в день'
  }

  if (activityTitle === 'Спортзал') {
    return 'Часов в неделю'
  }

  return 'Количество активности'
}

function getTimelinePointDateLabel(range: ActivityRange, index: number) {
  if (range === 'year') {
    return `${MONTH_NOMINATIVE_RU[index] ?? `${index + 1} месяц`}, 2026`
  }

  const date = range === 'week'
    ? new Date(2026, 3, 20 + index)
    : new Date(2026, 3, 1 + index)

  const weekday = WEEKDAY_SHORT_RU[date.getDay()]
  const month = MONTH_GENITIVE_RU[date.getMonth()]
  return `${weekday}, ${date.getDate()} ${month}`
}

function getTimelinePointMinutes(value: number, range: ActivityRange) {
  const scaledValue = range === 'year'
    ? Math.round(value * 6)
    : Math.round(value * 0.92)

  return `${Math.max(5, scaledValue)} минут`
}

function addDays(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + value)
}

function sessionDateLabel(date: Date) {
  const weekday = WEEKDAY_SHORT_RU[date.getDay()]
  const month = MONTH_GENITIVE_RU[date.getMonth()]
  return `${weekday}, ${date.getDate()} ${month}`
}

function sessionTitleDate(date: Date) {
  const month = MONTH_GENITIVE_RU[date.getMonth()]
  return `${date.getDate()} ${month}`
}

function sanitizeDigits(value: string, maxLength = 2) {
  return value.replace(/\D+/g, '').slice(0, maxLength)
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseClampedNumber(raw: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return clampNumber(parsed, min, max)
}

export default function ActivityPage() {
  const [range, setRange] = useState<ActivityRange>('week')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false)
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const [isPlanned, setIsPlanned] = useState(false)
  const [name, setName] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')

  const [sessionActivity, setSessionActivity] = useState<ActivityItem | null>(null)
  const [sessionDate, setSessionDate] = useState(new Date(DEFAULT_SESSION_DATE))
  const [sessionHours, setSessionHours] = useState('1')
  const [sessionMinutes, setSessionMinutes] = useState('32')
  const [sessionJournal, setSessionJournal] = useState('Легкая тренировка после работы.')

  const planningText = useMemo(
    () => defaultPlanningText(selectedActivity?.title ?? 'активность'),
    [selectedActivity?.title],
  )
  const plannedFieldLabel = useMemo(
    () => singleFieldLabel(selectedActivity?.title),
    [selectedActivity?.title],
  )

  const isAnyModalOpen = isFormOpen || isSessionFormOpen

  const openForm = (activity?: ActivityItem) => {
    setSelectedActivity(activity ?? null)
    setIsPlanned(false)
    setName(activity?.title ?? '')
    setHoursPerWeek('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
  }

  const openSessionForm = (activity: ActivityItem) => {
    setSessionActivity(activity)
    setSessionDate(new Date(DEFAULT_SESSION_DATE))
    setSessionHours('1')
    setSessionMinutes('32')
    setSessionJournal('Легкая тренировка после работы.')
    setIsSessionFormOpen(true)
  }

  const closeSessionForm = () => {
    setIsSessionFormOpen(false)
  }

  const closeAllModals = () => {
    setIsFormOpen(false)
    setIsSessionFormOpen(false)
  }

  const stepSessionHours = (delta: number) => {
    setSessionHours((prev) => {
      const current = parseClampedNumber(prev, 1, HOURS_MIN, HOURS_MAX)
      return String(clampNumber(current + delta, HOURS_MIN, HOURS_MAX))
    })
  }

  const stepSessionMinutes = (delta: number) => {
    setSessionMinutes((prev) => {
      const current = parseClampedNumber(prev, 32, MINUTES_MIN, MINUTES_MAX)
      return String(clampNumber(current + delta, MINUTES_MIN, MINUTES_MAX))
    })
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
      <section className="activity-page">
        <header className="activity-header">
          <h1 className="activity-header__title">Активности</h1>

          <div className="segmented-control" role="tablist" aria-label="Период активности">
            <button
              type="button"
              className={`segmented-control__item${range === 'week' ? ' is-active' : ''}`}
              onClick={() => setRange('week')}
            >
              Неделя
            </button>
            <button
              type="button"
              className={`segmented-control__item${range === 'month' ? ' is-active' : ''}`}
              onClick={() => setRange('month')}
            >
              Месяц
            </button>
            <button
              type="button"
              className={`segmented-control__item${range === 'year' ? ' is-active' : ''}`}
              onClick={() => setRange('year')}
            >
              Год
            </button>
          </div>
        </header>

        <div className="activity-cards" aria-label="Карточки активности">
          {ACTIVITY_ITEMS.map((item) => (
            <article key={item.id} className="activity-card">
              <div className="activity-card__layout">
                <div className="activity-card__details">
                  <h2 className="activity-card__title">{item.title}</h2>
                  <p className="activity-card__plan">{item.planLabel}</p>
                  <p className="activity-card__progress">{renderProgressLabel(item.progressLabel)}</p>

                  <div className="activity-card__track" aria-hidden="true">
                    <span className="activity-card__fill" style={{ width: '46%' }} />
                  </div>

                  <div className="activity-card__actions">
                    <Button
                      variant="ghost"
                      icon={<Plus size={18} strokeWidth={2.5} />}
                      onClick={() => openSessionForm(item)}
                    >
                      {item.actionLabel}
                    </Button>
                    <button type="button" className="activity-card__more" aria-label="Еще действия">
                      <img src={ICON_PATHS.tasks.menu} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className={`activity-card__bars${range === 'month' ? ' is-month' : ''}`}>
                  {item.timeline[range].map((value, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="activity-card__bar-wrap"
                      style={{ height: `${value}%` }}
                    >
                      <button
                        type="button"
                        className="activity-card__bar-hit"
                        onMouseEnter={() => setHoveredPointId(`${item.id}-${range}-${index}`)}
                        onMouseLeave={() => setHoveredPointId(null)}
                        onFocus={() => setHoveredPointId(`${item.id}-${range}-${index}`)}
                        onBlur={() => setHoveredPointId(null)}
                        aria-label={`${getTimelinePointDateLabel(range, index)} — ${getTimelinePointMinutes(value, range)}`}
                      >
                        <span className="activity-card__bar" />
                      </button>

                      {hoveredPointId === `${item.id}-${range}-${index}` ? (
                        <div className="activity-card__tooltip" role="status" aria-live="polite">
                          <p className="activity-card__tooltip-date">
                            {getTimelinePointDateLabel(range, index)}
                          </p>
                          <p className="activity-card__tooltip-time">
                            {getTimelinePointMinutes(value, range)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="activity-page__actions">
          <Button icon={<Plus size={14} />} onClick={() => openForm()}>
            Добавить активность
          </Button>
        </div>
      </section>

      <button
        type="button"
        className={`activity-modal-overlay${isAnyModalOpen ? ' is-open' : ''}`}
        aria-label="Закрыть форму"
        onClick={closeAllModals}
      />

      <section
        className={`activity-modal${isFormOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Добавить активность"
      >
        <div className="activity-modal__head">
          <h2 className="activity-modal__title">Добавить активность</h2>
          <button type="button" className="activity-modal__close" onClick={closeForm} aria-label="Закрыть">
            <img src={ICON_PATHS.common.exit} alt="" aria-hidden="true" />
          </button>
        </div>

        <div className="activity-modal__switch-row">
          <p className="activity-modal__switch-label">{planningText}</p>
          <ToggleSwitch
            checked={isPlanned}
            onCheckedChange={setIsPlanned}
            aria-label={isPlanned ? 'Выключить планирование' : 'Включить планирование'}
          />
        </div>

        <form className="activity-modal__form" onSubmit={(event) => event.preventDefault()}>
          {isPlanned ? (
            <InputField
              label={plannedFieldLabel}
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(event.target.value)}
            />
          ) : (
            <>
              <InputField
                label="Название активности"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <InputField
                label="Часов в неделю"
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(event.target.value)}
              />
            </>
          )}

          <div className="activity-modal__actions">
            <Button variant="ghost" onClick={closeForm}>Отменить</Button>
            <Button icon={<Plus size={14} />}>Добавить активность</Button>
          </div>
        </form>
      </section>

      <section
        className={`activity-session-modal${isSessionFormOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Добавить занятие"
      >
        <div className="activity-session-modal__head">
          <h2 className="activity-session-modal__title">
            Добавить занятие <span className="activity-session-modal__title-date">{sessionActivity ? sessionTitleDate(sessionDate) : ''}</span>
          </h2>

          <div className="activity-session-modal__head-right">
            <WorkCalendarNav
              label={sessionDateLabel(sessionDate)}
              rootClassName="activity-session-modal__date-nav"
              arrowClassName="activity-session-modal__date-arrow"
              labelClassName="activity-session-modal__date-label"
              calendarClassName="activity-session-modal__calendar"
              ariaLabel="Навигация по дате занятия"
              prevAriaLabel="Предыдущая дата"
              nextAriaLabel="Следующая дата"
              onPrev={() => setSessionDate((prev) => addDays(prev, -1))}
              onNext={() => setSessionDate((prev) => addDays(prev, 1))}
              selectedDate={sessionDate}
              onDateSelect={setSessionDate}
            />
            <button type="button" className="activity-session-modal__close" onClick={closeSessionForm} aria-label="Закрыть">
              <img src={ICON_PATHS.common.exit} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="activity-session-modal__separator" />

        <form className="activity-session-modal__form" onSubmit={(event) => event.preventDefault()}>
          <div className="activity-session-modal__inputs">
            <InputField
              label="Часов"
              value={sessionHours}
              inputMode="numeric"
              onChange={(event) => setSessionHours(sanitizeDigits(event.target.value))}
              onBlur={() => {
                setSessionHours((prev) => String(parseClampedNumber(prev, 1, HOURS_MIN, HOURS_MAX)))
              }}
              after={(
                <div className="activity-session-modal__stepper">
                  <button
                    type="button"
                    className="activity-session-modal__stepper-button"
                    aria-label="Увеличить часы"
                    onClick={() => stepSessionHours(1)}
                  >
                    <span className="activity-session-modal__stepper-chevron is-up" />
                  </button>
                  <button
                    type="button"
                    className="activity-session-modal__stepper-button"
                    aria-label="Уменьшить часы"
                    onClick={() => stepSessionHours(-1)}
                  >
                    <span className="activity-session-modal__stepper-chevron is-down" />
                  </button>
                </div>
              )}
            />
            <InputField
              label="Минут"
              value={sessionMinutes}
              inputMode="numeric"
              onChange={(event) => setSessionMinutes(sanitizeDigits(event.target.value))}
              onBlur={() => {
                setSessionMinutes((prev) => String(parseClampedNumber(prev, 32, MINUTES_MIN, MINUTES_MAX)))
              }}
              after={(
                <div className="activity-session-modal__stepper">
                  <button
                    type="button"
                    className="activity-session-modal__stepper-button"
                    aria-label="Увеличить минуты"
                    onClick={() => stepSessionMinutes(1)}
                  >
                    <span className="activity-session-modal__stepper-chevron is-up" />
                  </button>
                  <button
                    type="button"
                    className="activity-session-modal__stepper-button"
                    aria-label="Уменьшить минуты"
                    onClick={() => stepSessionMinutes(-1)}
                  >
                    <span className="activity-session-modal__stepper-chevron is-down" />
                  </button>
                </div>
              )}
            />
          </div>

          <TextareaField
            label="Журнал"
            value={sessionJournal}
            onChange={(event) => setSessionJournal(event.target.value)}
            className="activity-session-modal__journal"
          />

          <div className="activity-session-modal__actions">
            <Button variant="ghost" onClick={closeSessionForm}>Отменить</Button>
            <Button>Сохранить</Button>
          </div>
        </form>
      </section>
    </PlannerShell>
  )
}
