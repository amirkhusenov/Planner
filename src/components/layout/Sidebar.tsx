import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { ICON_PATHS } from '#constants/iconPaths'

interface NavItem {
  label: string
  icon: string
  to?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Задачи', icon: ICON_PATHS.sidebar.task, to: '/' },
  { label: 'Цели', icon: ICON_PATHS.sidebar.target, to: '/goals' },
  { label: 'Активности', icon: ICON_PATHS.sidebar.activity, to: '/activity' },
  { label: 'Статистика', icon: ICON_PATHS.sidebar.statistic, to: '/statistics' },
]

function isNavItemActive(pathname: string, to?: string) {
  if (!to) {
    return false
  }

  if (to === '/') {
    return pathname === '/'
  }

  return pathname.startsWith(to)
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAccountsOpen, setIsAccountsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }

      if (settingsRef.current?.contains(target)) {
        return
      }

      setIsSettingsOpen(false)
      setIsAccountsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  return (
    <aside
      className={clsx('sidebar', {
        'is-open': isOpen,
        'is-collapsed': !isOpen,
      })}
    >
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
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.to)

            return (
              <button
                key={item.label}
                type="button"
                className={clsx('sidebar__nav-item', {
                  'is-active': active,
                })}
                onClick={() => {
                  if (!item.to) {
                    return
                  }

                  navigate({ to: item.to })
                }}
                aria-disabled={!item.to}
              >
                <img className="sidebar__nav-icon" src={item.icon} alt="" aria-hidden="true" />
                <span className="sidebar__nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="sidebar__profile-wrap" ref={settingsRef}>
        <button
          className={clsx('sidebar__profile', {
            'is-active': isSettingsOpen,
          })}
          type="button"
          aria-label="Открыть меню пользователя"
          aria-expanded={isSettingsOpen}
          onClick={() => {
            setIsSettingsOpen((prev) => {
              const next = !prev
              if (!next) {
                setIsAccountsOpen(false)
              }
              return next
            })
          }}
        >
          <div className="avatar">И</div>
          <div className="sidebar__profile-meta">
            <p className="sidebar__profile-name">Илья Тиханов</p>
            <p className="sidebar__profile-time">Вт, 22 апреля, 21:17</p>
          </div>
        </button>

        {isSettingsOpen ? (
          <section className="sidebar-settings" aria-label="Настройки пользователя">
            <div className="sidebar-settings__head">
              <button
                className="sidebar-settings__head-button"
                type="button"
                onClick={() => setIsAccountsOpen((prev) => !prev)}
                aria-expanded={isAccountsOpen}
                aria-label="Выбрать аккаунт"
              >
                <div className="avatar">И</div>
                <p className="sidebar-settings__name">Илья Тяпкин</p>
                <img className="sidebar-settings__arrow" src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="sidebar-settings__line" />

            <nav className="sidebar-settings__list" aria-label="Меню пользователя">
              <button
                type="button"
                className="sidebar-settings__item"
                onClick={() => {
                  setIsSettingsOpen(false)
                  setIsAccountsOpen(false)
                  navigate({ to: '/profile' })
                }}
              >
                <img src={ICON_PATHS.settings.profile} alt="" aria-hidden="true" />
                <span>Профиль</span>
              </button>
              <button
                type="button"
                className="sidebar-settings__item"
                onClick={() => {
                  setIsSettingsOpen(false)
                  setIsAccountsOpen(false)
                  navigate({ to: '/settings' })
                }}
              >
                <img src={ICON_PATHS.settings.setting} alt="" aria-hidden="true" />
                <span>Настройки</span>
              </button>
              <button type="button" className="sidebar-settings__item">
                <img src={ICON_PATHS.settings.exit} alt="" aria-hidden="true" />
                <span>Выйти</span>
              </button>
            </nav>
          </section>
        ) : null}

        {isAccountsOpen ? (
          <section className="sidebar-accounts" aria-label="Смена аккаунта">
            <div className="sidebar-accounts__list">
              <button type="button" className="sidebar-accounts__item is-active">
                <span className="avatar">И</span>
                <span className="sidebar-accounts__email">Ilya123@gmail.com</span>
                <img className="sidebar-accounts__check" src={ICON_PATHS.settings.check} alt="" aria-hidden="true" />
              </button>
              <button type="button" className="sidebar-accounts__item">
                <span className="avatar">A</span>
                <span className="sidebar-accounts__email">Ivan5461@mail.ru</span>
              </button>
            </div>

            <div className="sidebar-accounts__line" />

            <button type="button" className="sidebar-accounts__add">
              <span className="sidebar-accounts__plus" aria-hidden="true">+</span>
              <span>Добавить аккаунт</span>
            </button>
          </section>
        ) : null}
      </div>
    </aside>
  )
}
