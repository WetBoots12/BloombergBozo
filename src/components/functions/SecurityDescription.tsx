import { useBloombergFunction } from '../../hooks/useBloombergFunction';
import { Building2, Globe, Users, MapPin, TrendingUp, DollarSign } from 'lucide-react';

interface SecurityDescriptionProps {
  ticker: string;
}

export function SecurityDescription({ ticker }: SecurityDescriptionProps) {
  const { loading, error, data } = useBloombergFunction('DES', ticker);

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

  const profile = data as {
    symbol: string;
    name: string;
    exchange: string;
    currency: string;
    industry: string;
    sector: string;
    description: string;
    marketCap: number;
    peRatio: number;
    weekHigh52: number;
    weekLow52: number;
    logo: string;
    weburl: string;
    employees: number;
    country: string;
  };

  const formatNumber = (num: number, suffix = '') => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T${suffix}`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B${suffix}`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M${suffix}`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K${suffix}`;
    return `$${num.toFixed(2)}${suffix}`;
  };

  return (
    <div className="h-full overflow-y-auto bg-bbg-bg p-4">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4 pb-4 border-b border-bbg-border">
        {profile.logo && (
          <img
            src={profile.logo}
            alt={profile.name}
            className="w-16 h-16 object-contain bg-white rounded p-2"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-bbg-text">{profile.name}</h1>
          <p className="text-bbg-orange font-mono text-sm">{profile.symbol} &lt;EQUITY&gt;</p>
          <p className="text-bbg-muted text-sm">{profile.exchange} • {profile.currency}</p>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Market Cap"
          value={formatNumber(profile.marketCap)}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="P/E Ratio"
          value={profile.peRatio ? profile.peRatio.toFixed(2) : 'N/A'}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="52W High"
          value={formatNumber(profile.weekHigh52)}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="52W Low"
          value={formatNumber(profile.weekLow52)}
        />
      </div>

      {/* Company Info */}
      <div className="space-y-3">
        {/* Sector & Industry */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 text-bbg-muted">
            <Building2 className="w-4 h-4 text-bbg-amber" />
            <span>Sector:</span>
            <span className="text-bbg-text">{profile.sector || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-bbg-muted">
            <Building2 className="w-4 h-4 text-bbg-amber" />
            <span>Industry:</span>
            <span className="text-bbg-text">{profile.industry || 'N/A'}</span>
          </div>
        </div>

        {/* Employees & Country */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 text-bbg-muted">
            <Users className="w-4 h-4 text-bbg-amber" />
            <span>Employees:</span>
            <span className="text-bbg-text">{profile.employees?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-bbg-muted">
            <MapPin className="w-4 h-4 text-bbg-amber" />
            <span>Country:</span>
            <span className="text-bbg-text">{profile.country || 'N/A'}</span>
          </div>
        </div>

        {/* Website */}
        {profile.weburl && profile.weburl !== '#' && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-bbg-amber" />
            <a
              href={profile.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bbg-orange hover:underline"
            >
              {profile.weburl}
            </a>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mt-4">
        <h3 className="text-sm font-bold text-bbg-amber mb-2">BUSINESS SUMMARY</h3>
        <p className="text-sm text-bbg-text leading-relaxed">
          {profile.description || 'No description available.'}
        </p>
      </div>

      {/* API Notice */}
      <div className="mt-4 p-3 bg-bbg-bg-alt border border-bbg-border rounded text-xs text-bbg-muted">
        <p className="text-bbg-amber">
          💡 Tip: Add Finnhub or FMP API key for enhanced company data.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-bbg-bg-alt border border-bbg-border rounded p-3">
      <div className="flex items-center gap-2 text-bbg-muted mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-bbg-text font-mono text-sm">{value}</p>
    </div>
  );
}
