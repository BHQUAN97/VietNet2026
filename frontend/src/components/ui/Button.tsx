'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-label font-semibold uppercase tracking-label-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-container text-on-primary hover:bg-primary hover:shadow-ambient-md active:scale-[0.97] active:shadow-ambient-sm shadow-ambient-sm',
        secondary:
          'bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:shadow-ambient-sm active:scale-[0.97]',
        ghost:
          'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:bg-surface-container-high',
        outline:
          'bg-surface-container-low text-on-surface hover:bg-surface-container hover:text-primary active:scale-[0.97]',
        danger:
          'bg-error-container text-on-error-container hover:bg-error hover:text-on-error active:scale-[0.97]',
      },
      size: {
        sm: 'h-10 min-h-[44px] px-4 text-label-sm rounded-full',
        md: 'h-11 px-6 text-label-md rounded-full',
        lg: 'h-14 px-8 text-label-lg rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
