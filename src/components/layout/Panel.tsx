import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  color?: 'orange' | 'green' | 'blue' | 'amber';
}

const COLOR_MAP = {
  orange: { border: 'border-bbg-orange', title: 'text-bbg-orange', bg: 'bg-bbg-orange/10' },
  green: { border: 'border-bbg-green', title: 'text-bbg-green', bg: 'bg-bbg-green/10' },
  blue: { border: 'border-bbg-blue', title: 'text-bbg-blue', bg: 'bg-bbg-blue/10' },
  amber: { border: 'border-bbg-amber', title: 'text-bbg-amber', bg: 'bg-bbg-amber/10' },
};

export function Panel({ title, subtitle, children, className = '', headerRight, color = 'orange' }: PanelProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className={`flex flex-col h-full border ${colors.border} bg-bbg-panel ${className}`}>
      {/* Panel Header */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b ${colors.border} ${colors.bg} flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-sm ${colors.bg} border ${colors.border}`} />
          <span className={`${colors.title} font-bold text-xs tracking-wider uppercase`}>{title}</span>
          {subtitle && (
            <span className="text-bbg-muted text-xs">— {subtitle}</span>
          )}
        </div>
        {headerRight && (
          <div className="flex items-center gap-2">
            {headerRight}
          </div>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
