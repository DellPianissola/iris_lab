import type { ReactNode } from 'react'

interface RangeFieldProps {
  readonly label: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly onChange: (value: number) => void
}

export function RangeField({ label, value, min, max, onChange }: RangeFieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="field-value">{value}</span>
    </label>
  )
}

interface SelectFieldProps<T extends string> {
  readonly label: string
  readonly value: T
  readonly options: readonly { readonly id: T; readonly name: string }[]
  readonly onChange: (value: T) => void
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  )
}

interface TextFieldProps {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
}

export function TextField({ label, value, onChange }: TextFieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

interface GroupProps {
  readonly title: string
  readonly children: ReactNode
}

export function Group({ title, children }: GroupProps) {
  return (
    <section className="group">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

interface SegmentedProps<T extends string> {
  readonly value: T
  readonly options: readonly { readonly id: T; readonly label: string; readonly disabled?: boolean }[]
  readonly onChange: (value: T) => void
}

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={option.disabled ?? false}
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
