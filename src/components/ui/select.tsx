import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  hint?: string
}

interface SelectProps {
  value: string | undefined
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  id?: string
}

export function Select({ value, onChange, options, placeholder = 'Select…', className, id }: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm',
          'shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          !value && 'text-muted-foreground',
        )}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}{o.hint ? ` · ${o.hint}` : ''}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function FieldLabel({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground', className)}
      {...props}
    />
  )
}
