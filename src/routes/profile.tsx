import { createFileRoute, useNavigate } from '@tanstack/react-router'
import PlannerShell from '../components/layout/PlannerShell'
import { ICON_PATHS } from '../constants/iconPaths'

export const Route = createFileRoute('/profile')({
  component: ProfileEditPage,
})

function ProfileEditPage() {
  const navigate = useNavigate()

  return (
    <PlannerShell showMobileTop={false}>
      <section className="profile-edit-page">
        <section className="profile-edit-card">
          <h1 className="profile-edit__title">Редактировать профиль</h1>

          <div className="profile-edit__content">
            <div className="profile-edit__avatar-wrap">
              <div className="profile-edit__avatar">И</div>
              <button className="profile-edit__camera" type="button" aria-label="Изменить фото">
                <img src={ICON_PATHS.common.camera} alt="" aria-hidden="true" />
              </button>
            </div>

            <form className="profile-edit__form" onSubmit={(event) => event.preventDefault()}>
              <label className="profile-edit__field">
                <span className="profile-edit__field-label">Имя</span>
                <input className="profile-edit__input" type="text" defaultValue="Илья" />
              </label>
              <label className="profile-edit__field">
                <span className="profile-edit__field-label">Фамилия</span>
                <input className="profile-edit__input" type="text" defaultValue="Тяпкин" />
              </label>
              <label className="profile-edit__field">
                <span className="profile-edit__field-label">Дата рождения</span>
                <input className="profile-edit__input" type="text" placeholder="Не указано" />
              </label>

              <div className="profile-edit__actions">
                <button
                  type="button"
                  className="profile-edit__button profile-edit__button--ghost"
                  onClick={() => navigate({ to: '/' })}
                >
                  Отменить
                </button>
                <button type="submit" className="profile-edit__button profile-edit__button--solid">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </section>
      </section>
    </PlannerShell>
  )
}
