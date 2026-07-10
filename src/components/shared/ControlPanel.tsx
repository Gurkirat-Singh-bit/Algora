'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export interface FieldDef {
  name: string
  label: string
  type?: string
  placeholder?: string
}

export interface ActionDef {
  label: string
  onClick: (values: Record<string, string>) => void
  variant?: 'default' | 'outline' | 'destructive' | 'secondary'
  disabled?: boolean
}

interface Props {
  fields: FieldDef[]
  actions: ActionDef[]
}

export function ControlPanel({ fields, actions }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(f => [f.name, '']))
  )

  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-3 rounded-md surface-floor px-4 py-3 hairline border">
      {fields.map(f => (
        <div key={f.name} className="flex min-w-40 flex-col gap-1.5">
          <label className="font-mono text-[10px] font-medium uppercase tracking-category text-dsa-muted-soft">
            {f.label}
          </label>
          <Input
            type={f.type ?? 'text'}
            placeholder={f.placeholder}
            value={values[f.name]}
            onChange={e => setValues(prev => ({ ...prev, [f.name]: e.target.value }))}
            className="w-full"
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        {actions.map(action => (
          <Button
            key={action.label}
            variant={action.variant ?? 'default'}
            size="sm"
            onClick={() => action.onClick(values)}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
