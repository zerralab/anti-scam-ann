import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function Badge(
  { className, variant = "default", ...props }: BadgeProps,
) {
  const variantClasses = {
    default: "bg-primary/80 text-primary-foreground hover:bg-primary/70",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive/80 text-destructive-foreground hover:bg-destructive/70",
    outline: "border border-primary text-primary",
    success: "bg-green-500/80 text-white hover:bg-green-500/70",
    warning: "bg-orange-500/80 text-white hover:bg-orange-500/70"
  }
  
  return (
    <div
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className || ''}`}
      {...props}
    />
  )
}