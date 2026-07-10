import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium tracking-tight transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dsa-primary-container/35 focus-visible:ring-offset-2 focus-visible:ring-offset-dsa-bg',
  {
    variants: {
      variant: {
        default: 'bg-dsa-primary-container text-[var(--on-accent)] hover:bg-dsa-active',
        destructive: 'bg-dsa-delete text-dsa-text-strong hover:opacity-90',
        outline: 'border border-dsa-border bg-transparent text-dsa-text hover:bg-dsa-card hover:border-dsa-border-strong',
        secondary: 'bg-dsa-card text-dsa-text hover:bg-dsa-panel',
        ghost: 'text-dsa-muted hover:bg-dsa-card hover:text-dsa-text',
        link: 'text-dsa-primary-container underline-offset-4 hover:text-dsa-primary hover:underline',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 rounded-md px-2.5 text-[12px]',
        lg: 'h-9 rounded-md px-4',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }