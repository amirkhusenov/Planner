import clsx from 'clsx'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  className?: string
  after?: ReactNode
}

export default function InputField({
  label,
  className = '',
  after,
  id,
  ...props
}: InputFieldProps) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId

  return (
    <label
      className={clsx('input-field', className, {
        'has-after': Boolean(after),
      })}
      htmlFor={inputId}
    >
      <span className="input-field__label">{label}</span>
      <input id={inputId} className="input-field__control" {...props} />
      {after ? <span className="input-field__after">{after}</span> : null}
    </label>
  )
}
