import { useRef, useEffect } from 'react';
import { useTerminalStore } from '../../store/terminalStore';

export function CommandBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { commandInput, setCommandInput, executeCommand, navigateHistory } = useTerminalStore();

  // Focus input on mount and on key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus command bar on any key press (except modifier keys)
      if (
        document.activeElement !== inputRef.current &&
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        e.key.length === 1
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = navigateHistory('up');
      if (prev) setCommandInput(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = navigateHistory('down');
      setCommandInput(next);
    } else if (e.key === 'Escape') {
      setCommandInput('');
    }
  };

  return (
    <div
      className="w-full flex items-center border-t-2 border-bbg-orange bg-bbg-header-alt flex-shrink-0"
      style={{ height: '36px' }}
    >
      {/* Prompt */}
      <div className="flex items-center gap-1 px-3 border-r border-bbg-border h-full">
        <span className="text-bbg-orange font-bold text-sm">BOZO</span>
        <span className="text-bbg-amber text-sm">{'>'}</span>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={commandInput}
        onChange={(e) => setCommandInput(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        placeholder="TYPE TICKER OR COMMAND (HELP, NEWS, CRYPTO, FX, WLT, ECO)..."
        className="flex-1 h-full bg-transparent border-none outline-none px-3
          text-bbg-amber font-mono text-sm placeholder-bbg-muted/50
          caret-bbg-orange"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Status indicators */}
      <div className="flex items-center gap-3 px-3 border-l border-bbg-border h-full text-xs text-bbg-muted">
        <span className="text-bbg-muted">↑↓ HISTORY</span>
        <span className="text-bbg-muted">ESC CLEAR</span>
        <span className="text-bbg-orange font-bold blink">█</span>
      </div>
    </div>
  );
}
