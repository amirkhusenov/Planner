import type * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ICON_PATHS } from '../../constants/iconPaths'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export default function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  navLayout = 'around',
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout={navLayout}
      className={['shadcn-calendar', className].filter(Boolean).join(' ')}
      classNames={{
        months: 'shadcn-calendar__months',
        month: 'shadcn-calendar__month',
        month_caption: 'shadcn-calendar__caption',
        caption_label: 'shadcn-calendar__caption-label',
        nav: 'shadcn-calendar__nav',
        button_previous: 'shadcn-calendar__nav-button',
        button_next: 'shadcn-calendar__nav-button shadcn-calendar__nav-button--next',
        month_grid: 'shadcn-calendar__month-grid',
        weekdays: 'shadcn-calendar__weekdays',
        weekday: 'shadcn-calendar__weekday',
        weeks: 'shadcn-calendar__weeks',
        week: 'shadcn-calendar__week',
        day: 'shadcn-calendar__day',
        day_button: 'shadcn-calendar__day-button',
        selected: 'is-selected',
        outside: 'is-outside',
        hidden: 'is-hidden',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          <span className={`shadcn-calendar__chevron${orientation === 'right' ? ' is-next' : ''}`}>
            <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
          </span>
        ),
      }}
      {...props}
    />
  )
}
