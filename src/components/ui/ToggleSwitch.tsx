import { useState, type ButtonHTMLAttributes } from 'react'

interface ToggleSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export default function ToggleSwitch({
  defaultChecked = false,
  checked,
  onCheckedChange,
  className = '',
  ...props
}: ToggleSwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

  const toggle = () => {
    const next = !isChecked

    if (!isControlled) {
      setInternalChecked(next)
    }

    onCheckedChange?.(next)
  }

  return (
    <button
      type="button"
      className={`toggle-switch${isChecked ? ' is-on' : ''} ${className}`.trim()}
      aria-pressed={isChecked}
      onClick={toggle}
      {...props}
    >
      <span className="toggle-switch__thumb" />
    </button>
  )
}
