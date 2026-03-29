import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
        ].join(' ')}
        {...props}
      >
        {isLoading ? <span className="mr-2 animate-spin">⟳</span> : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
