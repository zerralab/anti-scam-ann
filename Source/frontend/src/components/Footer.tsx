import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
            &copy; {currentYear} All Right Reserved
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <a href="/Terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              使用條款
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
