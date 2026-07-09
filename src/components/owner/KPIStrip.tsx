import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TrendingUp, TrendingDown, DollarSign, Car } from 'lucide-react';

export default function KPIStrip() {
  const { state } = useAppContext();

  const totalIncome = state.ledger
    .filter((l) => l.type === 'Income')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalInvestments = state.ledger
    .filter((l) => l.type === 'Investment')
    .reduce((sum, l) => sum + l.amount, 0);

  const netProfit = totalIncome - totalInvestments;
  const activeFleet = state.drivers.filter((d) => d.status !== 'Offline').length;
  const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  const stats = [
    {
      title: 'Gross Revenue',
      value: `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp size={20} />,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      trend: '+12.4%',
      trendColor: 'text-emerald-400',
    },
    {
      title: 'Total Investments',
      value: `$${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <TrendingDown size={20} />,
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-400',
      trend: 'Expenses',
      trendColor: 'text-rose-400',
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign size={20} />,
      color:
        netProfit >= 0
          ? 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30'
          : 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
      iconBg: netProfit >= 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400',
      trend: `${margin}% margin`,
      trendColor: netProfit >= 0 ? 'text-indigo-400' : 'text-rose-400',
    },
    {
      title: 'Active Fleet',
      value: `${activeFleet} / ${state.drivers.length}`,
      icon: <Car size={20} />,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      trend: `${state.drivers.filter((d) => d.status === 'OnJob').length} on job`,
      trendColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.title}
          className={`flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-5 transition-all hover:scale-[1.01] ${s.color}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.title}</p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg}`}>
              {s.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{s.value}</p>
          <p className={`text-xs font-medium ${s.trendColor}`}>{s.trend}</p>
        </div>
      ))}
    </div>
  );
}
