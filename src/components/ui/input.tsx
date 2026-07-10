import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8 w-full rounded-md border border-dsa-border bg-dsa-card/70 px-2.5 text-[13px] text-dsa-text-strong transition-colors',
          'placeholder:text-dsa-muted-soft',
          'focus:outline-none focus:border-dsa-border-strong focus:bg-dsa-card',
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
