import { useState } from 'react';
import { useBloombergFunction } from '../../hooks/useBloombergFunction';
import { BarChart3, DollarSign, Activity } from 'lucide-react';

interface FinancialStatementsProps {
  ticker: string;
}

type StatementType = 'income' | 'balance' | 'cashFlow';

export function FinancialStatements({ ticker }: FinancialStatementsProps) {
  const [activeStatement, setActiveStatement] = useState<StatementType>('income');
  const { loading, error, data } = useBloombergFunction('FA', ticker);

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

  const financialData = data as {
    income: Array<{ date: string; revenue: number; grossProfit: number; operatingIncome: number; netIncome: number; eps: number }>;
    balance: Array<{ date: string; totalAssets: number; totalLiabilities: number; totalEquity: number; totalDebt: number; cash: number }>;
    cashFlow: Array<{ date: string; operatingCashFlow: number; freeCashFlow: number; capitalExpenditure: number }>;
  };

  const formatMoney = (value: number) => {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
  };

  const statements: Record<StatementType, {
    icon: React.ReactNode;
    label: string;
    columns: Array<{ key: string; label: string; format?: (v: number) => string }>;
    data: unknown[];
  }> = {
    income: {
      icon: <BarChart3 className="w-4 h-4" />,
      label: 'Income Statement',
      columns: [
        { key: 'date', label: 'Period' },
        { key: 'revenue', label: 'Revenue', format: formatMoney },
        { key: 'grossProfit', label: 'Gross Profit', format: formatMoney },
        { key: 'operatingIncome', label: 'Operating Income', format: formatMoney },
        { key: 'netIncome', label: 'Net Income', format: formatMoney },
        { key: 'eps', label: 'EPS', format: (v) => `$${v.toFixed(2)}` },
      ],
      data: financialData.income || [],
    },
    balance: {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Balance Sheet',
      columns: [
        { key: 'date', label: 'Period' },
        { key: 'totalAssets', label: 'Total Assets', format: formatMoney },
        { key: 'totalLiabilities', label: 'Total Liabilities', format: formatMoney },
        { key: 'totalEquity', label: 'Total Equity', format: formatMoney },
        { key: 'totalDebt', label: 'Total Debt', format: formatMoney },
        { key: 'cash', label: 'Cash & Equiv.', format: formatMoney },
      ],
      data: financialData.balance || [],
    },
    cashFlow: {
      icon: <Activity className="w-4 h-4" />,
      label: 'Cash Flow',
      columns: [
        { key: 'date', label: 'Period' },
        { key: 'operatingCashFlow', label: 'Operating CF', format: formatMoney },
        { key: 'freeCashFlow', label: 'Free Cash Flow', format: formatMoney },
        { key: 'capitalExpenditure', label: 'CapEx', format: formatMoney },
      ],
      data: financialData.cashFlow || [],
    },
  };

  const currentStatement = statements[activeStatement];
  const hasData = currentStatement.data && currentStatement.data.length > 0;

  return (
    <div className="h-full flex flex-col bg-bbg-bg">
      {/* Tabs */}
      <div className="flex border-b border-bbg-border bg-bbg-header-alt flex-shrink-0">
        {(Object.keys(statements) as StatementType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveStatement(type)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-r border-bbg-border ${
              activeStatement === type
                ? 'bg-bbg-orange/20 text-bbg-orange border-b-2 border-b-bbg-orange'
                : 'text-bbg-muted hover:text-bbg-text hover:bg-bbg-border/50'
            }`}
          >
            {statements[type].icon}
            {statements[type].label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-bbg-muted">
            <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No financial data available</p>
            <p className="text-xs mt-1">Add FMP API key for fundamental data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-bbg-border">
                  {currentStatement.columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-2 px-3 text-bbg-amber font-bold whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(currentStatement.data as Record<string, unknown>[]).map((row, idx) => (
                  <tr
                    key={(row.date as string) || idx}
                    className={`border-b border-bbg-border/50 hover:bg-bbg-border/20 ${
                      idx % 2 === 0 ? 'bg-bbg-bg' : 'bg-bbg-bg-alt'
                    }`}
                  >
                    {currentStatement.columns.map((col) => (
                      <td key={col.key} className="py-2 px-3 text-bbg-text whitespace-nowrap">
                        {col.key === 'date'
                          ? formatDate(row.date as string)
                          : col.format
                            ? col.format(row[col.key] as number)
                            : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-bbg-border p-2 bg-bbg-header-alt text-xs text-bbg-muted flex-shrink-0">
        <span className="text-bbg-amber">FA</span> - Financial Statements. All values in USD.
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
