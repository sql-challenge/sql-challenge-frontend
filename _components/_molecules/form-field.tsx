import { Input, type InputProps } from "@/_components/_atoms/input"
import { Label } from "@/_components/_atoms/label"
import { twMerge } from "tailwind-merge"

interface FormFieldProps extends InputProps {
  label: string
  error?: string
  helperText?: string
}

export function FormField({ label, error, helperText, className, id, ...props }: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className={twMerge("space-y-2", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} error={error} {...props} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  )
}
