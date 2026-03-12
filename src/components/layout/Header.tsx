import { useState, useEffect } from 'react';
import { TickerTape } from '../shared/TickerTape';
import { getMarketStatusText, getMarketStatusColor } from '../../utils/marketHours';

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/New_York',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    }).toUpperCase();
  };

  const statusText = getMarketStatusText();
  const statusColor = getMarketStatusColor();

  return (
    <header className="w-full bg-bbg-header border-b-2 border-bbg-orange flex-shrink-0" style={{ height: '48px' }}>
      <div className="h-full flex items-stretch">
        {/* Logo */}
        <div className="flex items-center px-3 border-r border-bbg-border bg-bbg-header-alt flex-shrink-0">
          <div className="flex flex-col leading-none">
            <span className="text-bbg-orange font-bold text-sm tracking-widest">BLOOMBERG</span>
            <span className="text-bbg-amber text-xs tracking-widest">BOZO</span>
          </div>
        </div>

        {/* Ticker Tape */}
        <div className="flex-1 overflow-hidden border-r border-bbg-border">
          <TickerTape />
        </div>

        {/* Market Status + Time */}
        <div className="flex items-center gap-3 px-3 border-l border-bbg-border flex-shrink-0 bg-bbg-header-alt">
          {/* Market Status */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: statusColor,
                boxShadow: `0 0 6px ${statusColor}`,
              }}
            />
            <span className="text-xs font-bold" style={{ color: statusColor }}>
              {statusText}
            </span>
          </div>

          <div className="border-l border-bbg-border pl-3 text-right">
            <div className="text-bbg-amber font-bold text-sm tabular-nums leading-none">
              {formatTime(time)} ET
            </div>
            <div className="text-bbg-muted text-xs leading-none mt-0.5">
              {formatDate(time)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
