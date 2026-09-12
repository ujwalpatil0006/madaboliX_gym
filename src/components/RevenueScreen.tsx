import React, { useState } from 'react';
import {
  TrendingUp,
  Building2,
  BarChart3,
  CalendarRange,
  Share2,
} from 'lucide-react';

interface RevenueScreenProps {
  onOpenExecutiveSnapshot: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const CURRENT_MONTH_INDEX = 9;
const YEARS = ['2023', '2024', '2025'];
const CURRENT_YEAR = '2025';

const BRANCHES = [
  { name: 'Jatra Hotel', color: '#0284c7' },
  { name: 'Adgaon', color: '#38bdf8' },
];

const BRANCH_DATA: Record<string, { monthly: number[]; yearly: Record<string, number> }> = {
  'Jatra Hotel': {
    monthly: [71800, 75600, 74900, 81200, 84500, 88400, 86200, 90600, 93400, 94500],
    yearly: { '2023': 748000, '2024': 833000, '2025': 841100 },
  },
  Adgaon: {
    monthly: [47600, 50800, 49700, 54300, 56900, 60100, 58600, 62400, 63900, 64800],
    yearly: { '2023': 501000, '2024': 559000, '2025': 569100 },
  },
};

const TOTAL_MONTHLY: number[] = BRANCH_DATA['Jatra Hotel'].monthly.map(
  (v, i) => v + BRANCH_DATA['Adgaon'].monthly[i]
);
const TOTAL_YEARLY: Record<string, number> = {
  '2023': BRANCH_DATA['Jatra Hotel'].yearly['2023'] + BRANCH_DATA['Adgaon'].yearly['2023'],
  '2024': BRANCH_DATA['Jatra Hotel'].yearly['2024'] + BRANCH_DATA['Adgaon'].yearly['2024'],
  '2025': BRANCH_DATA['Jatra Hotel'].yearly['2025'] + BRANCH_DATA['Adgaon'].yearly['2025'],
};

const formatShort = (value: number) =>
  value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${(value / 1000).toFixed(0)}k`;

const pctChange = (current: number, previous: number) =>
  previous > 0 ? ((current - previous) / previous) * 100 : 0;

export const RevenueScreen: React.FC<RevenueScreenProps> = ({ onOpenExecutiveSnapshot }) => {
  const [chartMode, setChartMode] = useState<'Monthly' | 'Yearly'>('Monthly');

  const branchThisMonth = BRANCHES.map(
    (b) => BRANCH_DATA[b.name].monthly[CURRENT_MONTH_INDEX]
  );
  const branchLastMonth = BRANCHES.map(
    (b) => BRANCH_DATA[b.name].monthly[CURRENT_MONTH_INDEX - 1]
  );
  const branchThisYear = BRANCHES.map((b) => BRANCH_DATA[b.name].yearly[CURRENT_YEAR]);
  const branchLastYear = BRANCHES.map(
    (b) => BRANCH_DATA[b.name].yearly[String(Number(CURRENT_YEAR) - 1)]
  );

  const portfolioThisMonth = branchThisMonth.reduce((a, b) => a + b, 0);
  const portfolioLastMonth = branchLastMonth.reduce((a, b) => a + b, 0);
  const portfolioThisYear = branchThisYear.reduce((a, b) => a + b, 0);
  const portfolioLastYear = branchLastYear.reduce((a, b) => a + b, 0);

  const chartLabels = chartMode === 'Monthly' ? MONTHS : YEARS;
  const chartSeries = chartMode === 'Monthly' ? TOTAL_MONTHLY : YEARS.map((y) => TOTAL_YEARLY[y]);
  const chartMax = Math.max(...chartSeries);
  const chartPeak = Math.max(...chartSeries);

  const kpiCards = [
    { label: 'THIS MONTH', value: portfolioThisMonth, sub: `+${pctChange(portfolioThisMonth, portfolioLastMonth).toFixed(1)}% vs last month` },
    { label: 'THIS YEAR', value: portfolioThisYear, sub: `+${pctChange(portfolioThisYear, portfolioLastYear).toFixed(1)}% vs last year` },
    { label: 'LAST MONTH', value: portfolioLastMonth, sub: 'Oct 2025 → Sep 2025' },
    { label: 'LAST YEAR', value: portfolioLastYear, sub: '2025 → 2024 (YTD)' },
  ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            REVENUE INSIGHTS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tracking-tight mt-0.5">
            Revenue Console
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenExecutiveSnapshot}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#e2e8f0] text-[11px] font-mono font-semibold text-[#006194] hover:border-[#0284c7] transition-all shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5 text-[#0284c7]" />
          Daily Snapshot
        </button>
      </div>

      {/* Portfolio KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#bae6fd] transition-all"
          >
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748b] uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-[#0284c7]" />
              {card.label}
            </span>
            <div className="mt-1.5 text-xl font-bold font-mono text-[#0b1c30]">
              ₹{card.value.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-600 mt-0.5 font-semibold">
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Branch Breakdown Cards */}
      {BRANCHES.map((branch, idx) => {
        const monthly = BRANCH_DATA[branch.name].monthly;
        const yearly = BRANCH_DATA[branch.name].yearly;
        const thisMonth = monthly[CURRENT_MONTH_INDEX];
        const lastMonth = monthly[CURRENT_MONTH_INDEX - 1];
        const thisYear = yearly[CURRENT_YEAR];
        const lastYear = yearly[String(Number(CURRENT_YEAR) - 1)];
        const monthDelta = pctChange(thisMonth, lastMonth);
        const yearDelta = pctChange(thisYear, lastYear);

        return (
          <div key={branch.name} className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#bae6fd] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white border"
                  style={{ backgroundColor: branch.color, borderColor: branch.color }}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-[#0b1c30]">
                    {branch.name}
                  </h3>
                  <p className="text-[10px] font-mono text-[#64748b]">
                    {branch.name === 'Jatra Hotel' ? 'Flagship Facility' : 'Growth Facility'}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#006194] text-[10px] font-mono font-bold border border-[#bae6fd]">
                {idx === 0 ? 'L1 LEADER' : 'L2 STEADY'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">This Month</span>
                <div className="text-base font-bold font-mono text-[#0b1c30] mt-0.5">
                  ₹{thisMonth.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 font-semibold">
                  {monthDelta >= 0 ? '+' : ''}{monthDelta.toFixed(1)}% MoM
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Last Month</span>
                <div className="text-base font-bold font-mono text-[#0b1c30] mt-0.5">
                  ₹{lastMonth.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-slate-400">Prior month</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">This Year</span>
                <div className="text-base font-bold font-mono text-[#0b1c30] mt-0.5">
                  ₹{thisYear.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 font-semibold">
                  {yearDelta >= 0 ? '+' : ''}{yearDelta.toFixed(1)}% YoY
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f8faff] border border-slate-200">
                <span className="text-[9px] font-mono uppercase text-slate-400 block">Last Year</span>
                <div className="text-base font-bold font-mono text-[#0b1c30] mt-0.5">
                  ₹{lastYear.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-slate-400">Prior year</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Income Trend Bar Chart */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
            <BarChart3 className="w-3.5 h-3.5" />
            INCOME TREND
          </div>

          <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded-full">
            {(['Monthly', 'Yearly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setChartMode(mode)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-semibold transition-all ${
                  chartMode === mode
                    ? 'bg-[#0284c7] text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="flex h-44">
          <div className="relative flex-1">
            {/* Gridlines */}
            {[100, 75, 50, 25, 0].map((p) => (
              <div
                key={p}
                className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                style={{ bottom: `${p}%` }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around gap-1">
              {chartSeries.map((value, i) => (
                <div
                  key={chartMode + i}
                  className="relative flex-1 max-w-9 h-full flex flex-col items-center justify-end group"
                >
                  <div className="mb-1 text-[8px] font-mono font-semibold text-slate-400 group-hover:text-[#006194] transition-colors">
                    {formatShort(value)}
                  </div>
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${Math.max((value / chartMax) * 92, 3)}%`,
                      backgroundColor:
                        i === chartSeries.length - 1 ? '#0284c7' : '#7dd3fc',
                      boxShadow: i === chartSeries.length - 1 ? '0 4px 12px -2px rgba(2,132,199,0.4)' : 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between gap-1.5 text-[9px] font-mono text-slate-400">
          {chartLabels.map((label, i) => (
            <span
              key={label}
              className={`flex-1 text-center ${
                i === chartLabels.length - 1 ? 'font-bold text-[#006194]' : ''
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarRange className="w-3 h-3" />
            {chartMode === 'Monthly' ? 'Jan – Oct 2025' : '2023 – 2025'}
          </span>
          <span className="text-[#006194] font-semibold">
            Peak {formatShort(chartPeak)} • All branches
          </span>
        </div>
      </div>
    </div>
  );
};