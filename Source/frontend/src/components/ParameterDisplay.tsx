import * as React from "react"

interface ParameterItem {
  label: string;
  value: string | number;
  description?: string;
}

interface ParameterDisplayProps {
  title: string;
  items: ParameterItem[];
  className?: string;
}

export function ParameterDisplay({ title, items, className }: ParameterDisplayProps) {
  return (
    <div className={`p-3 bg-white rounded-md shadow-sm ${className || ''}`}>
      <h3 className="text-sm font-semibold text-blue-600 mb-3">{title}</h3>
      <dl className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-[120px_1fr]">
            <dt className="font-medium text-sm text-gray-700">{item.label}:</dt>
            <dd className="text-sm">
              {item.value}
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}