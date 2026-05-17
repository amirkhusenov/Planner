import { useState } from 'react'
import { ICON_PATHS } from '../../constants/iconPaths'

const NAV_ITEMS = [
  { label: 'Задачи', active: true, icon: ICON_PATHS.sidebar.task },
  { label: 'Цели', active: false, icon: ICON_PATHS.sidebar.target },
  { label: 'Активности', active: false, icon: ICON_PATHS.sidebar.activity },
  { label: 'Статистика', active: false, icon: ICON_PATHS.sidebar.statistic },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : 'is-collapsed'}`}>
      <div>
        <div className="sidebar__brand">
          {isOpen ? (
            <img className="sidebar__logo" src={ICON_PATHS.sidebar.logo} alt="Planner" />
          ) : null}
          <button
            className="sidebar__menu-btn"
            type="button"
            aria-label={isOpen ? 'Свернуть меню' : 'Открыть меню'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <img src={ICON_PATHS.sidebar.hamburger} alt="" aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`sidebar__nav-item${item.active ? ' is-active' : ''}`}
            >
              <img className="sidebar__nav-icon" src={item.icon} alt="" aria-hidden="true" />
              <span className="sidebar__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar__profile">
        <div className="avatar">И</div>
        <div className="sidebar__profile-meta">
          <p className="sidebar__profile-name">Илья Тиханов</p>
          <p className="sidebar__profile-time">Вт, 22 апреля, 21:17</p>
        </div>
      </div>
    </aside>
  )
}
