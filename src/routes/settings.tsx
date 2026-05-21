import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import PlannerShell from '../components/layout/PlannerShell'
import ToggleSwitch from '#components/ui/ToggleSwitch'
import { ICON_PATHS } from '#constants/iconPaths'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <PlannerShell showMobileTop={false}>
      <section className="settings-page">
        <h1 className="settings-page__title">Настройки</h1>

        <div className="settings-groups">
          <SettingsGroup title="Общее">
            <SettingsRow
              label="Внешний вид"
              right={<SettingsSelectValue value="Системный" />}
            />
            <SettingsRow
              label="Язык"
              right={<SettingsSelectValue value="Определить автоматически" />}
            />
            <SettingsRow
              label="Цвет"
              right={<SettingsColorValue value="Оранжевый" />}
            />
          </SettingsGroup>

          <SettingsGroup title="Уведомления">
            <SettingsRow
              label="Куда уведомлять"
              right={<SettingsSelectValue value="Ilya123@gmail.com" />}
            />
            <SettingsRow
              label="Рекомендации"
              note="Будьте в курсе новых инструментов, советов и функций"
              right={<ToggleSwitch defaultChecked aria-label="Рекомендации" />}
            />
            <SettingsRow
              label="Задачи"
              note="Сообщим вам все изменения из задач"
              right={<ToggleSwitch defaultChecked aria-label="Задачи" />}
            />
            <SettingsRow
              label="Цели"
              note="Сообщим вам все изменения из целей"
              right={<ToggleSwitch aria-label="Цели" />}
            />
            <SettingsRow
              label="Активности"
              note="Сообщим вам все из активностей"
              right={<ToggleSwitch defaultChecked aria-label="Активности" />}
            />
            <SettingsRow
              label="Статистика"
              note="Сообщим вам все из статистики"
              right={<ToggleSwitch aria-label="Статистика" />}
            />
          </SettingsGroup>

          <SettingsGroup title="Безопасность">
            <SettingsRow label="Пароль" right={<SettingsSecureValue />} />
            <SettingsRow
              label="Многофакторная аутентификация (MFA)"
              right={<ToggleSwitch aria-label="MFA" />}
            />
            <SettingsRow
              label="Выйти из этого устройства"
              note="Будет выполнен выход из текущего сеанса"
              right={<SettingsDangerButton label="Выйти" />}
            />
            <SettingsRow
              label="Выйти со всех устройств"
              note="Будет выполнен выход из всех активных сеансов на всех устройствах, включая текущее"
              right={<SettingsDangerButton label="Выйти из всех" />}
            />
          </SettingsGroup>

          <SettingsGroup title="Учетная запись">
            <SettingsRow label="Имя" right={<span className="settings-value">Илья Тяпкин</span>} />
            <SettingsRow
              label="Электронная почта"
              right={<SettingsSelectValue value="Ilya123@gmail.com" />}
            />
            <SettingsRow
              label="Удалить учетную запись"
              note="Восстановить аккаунт не получится"
              right={<SettingsDangerButton label="Удалить" />}
            />
          </SettingsGroup>
        </div>
      </section>
    </PlannerShell>
  )
}

interface SettingsGroupProps {
  title: string
  children: ReactNode
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section className="settings-group" aria-label={title}>
      <h2 className="settings-group__title">{title}</h2>
      <div className="settings-group__rows">{children}</div>
    </section>
  )
}

interface SettingsRowProps {
  label: string
  note?: string
  right: ReactNode
}

function SettingsRow({ label, note, right }: SettingsRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row__left">
        <p className="settings-row__label">{label}</p>
        {note ? <p className="settings-row__note">{note}</p> : null}
      </div>
      <div className="settings-row__right">{right}</div>
    </div>
  )
}

interface SettingsSelectValueProps {
  value: string
}

function SettingsSelectValue({ value }: SettingsSelectValueProps) {
  return (
    <span className="settings-select-value">
      <span>{value}</span>
      <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
    </span>
  )
}

interface SettingsColorValueProps {
  value: string
}

function SettingsColorValue({ value }: SettingsColorValueProps) {
  return (
    <span className="settings-select-value">
      <span className="settings-color-dot" aria-hidden="true" />
      <span>{value}</span>
      <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
    </span>
  )
}

function SettingsSecureValue() {
  return (
    <span className="settings-select-value">
      <span>********</span>
      <img src={ICON_PATHS.common.arrow} alt="" aria-hidden="true" />
    </span>
  )
}

interface SettingsDangerButtonProps {
  label: string
}

function SettingsDangerButton({ label }: SettingsDangerButtonProps) {
  return <button className="settings-danger-button" type="button">{label}</button>
}
