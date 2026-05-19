interface MonthlyTaskCard {
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function dayLabel(date: Date) {
  return `${WEEKDAY_SHORT_RU[date.getDay()]}, ${date.getDate()} ${MONTH_NAME_RU.format(date)}`
}

function buildMonthlyCards(baseDate: Date): MonthlyTaskCard[] {
  const monthStart = startOfMonth(baseDate)
  const firstDay = monthStart.getDay()
  const shift = firstDay === 0 ? -6 : 1 - firstDay
  const gridStart = addDays(monthStart, shift)

  return Array.from({ length: 30 }, (_, index) => {
    const date = addDays(gridStart, index)
    const total = 10 + (index % 31)
    const done = Math.min(total, (index * 7) % (total + 1))
    return {
      id: `month-${date.toISOString().slice(0, 10)}`,
      date,
      dayLabel: dayLabel(date),
      done,
      total,
    }
  })
}

interface MonthlyTasksGridProps {
  selectedDate: Date
  onDaySelect: (date: Date) => void
}

export default function MonthlyTasksGrid({ selectedDate, onDaySelect }: MonthlyTasksGridProps) {
  const cards = buildMonthlyCards(selectedDate)

  return (
    <section className="monthly-tasks" aria-label="Список задач на месяц">
      {cards.map((item) => {
        const progress = item.total === 0 ? 0 : Math.max(0, Math.min(100, (item.done / item.total) * 100))
        return (
          <button
            key={item.id}
            type="button"
            className="monthly-task-card"
            onClick={() => onDaySelect(item.date)}
            aria-label={`Открыть день ${item.dayLabel}`}
          >
            <h3 className="monthly-task-card__day">{item.dayLabel}</h3>
            <p className="monthly-task-card__meta">{item.done} / {item.total} задач</p>
            <div className="monthly-task-card__track" aria-hidden="true">
              <span className="monthly-task-card__fill" style={{ width: `${progress}%` }} />
            </div>
          </button>
        )
      })}
    </section>
  )
}
