import * as React from "react"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

export function Separator(
  { className, orientation = "horizontal", decorative = true, ...props }: SeparatorProps,
) {
  const orientationClasses = {
    horizontal: "h-[1px] w-full",
    vertical: "h-full w-[1px]"
  }
  
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={`shrink-0 bg-border ${orientationClasses[orientation]} ${className || ''}`}
      {...props}
    />
  )
}