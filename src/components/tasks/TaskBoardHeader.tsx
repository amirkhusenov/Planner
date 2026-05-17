import { useEffect, useRef, useState } from 'react'
import { ru } from 'date-fns/locale'
import { ICON_PATHS } from '../../constants/iconPaths'
import Calendar from '../ui/Calendar'

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

export default function TaskBoardHeader() {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 22))
  const [viewDate, setViewDate] = useState(startOfMonth(new Date(2026, 3, 1)))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const dateControlRef = useRef<HTMLDivElement | null>(null)

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

  return (
    <header className="tasks-header">
      <div>
        <h1 className="tasks-header__title">
          Задачи на <span className="tasks-header__title-muted">сегодня</span>
        </h1>
      </div>

      <div className="tasks-header__controls">
        <div className="segmented-control" role="tablist" aria-label="Диапазон">
          <button type="button" className="segmented-control__item is-active">
            День
          </button>
          <button type="button" className="segmented-control__item">
            Неделя
          </button>
          <button type="button" className="segmented-control__item">
            Месяц
          </button>
        </div>

        <div className="tasks-header__date-control" ref={dateControlRef}>
          <div className="tasks-header__date-nav" aria-label="Навигация по дате">
            <button
              type="button"
              className="tasks-header__date-arrow"
              aria-label="Предыдущий день"
              onClick={() => {
                const next = addDays(selectedDate, -1)
                setSelectedDate(next)
                setViewDate(startOfMonth(next))
              }}
            >
              <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="tasks-header__date-text"
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              aria-expanded={isCalendarOpen}
              aria-label="Открыть календарь"
            >
              {headerDateLabel(selectedDate)}
            </button>
            <button
              type="button"
              className="tasks-header__date-arrow is-next"
              aria-label="Следующий день"
              onClick={() => {
                const next = addDays(selectedDate, 1)
                setSelectedDate(next)
                setViewDate(startOfMonth(next))
              }}
            >
              <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
            </button>
          </div>

          {isCalendarOpen ? (
            <section className="tasks-calendar" aria-label="Календарь">
              <Calendar
                locale={ru}
                weekStartsOn={1}
                navLayout="around"
                mode="single"
                month={viewDate}
                selected={selectedDate}
                onMonthChange={setViewDate}
                onSelect={(date) => {
                  if (!date) {
                    return
                  }
                  setSelectedDate(date)
                  setViewDate(startOfMonth(date))
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
          ) : null}
        </div>
      </div>
    </header>
  )
}
