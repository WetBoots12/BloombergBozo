import { useBloombergFunction } from '../../hooks/useBloombergFunction';
import { TrendingUp, Target, Users, Star } from 'lucide-react';

interface AnalystRatingsProps {
  ticker: string;
}

export function AnalystRatings({ ticker }: AnalystRatingsProps) {
  const { loading, error, data } = useBloombergFunction('ANR', ticker);

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

  const analystData = data as {
    recommendations: Array<{ period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }>;
    priceTarget: { targetHigh: number; targetLow: number; targetMean: number; targetMedian: number } | null;
    consensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  };

  const latestRec = analystData.recommendations?.[0];
  const totalAnalysts = latestRec
    ? latestRec.strongBuy + latestRec.buy + latestRec.hold + latestRec.sell + latestRec.strongSell
    : 0;

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case 'Strong Buy': return 'text-bbg-green';
      case 'Buy': return 'text-bbg-green';
      case 'Hold': return 'text-bbg-amber';
      case 'Sell': return 'text-red-400';
      case 'Strong Sell': return 'text-red-400';
      default: return 'text-bbg-text';
    }
  };

  const formatMoney = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="h-full overflow-y-auto bg-bbg-bg p-4">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-bbg-border">
        <h1 className="text-xl font-bold text-bbg-text flex items-center gap-2">
          <Target className="w-5 h-5 text-bbg-orange" />
          Analyst Ratings
        </h1>
        <p className="text-bbg-muted text-sm">{ticker} &lt;EQUITY&gt;</p>
      </div>

      {/* Consensus Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Consensus Rating */}
        <div className="bg-bbg-bg-alt border border-bbg-border rounded p-4">
          <div className="flex items-center gap-2 text-bbg-muted mb-2">
            <Star className="w-4 h-4" />
            <span className="text-xs">Consensus Rating</span>
          </div>
          <p className={`text-2xl font-bold ${getConsensusColor(analystData.consensus)}`}>
            {analystData.consensus}
          </p>
          <p className="text-xs text-bbg-muted mt-1">{totalAnalysts} analysts</p>
        </div>

        {/* Price Target */}
        <div className="bg-bbg-bg-alt border border-bbg-border rounded p-4">
          <div className="flex items-center gap-2 text-bbg-muted mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">Price Target</span>
          </div>
          {analystData.priceTarget ? (
            <>
              <p className="text-2xl font-bold text-bbg-text">
                {formatMoney(analystData.priceTarget.targetMean)}
              </p>
              <p className="text-xs text-bbg-muted mt-1">
                {formatMoney(analystData.priceTarget.targetLow)} - {formatMoney(analystData.priceTarget.targetHigh)}
              </p>
            </>
          ) : (
            <p className="text-bbg-muted text-sm">No data</p>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      {latestRec && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-bbg-amber mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Rating Distribution ({latestRec.period})
          </h3>
          <div className="space-y-2">
            <RatingBar
              label="Strong Buy"
              count={latestRec.strongBuy}
              total={totalAnalysts}
              color="bg-bbg-green"
            />
            <RatingBar
              label="Buy"
              count={latestRec.buy}
              total={totalAnalysts}
              color="bg-green-600"
            />
            <RatingBar
              label="Hold"
              count={latestRec.hold}
              total={totalAnalysts}
              color="bg-bbg-amber"
            />
            <RatingBar
              label="Sell"
              count={latestRec.sell}
              total={totalAnalysts}
              color="bg-red-600"
            />
            <RatingBar
              label="Strong Sell"
              count={latestRec.strongSell}
              total={totalAnalysts}
              color="bg-red-700"
            />
          </div>
        </div>
      )}

      {/* Historical Recommendations */}
      {analystData.recommendations && analystData.recommendations.length > 1 && (
        <div>
          <h3 className="text-sm font-bold text-bbg-amber mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Historical Trend
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="border-b border-bbg-border">
                <tr>
                  <th className="text-left py-2 px-2 text-bbg-amber">Period</th>
                  <th className="text-center py-2 px-2 text-bbg-green">SB</th>
                  <th className="text-center py-2 px-2 text-bbg-green">B</th>
                  <th className="text-center py-2 px-2 text-bbg-amber">H</th>
                  <th className="text-center py-2 px-2 text-red-400">S</th>
                  <th className="text-center py-2 px-2 text-red-400">SS</th>
                </tr>
              </thead>
              <tbody>
                {analystData.recommendations.slice(0, 6).map((rec) => (
                  <tr key={rec.period} className="border-b border-bbg-border/50">
                    <td className="py-2 px-2 text-bbg-text">{rec.period}</td>
                    <td className="py-2 px-2 text-center text-bbg-green">{rec.strongBuy}</td>
                    <td className="py-2 px-2 text-center text-bbg-green">{rec.buy}</td>
                    <td className="py-2 px-2 text-center text-bbg-amber">{rec.hold}</td>
                    <td className="py-2 px-2 text-center text-red-400">{rec.sell}</td>
                    <td className="py-2 px-2 text-center text-red-400">{rec.strongSell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Notice */}
      {!analystData.priceTarget && analystData.recommendations.length === 0 && (
        <div className="mt-4 p-3 bg-bbg-bg-alt border border-bbg-border rounded text-xs text-bbg-muted">
          <p className="text-bbg-amber">
            💡 Tip: Add Finnhub API key for analyst ratings and price targets.
          </p>
        </div>
      )}
    </div>
  );
}

interface RatingBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function RatingBar({ label, count, total, color }: RatingBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-bbg-muted w-20">{label}</span>
      <div className="flex-1 h-4 bg-bbg-border rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-bbg-text w-8 text-right">{count}</span>
    </div>
  );
}
