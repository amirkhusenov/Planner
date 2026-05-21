import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { ru } from 'date-fns/locale'
import Calendar from '#components/ui/Calendar'
import WorkCalendarNav from '#components/ui/WorkCalendarNav'

const MONTH_NAME_RU = new Intl.DateTimeFormat('ru-RU', { month: 'long' })
const WEEKDAY_SHORT_RU = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })

function capitalize(value: string) {
  if (!value) {
    return value
  }

  return value[0].toUpperCase() + value.slice(1)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + value)
}

function addMonths(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth() + value, date.getDate())
}

function startOfWeek(date: Date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = normalized.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(normalized, diff)
}

function weekRangeLabel(date: Date) {
  const start = startOfWeek(date)
  const end = addDays(start, 6)
  const month = MONTH_NAME_RU.format(end)
  return `${start.getDate()}-${end.getDate()} ${month}`
}

function monthLabel(date: Date) {
  return capitalize(MONTH_NAME_RU.format(date))
}

function headerDateLabel(date: Date) {
  const weekday = capitalize(WEEKDAY_SHORT_RU.format(date).replace('.', ''))
  const month = MONTH_NAME_RU.format(date)

  return `${weekday}, ${date.getDate()} ${month}`
}

function calendarCaptionLabel(date: Date) {
  const month = capitalize(MONTH_NAME_RU.format(date))

  return `${month}, ${date.getFullYear()}`
}

function calendarWeekdayLabel(date: Date) {
  return capitalize(WEEKDAY_SHORT_RU.format(date).replace('.', ''))
}

export type TaskBoardView = 'day' | 'week' | 'month'

interface TaskBoardHeaderProps {
  view?: TaskBoardView
  onViewChange?: (view: TaskBoardView) => void
  selectedDate?: Date
  onSelectedDateChange?: (date: Date) => void
}

export default function TaskBoardHeader({
  view = 'day',
  onViewChange,
  selectedDate,
  onSelectedDateChange,
}: TaskBoardHeaderProps) {
  const [internalSelectedDate, setInternalSelectedDate] = useState(new Date(2026, 3, 22))
  const [viewDate, setViewDate] = useState(startOfMonth(new Date(2026, 3, 1)))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const dateControlRef = useRef<HTMLDivElement | null>(null)
  const activeDate = selectedDate ?? internalSelectedDate

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }

      if (dateControlRef.current?.contains(target)) {
        return
      }

      setIsCalendarOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (!isCalendarOpen || typeof document === 'undefined') {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isCalendarOpen])

  const handleViewChange = (next: TaskBoardView) => {
    onViewChange?.(next)
  }

  const handleDateChange = (next: Date) => {
    onSelectedDateChange?.(next)
    if (!selectedDate) {
      setInternalSelectedDate(next)
    }
    setViewDate(startOfMonth(next))
  }

  return (
    <header className="tasks-header">
      <div className="tasks-header__title-wrap">
        <h1 className="tasks-header__title">
          Задачи на <span className="tasks-header__title-muted">{view === 'week' ? 'неделю' : 'сегодня'}</span>
        </h1>
      </div>

      <div className="tasks-header__controls">
        <div className="segmented-control" role="tablist" aria-label="Диапазон">
          <button
            type="button"
            className={clsx('segmented-control__item', {
              'is-active': view === 'day',
            })}
            onClick={() => handleViewChange('day')}
          >
            День
          </button>
          <button
            type="button"
            className={clsx('segmented-control__item', {
              'is-active': view === 'week',
            })}
            onClick={() => handleViewChange('week')}
          >
            Неделя
          </button>
          <button
            type="button"
            className={clsx('segmented-control__item', {
              'is-active': view === 'month',
            })}
            onClick={() => handleViewChange('month')}
          >
            Месяц
          </button>
        </div>

        <div className="tasks-header__date-control" ref={dateControlRef}>
          <WorkCalendarNav
            label={
              view === 'week'
                ? weekRangeLabel(activeDate)
                : view === 'month'
                  ? monthLabel(activeDate)
                  : headerDateLabel(activeDate)
            }
            rootClassName="tasks-header__date-nav"
            arrowClassName="tasks-header__date-arrow"
            labelClassName="tasks-header__date-text"
            ariaLabel="Навигация по дате"
            prevAriaLabel="Предыдущий день"
            nextAriaLabel="Следующий день"
            onPrev={() => {
              const next =
                view === 'month'
                  ? addMonths(activeDate, -1)
                  : addDays(activeDate, view === 'week' ? -7 : -1)
              handleDateChange(next)
            }}
            onNext={() => {
              const next =
                view === 'month'
                  ? addMonths(activeDate, 1)
                  : addDays(activeDate, view === 'week' ? 7 : 1)
              handleDateChange(next)
            }}
            onLabelClick={() => setIsCalendarOpen((prev) => !prev)}
            expanded={isCalendarOpen}
            labelAriaLabel="Открыть календарь"
          />

          {isCalendarOpen ? (
            <>
              <button
                className="tasks-calendar__overlay"
                type="button"
                aria-label="Close calendar"
                onClick={() => setIsCalendarOpen(false)}
              />
              <section className="tasks-calendar" aria-label="Calendar">
                <Calendar
                  locale={ru}
                  weekStartsOn={1}
                  navLayout="around"
                  mode="single"
                  month={viewDate}
                  selected={activeDate}
                  onMonthChange={setViewDate}
                  onSelect={(date) => {
                    if (!date) {
                      return
                    }
                    handleDateChange(date)
                    setIsCalendarOpen(false)
                  }}
                  hidden={[
                    (date) => date < startOfMonth(viewDate),
                  ]}
                  formatters={{
                    formatCaption: calendarCaptionLabel,
                    formatWeekdayName: calendarWeekdayLabel,
                  }}
                />
              </section>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
