"use client"

import * as React from "react"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
  className?: string
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", decorative = true, ...props }, ref) => {
    const baseClasses = "shrink-0 bg-gray-200"
    const orientationClasses = orientation === "horizontal" 
      ? "h-[1px] w-full" 
      : "h-full w-[1px]"
    
    const combinedClasses = `${baseClasses} ${orientationClasses} ${className}`.trim()

    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation}
        className={combinedClasses}
        {...props}
      />
    )
  }
)

Separator.displayName = "Separator"

export { Separator }