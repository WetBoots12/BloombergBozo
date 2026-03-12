import { formatChange, formatPercent } from '../../utils/formatters';

interface PriceChangeProps {
  change: number;
  changePercent: number;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceChange({ change, changePercent, showArrow = true, size = 'md', className = '' }: PriceChangeProps) {
  const isPositive = change >= 0;
  const color = isPositive ? 'text-bbg-green' : 'text-bbg-red';
  const arrow = showArrow ? (isPositive ? '▲' : '▼') : '';

  const sizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <span className={`${color} ${sizeClass} font-mono tabular-nums ${className}`}>
      {arrow} {formatChange(change)} ({formatPercent(changePercent)})
    </span>
  );
}

interface PriceBadgeProps {
  value: number;
  change: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceBadge({ change, size = 'md' }: PriceBadgeProps) {
  const isPositive = change >= 0;
  const bgColor = isPositive ? 'bg-bbg-green/10 border-bbg-green/30' : 'bg-bbg-red/10 border-bbg-red/30';
  const textColor = isPositive ? 'text-bbg-green' : 'text-bbg-red';
  const sizeClass = size === 'sm' ? 'text-xs px-1 py-0.5' : 'text-sm px-2 py-1';

  return (
    <span className={`${bgColor} ${textColor} ${sizeClass} border rounded font-mono tabular-nums`}>
      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
    </span>
  );
}
