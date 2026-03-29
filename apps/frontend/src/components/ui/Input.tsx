import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'placeholder:text-gray-400',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
          ].join(' ')}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
        {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
