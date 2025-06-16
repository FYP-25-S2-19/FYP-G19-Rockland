import React, { useState, ReactNode, createContext, useContext } from "react"
import { ChevronDown } from "lucide-react"

// Context for sharing state between Select components
interface SelectContextType {
  value?: string
  onValueChange: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

const useSelect = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  children: ReactNode
  value?: string
  onValueChange: (value: string) => void
}

interface SelectTriggerProps {
  children: ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

interface SelectContentProps {
  children: ReactNode
  className?: string
}

interface SelectItemProps {
  children: ReactNode
  value: string
  className?: string
}

// Main Select wrapper component
export function Select({ children, value, onValueChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// Select trigger button
export function SelectTrigger({ children, className = "" }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = useSelect()
  
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

// Select value display
export function SelectValue({ placeholder = "Select...", className = "" }: SelectValueProps) {
  const { value } = useSelect()
  return <span className={className}>{value || placeholder}</span>
}

// Select dropdown content
export function SelectContent({ children, className = "" }: SelectContentProps) {
  const { isOpen, setIsOpen } = useSelect()
  
  if (!isOpen) return null
  
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      <div className={`absolute top-full z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md ${className}`}>
        <div className="max-h-60 overflow-auto p-1">
          {children}
        </div>
      </div>
    </>
  )
}

// Individual select item
export function SelectItem({ children, value, className = "" }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelect()
  const isSelected = selectedValue === value
  
  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${isSelected ? 'bg-blue-100 text-blue-900' : ''} ${className}`}
      onClick={() => {
        onValueChange(value)
        setIsOpen(false)
      }}
    >
      {children}
    </div>
  )
}