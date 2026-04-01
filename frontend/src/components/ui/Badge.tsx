import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Badge — hiển thị trạng thái, tag, label
 * Dùng chung cho admin tables, public cards, notification badges
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 font-label uppercase tracking-label-wide whitespace-nowrap',
  {
    variants: {
      variant: {
        // Trạng thái chính
        success:
          'bg-success-container text-on-success-container',
        warning:
          'bg-warning-container text-on-warning-container',
        error:
          'bg-error-container text-on-error-container',
        info:
          'bg-info-container text-on-info-container',
        neutral:
          'bg-neutral-container text-on-neutral-container',

        // Brand variants
        primary:
          'bg-primary/10 text-primary',
        'primary-container':
          'bg-primary-container/20 text-on-primary-container',
        secondary:
          'bg-secondary-container/40 text-on-secondary-container',
        tertiary:
          'bg-tertiary-container/20 text-on-tertiary-container',

        // Tonal style — nhe nhang hon (khong dung border theo No-Line Rule)
        'outline-success':
          'bg-success/5 text-success',
        'outline-warning':
          'bg-warning/5 text-warning',
        'outline-error':
          'bg-error/5 text-error',
        'outline-info':
          'bg-info/5 text-info',
        'outline-neutral':
          'bg-neutral-status/5 text-neutral-status',
      },
      size: {
        sm: 'px-2 py-0.5 text-label-sm rounded-md',
        md: 'px-2.5 py-1 text-label-sm rounded-lg',
        lg: 'px-3 py-1.5 text-label-lg rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'sm',
    },
  }
)

// Dot indicator cho badge có trạng thái "live"
function StatusDot({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-1.5 w-1.5 rounded-full bg-current', className)}
    />
  )
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && <StatusDot />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
