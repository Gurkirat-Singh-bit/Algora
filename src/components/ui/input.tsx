import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-md border border-dsa-border bg-dsa-card/70 px-3 text-base text-dsa-text-strong transition-colors md:h-8 md:px-2.5 md:text-[13px]',
          'placeholder:text-dsa-muted-soft',
          'focus:outline-none focus:border-dsa-border-strong focus:bg-dsa-card focus:ring-2 focus:ring-dsa-primary-container/30',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-dsa-text',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
