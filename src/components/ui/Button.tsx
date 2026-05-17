import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

export default function Button({
  children,
  className = '',
  icon,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${className}`.trim()}
      {...props}
    >
      {icon ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}

