interface WeeklyTaskCard {
  id: string
  date: Date
  dayLabel: string
  done: number
  total: number
}

const WEEKDAY_SHORT_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_NAME_RU = new Intl.DateTimeFormat('ru-RU', { month: 'long' })

function addDays(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + value)
}

function startOfWeek(date: Date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = normalized.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(normalized, diff)
}

function dayLabel(date: Date) {
  return `${WEEKDAY_SHORT_RU[date.getDay()]}, ${date.getDate()} ${MONTH_NAME_RU.format(date)}`
}

function buildWeeklyCards(baseDate: Date): WeeklyTaskCard[] {
  const start = startOfWeek(baseDate)
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    const done = index < 4 ? 11 : 0
    return {
      id: `week-${date.toISOString().slice(0, 10)}`,
      date,
      dayLabel: dayLabel(date),
      done,
      total: 27,
    }
  })
}

interface WeeklyTasksGridProps {
  selectedDate: Date
  onDaySelect: (date: Date) => void
}

export default function WeeklyTasksGrid({ selectedDate, onDaySelect }: WeeklyTasksGridProps) {
  const cards = buildWeeklyCards(selectedDate)

  return (
    <section className="weekly-tasks" aria-label="Список задач на неделю">
      {cards.map((item) => {
        const progress = item.total === 0 ? 0 : Math.max(0, Math.min(100, (item.done / item.total) * 100))
        return (
          <button
            key={item.id}
            type="button"
            className="weekly-task-card"
            onClick={() => onDaySelect(item.date)}
            aria-label={`Open day ${item.dayLabel}`}
          >
            <h3 className="weekly-task-card__day">{item.dayLabel}</h3>
            <p className="weekly-task-card__meta">{item.done} / {item.total} задач</p>
            <div className="weekly-task-card__track" aria-hidden="true">
              <span className="weekly-task-card__fill" style={{ width: `${progress}%` }} />
            </div>
          </button>
        )
      })}
    </section>
  )
}
