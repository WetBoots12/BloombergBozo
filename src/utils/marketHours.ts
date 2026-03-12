import type { MarketStatus } from '../types/market';

export function isMarketOpen(): boolean {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = nyTime.getDay();
  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Weekend
  if (day === 0 || day === 6) return false;

  // Market hours: 9:30 AM - 4:00 PM ET
  return timeInMinutes >= 570 && timeInMinutes < 960;
}

export function getMarketStatus(): MarketStatus {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = nyTime.getDay();
  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  if (day === 0 || day === 6) return 'closed';

  if (timeInMinutes >= 240 && timeInMinutes < 570) return 'pre-market';  // 4AM - 9:30AM
  if (timeInMinutes >= 570 && timeInMinutes < 960) return 'open';          // 9:30AM - 4PM
  if (timeInMinutes >= 960 && timeInMinutes < 1200) return 'after-hours'; // 4PM - 8PM
  return 'closed';
}

export function getMarketStatusText(): string {
  const status = getMarketStatus();
  switch (status) {
    case 'open': return 'MARKET OPEN';
    case 'pre-market': return 'PRE-MARKET';
    case 'after-hours': return 'AFTER HOURS';
    case 'closed': return 'MARKET CLOSED';
  }
}

export function getMarketStatusColor(): string {
  const status = getMarketStatus();
  switch (status) {
    case 'open': return '#00FF41';
    case 'pre-market': return '#FFB300';
    case 'after-hours': return '#FF8C00';
    case 'closed': return '#FF3131';
  }
}
