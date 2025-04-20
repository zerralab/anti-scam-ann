/**
 * 首頁 CSS 樣式
 * 可供下載使用
 */

export const homepageCSS = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Colors matching our friendly protector theme */
  --background: 210 33% 98%;
  --foreground: 210 27% 20%;
  --card: 0 0% 100%;
  --card-foreground: 210 27% 20%;
  --popover: 0 0% 100%;
  --popover-foreground: 210 27% 20%;
  --primary: 216 60% 65%;
  --primary-foreground: 0 0% 100%;
  --secondary: 12 100% 77%;
  --secondary-foreground: 210 27% 20%;
  --muted: 210 33% 95%;
  --muted-foreground: 210 20% 50%;
  --accent: 174 51% 68%;
  --accent-foreground: 210 27% 20%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 216 16% 85%;
  --input: 216 16% 85%;
  --ring: 216 60% 65%;
  --radius: 1rem; /* Increased border radius for softer corners */
  --chart-1: 216 60% 65%; /* Our primary blue */
  --chart-2: 12 100% 77%;  /* Our secondary coral */
  --chart-3: 174 51% 68%;  /* Our tertiary teal */
  --chart-4: 210 33% 98%;  /* Our light background */
  --chart-5: 210 27% 20%;  /* Our dark text */
}

/* Base styles */
body {
  font-family: 'Noto Sans TC', sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  line-height: 1.5;
}

/* Utility classes */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.pt-16 { padding-top: 4rem; }
.pb-16 { padding-bottom: 4rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-16 { margin-bottom: 4rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-12 { margin-top: 3rem; }
.ml-2 { margin-left: 0.5rem; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.mr-4 { margin-right: 1rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-8 { gap: 2rem; }
.gap-12 { gap: 3rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.h-3 { height: 0.75rem; }
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-10 { height: 2.5rem; }
.h-12 { height: 3rem; }
.h-24 { height: 6rem; }
.h-28 { height: 7rem; }
.h-32 { height: 8rem; }
.w-3 { width: 0.75rem; }
.w-4 { width: 1rem; }
.w-5 { width: 1.25rem; }
.w-6 { width: 1.5rem; }
.w-8 { width: 2rem; }
.w-10 { width: 2.5rem; }
.w-12 { width: 3rem; }
.w-16 { width: 4rem; }
.w-20 { width: 5rem; }
.w-24 { width: 6rem; }
.w-32 { width: 8rem; }
.w-full { width: 100%; }
.max-w-xl { max-width: 36rem; }
.max-w-2xl { max-width: 42rem; }
.max-w-3xl { max-width: 48rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-md { max-width: 28rem; }
.max-w-sm { max-width: 24rem; }
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-50 { z-index: 50; }
.-z-10 { z-index: -10; }

/* Flexbox */
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1 1 0%; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.space-y-1 > * + * { margin-top: 0.25rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }

/* Grid */
.grid { display: grid; }
@media (min-width: 768px) { 
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:flex-row { flex-direction: row; }
  .md\:mb-0 { margin-bottom: 0; }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\:flex-row { flex-direction: row; }
  .lg\:mx-0 { margin-left: 0; margin-right: 0; }
}

/* Typography */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-white { color: white; }
.text-primary { color: hsl(var(--primary)); }
.text-secondary { color: hsl(var(--secondary)); }
.text-accent { color: hsl(var(--accent)); }
.text-destructive { color: hsl(var(--destructive)); }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.whitespace-nowrap { white-space: nowrap; }

/* Backgrounds */
.bg-background { background-color: hsl(var(--background)); }
.bg-white { background-color: white; }
.bg-primary { background-color: hsl(var(--primary)); }
.bg-secondary { background-color: hsl(var(--secondary)); }
.bg-accent { background-color: hsl(var(--accent)); }
.bg-muted { background-color: hsl(var(--muted)); }
.bg-primary\/10 { background-color: hsla(var(--primary), 0.1); }
.bg-primary\/20 { background-color: hsla(var(--primary), 0.2); }
.bg-secondary\/10 { background-color: hsla(var(--secondary), 0.1); }
.bg-secondary\/50 { background-color: hsla(var(--secondary), 0.5); }
.bg-accent\/10 { background-color: hsla(var(--accent), 0.1); }
.bg-accent\/20 { background-color: hsla(var(--accent), 0.2); }
.bg-accent\/50 { background-color: hsla(var(--accent), 0.5); }
.bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }
.bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-brand-light { --tw-gradient-from: #F0F5FF; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(240, 245, 255, 0)); }
.from-primary { --tw-gradient-from: hsl(var(--primary)); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, hsla(var(--primary), 0)); }
.to-primary\/80 { --tw-gradient-to: hsla(var(--primary), 0.8); }
.to-background { --tw-gradient-to: hsl(var(--background)); }

/* Borders */
.rounded-full { border-radius: 9999px; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-bl-3xl { border-bottom-left-radius: 1.5rem; }
.rounded-md { border-radius: 0.375rem; }
.border { border-width: 1px; }
.border-t { border-top-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-border { border-color: hsl(var(--border)); }
.border-muted { border-color: hsl(var(--muted)); }
.border-primary\/20 { border-color: hsla(var(--primary), 0.2); }
.border-primary\/30 { border-color: hsla(var(--primary), 0.3); }
.border-secondary\/20 { border-color: hsla(var(--secondary), 0.2); }
.border-accent\/20 { border-color: hsla(var(--accent), 0.2); }

/* Effects */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.blur-xl { filter: blur(24px); }
.blur-md { filter: blur(12px); }
.filter { filter: var(--tw-filter); }
.opacity-40 { opacity: 0.4; }
.opacity-80 { opacity: 0.8; }
.transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-shadow { transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.hover\:opacity-80:hover { opacity: 0.8; }
.hover\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.hover\:bg-white\/90:hover { background-color: rgba(255, 255, 255, 0.9); }
.backdrop-blur-sm { backdrop-filter: blur(4px); }

/* Positioning */
.sticky { position: sticky; }
.fixed { position: fixed; }
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.top-0 { top: 0; }
.right-0 { right: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.-bottom-6 { bottom: -1.5rem; }
.-left-6 { left: -1.5rem; }
.-top-8 { top: -2rem; }
.-right-8 { right: -2rem; }

/* Layout */
.hidden { display: none; }
.overflow-hidden { overflow: hidden; }
.list-decimal { list-style-type: decimal; }
.pl-5 { padding-left: 1.25rem; }
@media (min-width: 768px) {
  .md\:block { display: block; }
}

/* Components */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-weight: 500;
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.btn-primary {
  background-color: hsl(var(--primary));
  color: white;
}
.btn-primary:hover {
  background-color: hsla(var(--primary), 0.9);
}
.btn-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}
.btn-secondary:hover {
  background-color: hsla(var(--secondary), 0.9);
}
.btn-outline {
  background-color: transparent;
  border: 1px solid hsl(var(--input));
}
.btn-outline:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
.btn-white {
  background-color: white;
  color: #4476C5;
  font-weight: bold;
  border: none;
}
.btn-white:hover {
  background-color: rgba(255, 255, 255, 0.9);
}
.btn-lg {
  height: 3rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  font-size: 1rem;
}
.btn-sm {
  height: 2.25rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
}

/* Feature Card */
.feature-card {
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}
.feature-card.primary {
  background-color: hsla(var(--primary), 0.1);
  border-color: hsla(var(--primary), 0.2);
}
.feature-card.secondary {
  background-color: hsla(var(--secondary), 0.1);
  border-color: hsla(var(--secondary), 0.2);
}
.feature-card.tertiary {
  background-color: hsla(var(--accent), 0.1);
  border-color: hsla(var(--accent), 0.2);
}
.icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}
.icon-wrapper.primary {
  background-color: hsl(var(--primary));
  color: white;
}
.icon-wrapper.secondary {
  background-color: hsl(var(--secondary));
  color: white;
}
.icon-wrapper.tertiary {
  background-color: hsl(var(--accent));
  color: white;
}
.feature-card .title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.feature-card .description {
  color: hsl(var(--muted-foreground));
}

/* Animations */
@keyframes pulse-slow {
  0% {
    box-shadow: 0 0 0 0 rgba(68, 118, 197, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(68, 118, 197, 0);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(68, 118, 197, 0);
    transform: scale(1);
  }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom animations from ScrollAnimation component */
.animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.animate.visible {
  opacity: 1;
  transform: translateY(0);
}
.animate.fade-up.visible {
  animation: fadeUp 0.5s ease forwards;
}
.animate.fade-in.visible {
  animation: fadeIn 0.5s ease forwards;
}
.animate.slide-right.visible {
  animation: slideRight 0.5s ease forwards;
}
.animate.slide-left.visible {
  animation: slideLeft 0.5s ease forwards;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
`;
