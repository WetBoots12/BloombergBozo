import { useTerminalStore } from '../../store/terminalStore';
import type { PanelType } from '../../types/market';

interface FnKey {
  key: string;
  label: string;
  action: () => void;
}

export function FunctionBar() {
  const { setTopLeftPanel, setBottomRightPanel, toggleHelp } = useTerminalStore();

  const fnKeys: FnKey[] = [
    { key: 'F1', label: 'HELP', action: toggleHelp },
    { key: 'F2', label: 'MKT', action: () => setTopLeftPanel('market' as PanelType) },
    { key: 'F3', label: 'NEWS', action: () => setBottomRightPanel('news' as PanelType) },
    { key: 'F4', label: 'CRYP', action: () => setBottomRightPanel('crypto' as PanelType) },
    { key: 'F5', label: 'FX', action: () => setBottomRightPanel('forex' as PanelType) },
    { key: 'F6', label: 'WLT', action: () => setBottomRightPanel('watchlist' as PanelType) },
    { key: 'F7', label: 'ECO', action: () => setBottomRightPanel('economic' as PanelType) },
    { key: 'F8', label: 'SEC', action: () => setBottomRightPanel('filings' as PanelType) },
  ];

  return (
    <div
      className="w-full flex border-b border-bbg-border bg-bbg-header-alt flex-shrink-0"
      style={{ height: '28px' }}
    >
      {fnKeys.map(({ key, label, action }) => (
        <button
          key={key}
          onClick={action}
          className="flex items-center gap-1 px-2 h-full border-r border-bbg-border
            hover:bg-bbg-orange/10 hover:text-bbg-orange transition-colors
            text-xs font-mono group"
        >
          <span className="text-bbg-orange font-bold group-hover:text-bbg-amber">{key}</span>
          <span className="text-bbg-text-dim group-hover:text-bbg-text">{label}</span>
        </button>
      ))}
      <div className="flex-1" />
      <div className="flex items-center px-3 text-xs text-bbg-muted border-l border-bbg-border">
        Type ticker + ENTER to look up security &nbsp; | &nbsp; HELP for commands
      </div>
    </div>
  );
}
