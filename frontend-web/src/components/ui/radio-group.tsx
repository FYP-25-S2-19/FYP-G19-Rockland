import React, { ReactNode } from "react"

interface RadioGroupProps {
  children: ReactNode
  value?: string
  onValueChange: (value: string) => void
  className?: string
}

interface RadioGroupItemProps {
  value: string
  id?: string
  selectedValue?: string
  onValueChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

// RadioGroup wrapper component
export function RadioGroup({ children, value, onValueChange, className = "" }: RadioGroupProps) {
  return (
    <div className={`grid gap-2 ${className}`} role="radiogroup">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            selectedValue: value, 
            onValueChange 
          } as any)
        }
        return child
      })}
    </div>
  )
}

// Individual radio button item
export function RadioGroupItem({ 
  value, 
  id, 
  selectedValue, 
  onValueChange, 
  className = "",
  disabled = false 
}: RadioGroupItemProps) {
  const isSelected = selectedValue === value
  
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={`aspect-square h-4 w-4 rounded-full border border-gray-300 text-blue-600 ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white'
      } ${className}`}
      onClick={() => !disabled && onValueChange && onValueChange(value)}
      id={id}
      disabled={disabled}
    >
      {isSelected && (
        <div className="flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      )}
    </button>
  )
}