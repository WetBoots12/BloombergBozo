import { useBloombergFunction } from '../../hooks/useBloombergFunction';
import { Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface EarningsCalendarProps {
  ticker: string;
}

export function EarningsCalendar({ ticker }: EarningsCalendarProps) {
  const { loading, error, data } = useBloombergFunction('E', ticker);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-bbg-orange text-sm animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-400 text-sm">ERROR: {error || 'No data available'}</div>
      </div>
    );
  }

  const earningsData = data as {
    earnings: Array<{ period: string; actual: number; estimate: number; surprise: number; surprisePercent: number }>;
    upcoming: Array<{ date: string; time: string; epsEstimate: number }>;
  };

  const hasEarnings = earningsData.earnings && earningsData.earnings.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-bbg-bg p-4">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-bbg-border">
        <h1 className="text-xl font-bold text-bbg-text flex items-center gap-2">
          <Calendar className="w-5 h-5 text-bbg-orange" />
          Earnings Data
        </h1>
        <p className="text-bbg-muted text-sm">{ticker} &lt;EQUITY&gt;</p>
      </div>

      {/* Upcoming Earnings */}
      {earningsData.upcoming && earningsData.upcoming.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-bbg-amber mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming Earnings
          </h3>
          <div className="bg-bbg-bg-alt border border-bbg-border rounded p-3">
            {earningsData.upcoming.map((earn, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-bbg-text font-mono text-sm">{earn.date}</p>
                  <p className="text-xs text-bbg-muted">{earn.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-bbg-muted">EPS Estimate</p>
                  <p className="text-bbg-text font-mono">${earn.epsEstimate.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Earnings */}
      {hasEarnings ? (
        <div>
          <h3 className="text-sm font-bold text-bbg-amber mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Historical Earnings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="border-b border-bbg-border">
                <tr>
                  <th className="text-left py-2 px-2 text-bbg-amber">Period</th>
                  <th className="text-right py-2 px-2 text-bbg-amber">Estimate</th>
                  <th className="text-right py-2 px-2 text-bbg-amber">Actual</th>
                  <th className="text-right py-2 px-2 text-bbg-amber">Surprise</th>
                  <th className="text-right py-2 px-2 text-bbg-amber"> Surprise %</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.earnings.map((earn, idx) => {
                  const surpriseColor = earn.surprisePercent >= 0 ? 'text-bbg-green' : 'text-red-400';
                  const bgClass = idx % 2 === 0 ? 'bg-bbg-bg' : 'bg-bbg-bg-alt';

                  return (
                    <tr key={earn.period} className={`border-b border-bbg-border/50 ${bgClass}`}>
                      <td className="py-2 px-2 text-bbg-text">{earn.period}</td>
                      <td className="py-2 px-2 text-right text-bbg-text">
                        ${earn.estimate.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-bbg-text">
                        ${earn.actual?.toFixed(2) || 'N/A'}
                      </td>
                      <td className={`py-2 px-2 text-right ${surpriseColor}`}>
                        {earn.actual !== undefined
                          ? `$${earn.surprise.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className={`py-2 px-2 text-right ${surpriseColor}`}>
                        {earn.actual !== undefined
                          ? `${earn.surprisePercent >= 0 ? '+' : ''}${earn.surprisePercent.toFixed(1)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-bbg-muted">
          <DollarSign className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">No earnings data available</p>
          <p className="text-xs mt-1">Add Finnhub API key for earnings data</p>
        </div>
      )}

      {/* Earnings Summary Stats */}
      {hasEarnings && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-bbg-bg-alt border border-bbg-border rounded p-3">
            <p className="text-xs text-bbg-muted mb-1">Beat Rate</p>
            <p className="text-lg font-bold text-bbg-green">
              {calculateBeatRate(earningsData.earnings)}%
            </p>
          </div>
          <div className="bg-bbg-bg-alt border border-bbg-border rounded p-3">
            <p className="text-xs text-bbg-muted mb-1">Avg Surprise</p>
            <p className={`text-lg font-bold ${getAvgSurpriseColor(earningsData.earnings)}`}>
              {calculateAvgSurprise(earningsData.earnings)}%
            </p>
          </div>
          <div className="bg-bbg-bg-alt border border-bbg-border rounded p-3">
            <p className="text-xs text-bbg-muted mb-1">Reports</p>
            <p className="text-lg font-bold text-bbg-text">
              {earningsData.earnings.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateBeatRate(earnings: Array<{ actual?: number; estimate: number }>): number {
  const beats = earnings.filter(e => e.actual !== undefined && e.actual > e.estimate).length;
  const withActuals = earnings.filter(e => e.actual !== undefined).length;
  return withActuals > 0 ? Math.round((beats / withActuals) * 100) : 0;
}

function calculateAvgSurprise(earnings: Array<{ surprisePercent?: number }>): number {
  const withSurprise = earnings.filter(e => e.surprisePercent !== undefined);
  if (withSurprise.length === 0) return 0;
  const sum = withSurprise.reduce((acc, e) => acc + (e.surprisePercent || 0), 0);
  return Math.round((sum / withSurprise.length) * 10) / 10;
}

function getAvgSurpriseColor(earnings: Array<{ surprisePercent?: number }>): string {
  const avg = calculateAvgSurprise(earnings);
  if (avg >= 5) return 'text-bbg-green';
  if (avg >= 0) return 'text-green-600';
  if (avg >= -5) return 'text-red-600';
  return 'text-red-400';
}
