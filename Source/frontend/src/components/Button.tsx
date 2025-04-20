import React from 'react';

interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  onClick, 
  ...props 
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeStyles = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-10 px-6 py-2',
    lg: 'h-12 px-8 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
