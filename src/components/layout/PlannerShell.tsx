import type { ReactNode } from 'react'
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
  const sectionClassName = contentClassName
    ? `planner-content ${contentClassName}`
    : 'planner-content'

  return (
    <main className="planner-root">
      <Sidebar />

      <section className={sectionClassName}>
        {showMobileTop ? (
          <header className="planner-mobile-top" aria-label="Мобильная шапка">
            <p className="planner-mobile-top__brand">Planner</p>
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
