import * as React from "react"

interface StatsCardProps {
  title: string;
  value: string | number;
  subvalue?: string | number;
  status?: "default" | "success" | "warning" | "error";
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subvalue, 
  status = "default",
  icon,
  className 
}: StatsCardProps) {
  const statusStyles = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-orange-50 text-orange-600",
    error: "bg-red-50 text-red-600"
  }

  return (
    <div className={`rounded-lg p-4 ${statusStyles[status]} ${className || ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold mt-1">
            {value}
          </p>
          {subvalue && (
            <p className="text-xs opacity-70 mt-1">{subvalue}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-full p-2 bg-white/40">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}