import React from 'react';
import { useAppContext, LedgerEntry } from '../../context/AppContext';
import { Landmark, TrendingUp, ArrowDownRight, ArrowUpRight, Percent } from 'lucide-react';

export default function PandLSummary() {
  const { state } = useAppContext();

  // 1. Calculate Revenue (Incomes)
  const revenueEntries = state.ledger.filter((l) => l.type === 'Income');
  const totalRevenue = revenueEntries.reduce((sum, l) => sum + l.amount, 0);

  // 2. Calculate Expenses by category
  const expenseEntries = state.ledger.filter((l) => l.type === 'Investment');
  const totalExpenses = expenseEntries.reduce((sum, l) => sum + l.amount, 0);

  const categories: LedgerEntry['category'][] = ['Fuel', 'Tires', 'Maintenance', 'Tech Fees', 'Marketing', 'Other'];
  
  const expenseBreakdown = categories.map((cat) => {
    const amt = expenseEntries.filter((l) => l.category === cat).reduce((s, l) => s + l.amount, 0);
    const percentage = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
    return { category: cat, amount: amt, percentage };
  });

  // 3. Profit / Loss calculations
  const netProfit = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-slate-800/50 p-5">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Landmark size={18} className="text-indigo-400" />
          <h3 className="font-bold text-white text-base">Profit & Loss (P&L) Statement</h3>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Q2 Operations</span>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gross Revenue */}
        <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenues</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-400">
              <ArrowUpRight size={12} />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-1">100% of transport intake</p>
        </div>

        {/* Operating Expenses */}
        <div className="rounded-xl bg-slate-900/60 p-4 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operating Costs</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/25 text-rose-400">
              <ArrowDownRight size={12} />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-rose-400">${totalExpenses.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Direct fleet investments</p>
        </div>
      </div>

      {/* Net profit sheet row */}
      <div className={`rounded-xl border p-4 flex items-center justify-between ${
        netProfit >= 0 
          ? 'border-emerald-500/20 bg-emerald-500/5 text-white' 
          : 'border-rose-500/20 bg-rose-500/5 text-white'
      }`}>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Operating Income</h4>
          <p className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-end gap-1">
            <Percent size={10} />
            Profit Margin
          </span>
          <p className={`text-lg font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Expense Categories Bar Chart */}
      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Expense Allocation Breakdown</p>
        
        <div className="flex flex-col gap-2 rounded-xl bg-slate-900/40 p-4 border border-white/5">
          {expenseBreakdown.map((item) => (
            <div key={item.category} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">{item.category}</span>
                <span className="font-bold text-white">
                  ${item.amount.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">({item.percentage.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.category === 'Fuel' ? 'bg-amber-500' :
                    item.category === 'Tires' ? 'bg-indigo-500' :
                    item.category === 'Maintenance' ? 'bg-rose-500' :
                    item.category === 'Tech Fees' ? 'bg-blue-500' :
                    item.category === 'Marketing' ? 'bg-purple-500' : 'bg-slate-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
          {totalExpenses === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
