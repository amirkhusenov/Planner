import clsx from 'clsx'
import type { ReactNode } from 'react'
import { ICON_PATHS } from '#constants/iconPaths'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

interface PlannerShellProps {
  children: ReactNode
  contentClassName?: string
  showMobileTop?: boolean
  showRightSidebar?: boolean
}

export default function PlannerShell({
  children,
  contentClassName,
  showMobileTop = true,
  showRightSidebar = true,
}: PlannerShellProps) {
  const sectionClassName = clsx('planner-content', contentClassName)

  return (
    <main className="planner-root">
      <Sidebar />

      <section className={sectionClassName}>
        {showMobileTop ? (
          <header className="planner-mobile-top" aria-label="Мобильная шапка">
            <img className="planner-mobile-top__brand" src={ICON_PATHS.sidebar.logo} alt="Planner" />
            <div className="planner-mobile-top__profile">
              <div className="avatar">И</div>
              <div>
                <p className="sidebar__profile-name">Илья Тяпкин</p>
                <p className="sidebar__profile-time">Вт, 22 апреля, 21:17</p>
              </div>
            </div>
          </header>
        ) : null}

        {children}
      </section>

      {showRightSidebar ? <RightSidebar /> : null}
    </main>
  )
}
