import * as React from "react"
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success" | "info"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-background text-foreground",
      destructive: "bg-destructive/15 text-destructive border-destructive/50",
      warning: "bg-orange-500/15 text-orange-500 border-orange-500/50",
      success: "bg-green-500/15 text-green-500 border-green-500/50",
      info: "bg-blue-500/15 text-blue-500 border-blue-500/50"
    }
    
    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11 ${variantStyles[variant]} ${className || ''}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className || ''}`}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

interface AlertIconProps {
  variant?: "default" | "destructive" | "warning" | "success" | "info"
  className?: string
}

export const AlertIcon = ({ variant = "default", className }: AlertIconProps) => {
  const iconMap = {
    default: <Info className={`h-4 w-4 ${className || ''}`} />,
    destructive: <AlertTriangle className={`h-4 w-4 ${className || ''}`} />,
    warning: <AlertTriangle className={`h-4 w-4 ${className || ''}`} />,
    success: <CheckCircle className={`h-4 w-4 ${className || ''}`} />,
    info: <Info className={`h-4 w-4 ${className || ''}`} />
  }
  
  return iconMap[variant]
}