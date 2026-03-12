/**
 * FunctionDispatcher
 * Renders the appropriate Bloomberg function component based on activeFunction
 */

import { useTerminalStore } from '../../store/terminalStore';
import { SecurityDescription } from './SecurityDescription';
import { FinancialStatements } from './FinancialStatements';
import { AnalystRatings } from './AnalystRatings';
import { EarningsCalendar } from './EarningsCalendar';

export function FunctionDispatcher() {
  const { activeTicker, activeFunction } = useTerminalStore();

  switch (activeFunction) {
    case 'DES':
      return <SecurityDescription ticker={activeTicker} />;
    
    case 'FA':
      return <FinancialStatements ticker={activeTicker} />;
    
    case 'ANR':
      return <AnalystRatings ticker={activeTicker} />;
    
    case 'E':
      return <EarningsCalendar ticker={activeTicker} />;
    
    case 'GO':
    case 'GP':
    default:
      // Return null to let the default StockQuote panel handle it
      return null;
  }
}
