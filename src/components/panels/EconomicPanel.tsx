import { Panel } from '../layout/Panel';
import { MOCK_ECONOMIC } from '../../services/mockData';
import type { EconomicIndicator } from '../../types/market';

function EcoRow({ indicator }: { indicator: EconomicIndicator }) {
  const isUp = indicator.changeDir === 'up';
  const isDown = indicator.changeDir === 'down';
  const changeColor = isUp ? '#00FF41' : isDown ? '#FF3131' : '#666666';
  const arrow = isUp ? '▲' : isDown ? '▼' : '–';

  return (
    <div className="flex items-center px-3 py-2 border-b border-bbg-border/40 hover:bg-bbg-panel-alt transition-colors text-xs">
      <div className="flex-1 min-w-0">
        <div className="text-bbg-text truncate">{indicator.name}</div>
        <div className="text-bbg-muted mt-0.5">{indicator.period} · {indicator.source}</div>
      </div>
      <div className="w-20 text-right flex-shrink-0">
        <div className="text-bbg-amber font-bold tabular-nums">{indicator.value}</div>
        <div className="tabular-nums" style={{ color: changeColor }}>
          {arrow} {indicator.change}
        </div>
      </div>
    </div>
  );
}

export function EconomicPanel() {
  const indicators = MOCK_ECONOMIC;

  return (
    <Panel
      title="ECONOMIC"
      subtitle="MACRO INDICATORS"
      color="amber"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bbg-border bg-bbg-header-alt flex-shrink-0 text-xs text-bbg-muted">
          <div className="flex-1">INDICATOR</div>
          <div className="w-20 text-right">VALUE / CHG</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-xs text-bbg-muted bg-bbg-panel-alt border-b border-bbg-border">
            ── US MACROECONOMIC DATA
          </div>
          {indicators.map((ind, i) => (
            <EcoRow key={i} indicator={ind} />
          ))}

          {/* Fed Watch */}
          <div className="px-3 py-1.5 text-xs text-bbg-muted bg-bbg-panel-alt border-b border-bbg-border border-t border-bbg-border mt-2">
            ── FED WATCH — RATE EXPECTATIONS
          </div>
          <div className="px-3 py-2 text-xs">
            <div className="flex justify-between text-bbg-muted mb-1">
              <span>NEXT MEETING</span>
              <span className="text-bbg-text">May 1, 2024</span>
            </div>
            <div className="space-y-1">
              {[
                { label: 'NO CHANGE (5.25-5.50%)', prob: 78, color: '#666666' },
                { label: 'CUT -25BPS (5.00-5.25%)', prob: 18, color: '#00FF41' },
                { label: 'HIKE +25BPS (5.50-5.75%)', prob: 4, color: '#FF3131' },
              ].map(({ label, prob, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-bbg-muted">{label}</span>
                    <span className="font-bold tabular-nums" style={{ color }}>{prob}%</span>
                  </div>
                  <div className="h-1.5 bg-bbg-border rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{ width: `${prob}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-bbg-border text-xs text-bbg-muted flex-shrink-0 flex justify-between">
          <span>DATA: BLS, BEA, FED, CENSUS</span>
          <span className="text-bbg-amber">DEMO MODE</span>
        </div>
      </div>
    </Panel>
  );
}
