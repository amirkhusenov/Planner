import { useEffect, useState } from 'react'
import { ru } from 'date-fns/locale'
import { ICON_PATHS } from '../../constants/iconPaths'
import Calendar from './Calendar'

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

function calendarCaptionLabel(date: Date) {
  const month = capitalize(MONTH_NAME_RU.format(date))
  return `${month}, ${date.getFullYear()}`
}

function calendarWeekdayLabel(date: Date) {
  return capitalize(WEEKDAY_SHORT_RU.format(date).replace('.', ''))
}

interface WorkCalendarNavProps {
  label: string
  rootClassName: string
  arrowClassName: string
  labelClassName: string
  calendarClassName?: string
  nextArrowClassName?: string
  ariaLabel?: string
  prevAriaLabel?: string
  nextAriaLabel?: string
  onPrev: () => void
  onNext: () => void
  onLabelClick?: () => void
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  labelAriaLabel?: string
  expanded?: boolean
}

export default function WorkCalendarNav({
  label,
  rootClassName,
  arrowClassName,
  labelClassName,
  calendarClassName,
  nextArrowClassName = 'is-next',
  ariaLabel,
  prevAriaLabel = 'Предыдущая дата',
  nextAriaLabel = 'Следующая дата',
  onPrev,
  onNext,
  onLabelClick,
  selectedDate,
  onDateSelect,
  labelAriaLabel,
  expanded,
}: WorkCalendarNavProps) {
  const [isInternalCalendarOpen, setIsInternalCalendarOpen] = useState(false)
  const [viewDate, setViewDate] = useState(
    selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date(2026, 3, 1)),
  )

  const hasInternalCalendar = Boolean(selectedDate && onDateSelect)
  const isLabelInteractive = Boolean(onLabelClick || hasInternalCalendar)
  const isExpanded = expanded ?? isInternalCalendarOpen

  useEffect(() => {
    if (!selectedDate) {
      return
    }

    setViewDate(startOfMonth(selectedDate))
  }, [selectedDate])

  useEffect(() => {
    if (!isInternalCalendarOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }

      const rootNode = target.closest(`.${rootClassName.split(' ')[0]}`)
      if (!rootNode) {
        setIsInternalCalendarOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isInternalCalendarOpen, rootClassName])

  return (
    <div className={rootClassName} aria-label={ariaLabel}>
      <button
        type="button"
        className={arrowClassName}
        aria-label={prevAriaLabel}
        onClick={onPrev}
      >
        <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
      </button>

      {isLabelInteractive ? (
        <button
          type="button"
          className={labelClassName}
          onClick={() => {
            if (hasInternalCalendar) {
              setIsInternalCalendarOpen((prev) => !prev)
            }
            onLabelClick?.()
          }}
          aria-expanded={isExpanded}
          aria-label={labelAriaLabel ?? 'Открыть календарь'}
        >
          {label}
        </button>
      ) : (
        <span className={labelClassName}>{label}</span>
      )}

      <button
        type="button"
        className={`${arrowClassName} ${nextArrowClassName}`.trim()}
        aria-label={nextAriaLabel}
        onClick={onNext}
      >
        <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
      </button>

      {hasInternalCalendar && isInternalCalendarOpen ? (
        <section className={calendarClassName} aria-label="Календарь">
          <Calendar
            locale={ru}
            weekStartsOn={1}
            navLayout="around"
            mode="single"
            month={viewDate}
            selected={selectedDate}
            onMonthChange={setViewDate}
            onSelect={(date) => {
              if (!date || !onDateSelect) {
                return
              }
              onDateSelect(date)
              setIsInternalCalendarOpen(false)
            }}
            formatters={{
              formatCaption: calendarCaptionLabel,
              formatWeekdayName: calendarWeekdayLabel,
            }}
          />
        </section>
      ) : null}
    </div>
  )
}
