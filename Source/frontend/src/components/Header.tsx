import React from 'react';
import { Button } from 'components/Button';

export function Header() {
  const handleScrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <header className="py-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={handleScrollToTop}
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-2">
            安
          </div>
          <div className="flex items-center">
            <h1 className="text-xl font-bold">防詐小安</h1>
            <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-medium">Beta</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-foreground hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            功能特點
          </button>
          <button 
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-foreground hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            使用方法
          </button>
          <button 
            onClick={() => document.getElementById('scam-types')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-foreground hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            常見詐騙
          </button>
        </nav>
        
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => document.getElementById('line-integration')?.scrollIntoView({ behavior: 'smooth' })}
        >
          立即加入
        </Button>
      </div>
    </header>
  );
}
