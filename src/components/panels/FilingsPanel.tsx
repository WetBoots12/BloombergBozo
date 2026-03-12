import { useState } from 'react';
import { Panel } from '../layout/Panel';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useEdgarDescription, useCompanyFilings } from '../../hooks/useEdgar';
import { useTerminalStore } from '../../store/terminalStore';
import type { SECFiling } from '../../types/market';

type FilingsTab = 'des' | 'filings' | 'own';

const FORM_FILTERS = [
  { label: 'ALL', forms: undefined },
  { label: '10-K', forms: ['10-K'] },
  { label: '10-Q', forms: ['10-Q'] },
  { label: '8-K', forms: ['8-K'] },
  { label: 'S-1', forms: ['S-1'] },
];

function FilingRow({ filing }: { filing: SECFiling }) {
  const formColor = filing.form.includes('10-K') ? 'text-bbg-amber' :
    filing.form.includes('10-Q') ? 'text-bbg-green' :
    filing.form.includes('8-K') ? 'text-bbg-blue' : 'text-bbg-text';

  return (
    <a
      href={filing.filingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center px-3 py-1.5 border-b border-bbg-border/40 hover:bg-bbg-panel-alt transition-colors text-xs group"
    >
      <span className={`w-14 ${formColor} font-bold flex-shrink-0`}>{filing.form}</span>
      <span className="w-24 text-bbg-muted flex-shrink-0 tabular-nums">{filing.filingDate}</span>
      <span className="flex-1 text-bbg-text truncate group-hover:text-bbg-amber">
        {filing.primaryDocDescription || filing.form}
      </span>
      <span className="text-bbg-muted flex-shrink-0 ml-2">↗</span>
    </a>
  );
}

export function FilingsPanel() {
  const activeTicker = useTerminalStore(s => s.activeTicker);
  const [tab, setTab] = useState<FilingsTab>('des');
  const [formFilter, setFormFilter] = useState<string[] | undefined>(undefined);

  const { data: description, isLoading: descLoading } = useEdgarDescription(activeTicker);
  const { data: filings, isLoading: filingsLoading } = useCompanyFilings(activeTicker, formFilter);

  return (
    <Panel
      title={`${activeTicker} SEC`}
      subtitle="EDGAR FILINGS"
      color="amber"
      headerRight={
        <div className="flex items-center gap-1">
          {(['des', 'filings', 'own'] as FilingsTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                tab === t
                  ? 'bg-bbg-amber text-bbg-black font-bold'
                  : 'text-bbg-muted hover:text-bbg-amber hover:bg-bbg-amber/10'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden">
        {tab === 'des' && (
          <div className="flex-1 overflow-y-auto">
            {descLoading ? (
              <div className="p-3 space-y-2">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} height="14px" />)}
              </div>
            ) : description ? (
              <div className="p-3 space-y-3 text-xs">
                <div className="text-bbg-amber font-bold text-sm">{description.name}</div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-bbg-muted">CIK: </span>
                    <span className="text-bbg-text tabular-nums">{description.cik}</span>
                  </div>
                  <div>
                    <span className="text-bbg-muted">SIC: </span>
                    <span className="text-bbg-text">{description.sic}</span>
                  </div>
                  <div>
                    <span className="text-bbg-muted">INDUSTRY: </span>
                    <span className="text-bbg-text">{description.sicDescription}</span>
                  </div>
                  <div>
                    <span className="text-bbg-muted">STATE: </span>
                    <span className="text-bbg-text">{description.stateOfIncorporation}</span>
                  </div>
                  <div>
                    <span className="text-bbg-muted">FISCAL YR: </span>
                    <span className="text-bbg-text">{description.fiscalYearEnd}</span>
                  </div>
                </div>

                {description.addresses.business && (
                  <div>
                    <div className="text-bbg-muted mb-0.5">BUSINESS ADDRESS</div>
                    <div className="text-bbg-text">{description.addresses.business}</div>
                  </div>
                )}

                {/* Recent key filings */}
                <div>
                  <div className="text-bbg-orange font-bold mb-1 border-t border-bbg-border pt-2">RECENT FILINGS</div>
                  {description.filings.slice(0, 8).map((f, i) => (
                    <FilingRow key={i} filing={f} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-bbg-muted text-xs">
                NO SEC DATA FOUND FOR {activeTicker}
              </div>
            )}
          </div>
        )}

        {tab === 'filings' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Form filter buttons */}
            <div className="flex gap-1 px-3 py-1.5 border-b border-bbg-border flex-shrink-0">
              {FORM_FILTERS.map(f => (
                <button
                  key={f.label}
                  onClick={() => setFormFilter(f.forms)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    JSON.stringify(formFilter) === JSON.stringify(f.forms)
                      ? 'bg-bbg-amber text-bbg-black font-bold'
                      : 'text-bbg-muted hover:text-bbg-amber'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Column header */}
            <div className="flex items-center px-3 py-1 border-b border-bbg-border text-xs text-bbg-muted flex-shrink-0">
              <span className="w-14">FORM</span>
              <span className="w-24">DATE</span>
              <span className="flex-1">DESCRIPTION</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filingsLoading ? (
                <div className="p-3 space-y-2">
                  {Array(8).fill(0).map((_, i) => <Skeleton key={i} height="14px" />)}
                </div>
              ) : filings?.length ? (
                filings.map((f, i) => <FilingRow key={i} filing={f} />)
              ) : (
                <div className="flex items-center justify-center h-32 text-bbg-muted text-xs">
                  NO FILINGS FOUND
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'own' && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-bbg-muted border-b border-bbg-border">
              INSIDER TRANSACTIONS (FORM 4)
            </div>
            <div className="flex items-center justify-center h-32 text-xs text-bbg-muted">
              <div className="text-center">
                <div className="text-bbg-amber mb-1">FORM 4 DATA</div>
                <div>Insider trade details require XML parsing.</div>
                <div>View raw filings in the FILINGS tab.</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-3 py-1 border-t border-bbg-border text-xs text-bbg-muted flex-shrink-0 flex justify-between">
          <span>SOURCE: SEC EDGAR (data.sec.gov)</span>
          <span className="text-bbg-green">FREE API</span>
        </div>
      </div>
    </Panel>
  );
}
