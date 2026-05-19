import { ICON_PATHS } from '../../constants/iconPaths'

interface LoadingScreenProps {
  progress: number
  phase: 'enter' | 'exit'
}

export default function LoadingScreen({ progress, phase }: LoadingScreenProps) {
  return (
    <section className={`loading-screen ${phase === 'exit' ? 'is-exit' : 'is-enter'}`} aria-label="Загрузка">
      <div className="loading-screen__content">
        <img className="loading-screen__logo" src={ICON_PATHS.sidebar.logo} alt="Planner" />
        <div className="loading-screen__track" aria-hidden="true">
          <span className="loading-screen__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  )
}
