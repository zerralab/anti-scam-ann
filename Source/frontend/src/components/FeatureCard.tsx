import React from 'react';

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  className?: string;
}

export function FeatureCard({ 
  title, 
  description, 
  icon,
  variant = 'primary',
  className = ''
}: Props) {
  const variantStyles = {
    primary: 'bg-primary/10 border-primary/20',
    secondary: 'bg-secondary/10 border-secondary/20',
    tertiary: 'bg-accent/10 border-accent/20'
  };

  const iconStyles = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    tertiary: 'bg-accent text-white'
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-md ${variantStyles[variant]} ${className}`}>
      <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${iconStyles[variant]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
