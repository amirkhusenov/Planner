import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PlannerShell from '../components/layout/PlannerShell'

export const Route = createFileRoute('/statistics')({
  component: StatisticsPage,
})

type ActivityRange = 'week' | 'month' | 'year'

interface SummaryCard {
  id: string
  label: string
  value: string
}

interface ProgressCard {
  id: string
  label: string
  percent: number
  ratio: string
}

interface ChartPoint {
  id: string
  value: number
  label: string
  detail: string
}

const SUMMARY_CARDS: SummaryCard[] = [
  { id: 'open', label: 'Открыто задач', value: '417' },
  { id: 'done', label: 'Завершено задач', value: '521' },
]

const PROGRESS_CARDS: ProgressCard[] = [
  { id: 'today', label: 'Задачи на сегодня', percent: 20, ratio: '2/10' },
  { id: 'week', label: 'Задачи на неделю', percent: 90, ratio: '9/10' },
  { id: 'month', label: 'Задачи за месяц', percent: 40, ratio: '4/10' },
]

const RANGE_TABS: { id: ActivityRange; label: string }[] = [
  { id: 'week', label: 'Нед' },
  { id: 'month', label: 'Мес' },
  { id: 'year', label: 'Год' },
]

const WEEKDAY_SHORT_RU = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const MONTH_SHORT_RU = new Intl.DateTimeFormat('ru-RU', { month: 'short' })
const MONTH_LONG_RU = new Intl.DateTimeFormat('ru-RU', { month: 'long' })
const MONTH_CHART_ROW_LENGTH = 12

const GOAL_PROGRESS = 60
const GOAL_RING_SIZE = 228
const GOAL_RING_STROKE = 28
const GOAL_RING_RADIUS = (GOAL_RING_SIZE - GOAL_RING_STROKE) / 2
const GOAL_RING_CIRCUMFERENCE = 2 * Math.PI * GOAL_RING_RADIUS

function capitalize(value: string) {
  if (!value) {
    return value
  }

  return value[0].toUpperCase() + value.slice(1)
}

function addDays(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + value)
}

function toHoursDetail(percentValue: number) {
  const hours = Math.max(1, Math.round((percentValue / 100) * 24))
  return `${hours} ч`
}

function createWeekPoints(): ChartPoint[] {
  const baseDate = new Date(2026, 3, 20)
  const values = [72, 38, 54, 84, 66, 59, 47]

  return values.map((value, index) => {
    const date = addDays(baseDate, index)
    const day = capitalize(WEEKDAY_SHORT_RU.format(date).replace('.', ''))
    const month = MONTH_SHORT_RU.format(date).replace('.', '')

    return {
      id: `week-${index}`,
      value,
      label: `${day}, ${date.getDate()} ${month}`,
      detail: toHoursDetail(value),
    }
  })
}

function createMonthPoints(): ChartPoint[] {
  const values = [80, 8, 26, 42, 76, 58, 52, 52, 16, 92, 64, 30, 44, 79, 58, 53, 53, 28, 44, 79, 58, 53, 53, 28]
  const baseDate = new Date(2026, 3, 1)

  return values.map((value, index) => {
    const date = addDays(baseDate, index)
    const month = MONTH_SHORT_RU.format(date).replace('.', '')

    return {
      id: `month-${index}`,
      value,
      label: `${date.getDate()} ${month}`,
      detail: toHoursDetail(value),
    }
  })
}

function createYearPoints(): ChartPoint[] {
  const values = [62, 10, 24, 39, 70, 55, 50, 50, 16, 84, 58, 29]

  return values.map((value, index) => {
    const date = new Date(2026, index, 1)

    return {
      id: `year-${index}`,
      value,
      label: `${capitalize(MONTH_LONG_RU.format(date))}, 2026`,
      detail: toHoursDetail(value),
    }
  })
}

const ACTIVITY_POINTS: Record<ActivityRange, ChartPoint[]> = {
  week: createWeekPoints(),
  month: createMonthPoints(),
  year: createYearPoints(),
}

function StatisticsPage() {
  const [range, setRange] = useState<ActivityRange>('month')
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null)

  const ringOffset = useMemo(
    () => GOAL_RING_CIRCUMFERENCE * (1 - GOAL_PROGRESS / 100),
    [],
  )

  const renderChartPoint = (point: ChartPoint) => (
    <div
      key={point.id}
      className="statistics-chart-card__bar-wrap"
      style={{ height: `${Math.max(8, point.value)}%` }}
    >
      <button
        type="button"
        className="statistics-chart-card__bar-hit"
        onMouseEnter={() => setHoveredPointId(point.id)}
        onMouseLeave={() => setHoveredPointId(null)}
        onFocus={() => setHoveredPointId(point.id)}
        onBlur={() => setHoveredPointId(null)}
        aria-label={`${point.label} - ${point.detail}`}
      >
        <span className="statistics-chart-card__bar" />
      </button>

      {hoveredPointId === point.id ? (
        <div className="statistics-chart-card__tooltip" role="status" aria-live="polite">
          <p className="statistics-chart-card__tooltip-label">{point.label}</p>
          <p className="statistics-chart-card__tooltip-value">{point.detail}</p>
        </div>
      ) : null}
    </div>
  )

  return (
    <PlannerShell contentClassName="statistics-content" showRightSidebar={false}>
      <section className="statistics-page">
        <h1 className="statistics-page__title">Статистика</h1>

        <div className="statistics-grid">
          <section className="statistics-left-stack" aria-label="Обзор задач">
            <div className="statistics-mini-grid">
              {SUMMARY_CARDS.map((card) => (
                <article key={card.id} className="statistics-card statistics-card--mini">
                  <p className="statistics-card__label">{card.label}</p>
                  <p className="statistics-card__value">{card.value}</p>
                </article>
              ))}
            </div>

            <div className="statistics-progress-stack">
              {PROGRESS_CARDS.map((card) => (
                <article key={card.id} className="statistics-card statistics-progress-card">
                  <p className="statistics-card__label">{card.label}</p>
                  <div className="statistics-progress-card__head">
                    <p className="statistics-progress-card__value">{card.percent}%</p>
                    <p className="statistics-progress-card__ratio">{card.ratio}</p>
                  </div>
                  <div className="statistics-progress-card__track" aria-hidden="true">
                    <span
                      className="statistics-progress-card__fill"
                      style={{ width: `${card.percent}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="statistics-side-stack" aria-label="Цели и период">
            <article className="statistics-card statistics-goal-card">
              <p className="statistics-card__label">Выполнение целей</p>
              <p className="statistics-goal-card__value">
                7 <span className="statistics-goal-card__muted">/ 12</span>
              </p>

              <div className="statistics-goal-card__ring" aria-label={`Выполнение целей ${GOAL_PROGRESS}%`}>
                <svg
                  className="statistics-goal-card__ring-svg"
                  width={GOAL_RING_SIZE}
                  height={GOAL_RING_SIZE}
                  viewBox={`0 0 ${GOAL_RING_SIZE} ${GOAL_RING_SIZE}`}
                  aria-hidden="true"
                >
                  <circle
                    className="statistics-goal-card__ring-track"
                    cx={GOAL_RING_SIZE / 2}
                    cy={GOAL_RING_SIZE / 2}
                    r={GOAL_RING_RADIUS}
                  />
                  <circle
                    className="statistics-goal-card__ring-progress"
                    cx={GOAL_RING_SIZE / 2}
                    cy={GOAL_RING_SIZE / 2}
                    r={GOAL_RING_RADIUS}
                    style={{
                      strokeDasharray: GOAL_RING_CIRCUMFERENCE,
                      strokeDashoffset: ringOffset,
                    }}
                  />
                </svg>
                <div className="statistics-goal-card__ring-inner">
                  <p className="statistics-goal-card__ring-top">7 / 12</p>
                  <p className="statistics-goal-card__ring-value">{GOAL_PROGRESS}%</p>
                </div>
              </div>
            </article>

            <article className="statistics-card statistics-days-card">
              <p className="statistics-card__label">Вы на платформе уже</p>
              <p className="statistics-days-card__value">
                12 <span className="statistics-days-card__muted">дней</span>
              </p>
              <p className="statistics-days-card__date">С 10 апреля 2026</p>
            </article>
          </section>

          <article className="statistics-card statistics-chart-card" aria-label="Общая активность">
            <div className="statistics-chart-card__head">
              <div className="statistics-chart-card__headline">
                <p className="statistics-card__label">Общая активность</p>
                <p className="statistics-chart-card__value">
                  217 <span className="statistics-chart-card__value-muted">часов</span>
                </p>
              </div>

              <div className="segmented-control statistics-chart-card__tabs" role="tablist" aria-label="Период статистики">
                {RANGE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={clsx('segmented-control__item', { 'is-active': range === tab.id })}
                    onClick={() => {
                      setRange(tab.id)
                      setHoveredPointId(null)
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={clsx('statistics-chart-card__bars', `statistics-chart-card__bars--${range}`)} aria-label="График активности">
              {range === 'month'
                ? [
                    ACTIVITY_POINTS.month.slice(0, MONTH_CHART_ROW_LENGTH),
                    ACTIVITY_POINTS.month.slice(MONTH_CHART_ROW_LENGTH),
                  ]
                    .filter((row) => row.length > 0)
                    .map((row, rowIndex) => (
                      <div key={`month-row-${rowIndex}`} className="statistics-chart-card__bars-row">
                        {row.map(renderChartPoint)}
                      </div>
                    ))
                : ACTIVITY_POINTS[range].map(renderChartPoint)}
            </div>
          </article>
        </div>
      </section>
    </PlannerShell>
  )
}

