import { useId, type TextareaHTMLAttributes } from 'react'

interface TextareaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  label: string
  className?: string
}

export default function TextareaField({
  label,
  className = '',
  id,
  ...props
}: TextareaFieldProps) {
  const fallbackId = useId()
  const textareaId = id ?? fallbackId

  return (
    <label className={`textarea-field ${className}`.trim()} htmlFor={textareaId}>
      <span className="textarea-field__label">{label}</span>
      <textarea id={textareaId} className="textarea-field__control" {...props} />
    </label>
  )
}
