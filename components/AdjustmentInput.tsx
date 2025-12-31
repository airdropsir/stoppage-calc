import React from 'react';
import { MonthRecord, AppSettings } from '../types';
import { calculateRow, formatRial } from '../utils/calculations';
import { TrendingUp, Coins, Percent } from 'lucide-react';

interface Props {
  data: MonthRecord[];
  settings: AppSettings;
  onChange: (id: number, field: keyof MonthRecord, value: number) => void;
}

export const AdjustmentInput: React.FC<Props> = ({ data, settings, onChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 min-w-[100px]">ماه</th>
                <th className="px-4 py-3 min-w-[120px]">مبلغ پایه (ریال)</th>
                <th className="px-4 py-3 text-center bg-indigo-50 text-indigo-800">شاخص صنعت (درصد)</th>
                <th className="px-4 py-3 text-center bg-rose-50 text-rose-800">شاخص دستمزد (درصد)</th>
                <th className="px-4 py-3 min-w-[140px]">تعدیل صنعت</th>
                <th className="px-4 py-3 min-w-[140px]">تعدیل دستمزد</th>
                <th className="px-4 py-3 min-w-[140px] font-bold">مجموع تعدیل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => {
                const calc = calculateRow(row, settings);
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{formatRial(calc.baseRialAmount)}</td>
                    
                    {/* Industry Index Input */}
                    <td className="p-2 bg-indigo-50/30">
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full p-2 pl-6 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-indigo-900"
                          value={row.industryIndex || ''} 
                          onChange={(e) => onChange(row.id, 'industryIndex', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                        <Percent size={14} className="absolute left-2 top-3 text-indigo-400" />
                      </div>
                    </td>

                    {/* Wage Index Input */}
                    <td className="p-2 bg-rose-50/30">
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full p-2 pl-6 border rounded focus:ring-2 focus:ring-rose-500 outline-none text-center font-bold text-rose-900"
                          value={row.wageIndex || ''} 
                          onChange={(e) => onChange(row.id, 'wageIndex', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                         <Percent size={14} className="absolute left-2 top-3 text-rose-400" />
                      </div>
                    </td>

                    {/* Calculated Previews (Showing Added Adjustment Amount) */}
                    <td className="px-4 py-3 text-indigo-700 text-xs">+{formatRial(calc.industryAdjusted)}</td>
                    <td className="px-4 py-3 text-rose-700 text-xs">+{formatRial(calc.wageAdjusted)}</td>
                    <td className="px-4 py-3 font-bold text-green-700 text-xs bg-green-50/50">{formatRial(calc.adjustmentDelta)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-3 border border-indigo-100">
          <TrendingUp className="text-indigo-600" />
          <div className="text-sm text-indigo-900">
            <strong>تعدیل صنعت:</strong> {100 - settings.wageSplitPercent}٪ از مبلغ پایه × (درصد وارد شده) می‌شود و به مبلغ کل اضافه می‌گردد.
          </div>
        </div>
        <div className="bg-rose-50 p-4 rounded-lg flex items-center gap-3 border border-rose-100">
          <Coins className="text-rose-600" />
          <div className="text-sm text-rose-900">
            <strong>تعدیل دستمزد:</strong> {settings.wageSplitPercent}٪ از مبلغ پایه × (درصد وارد شده) می‌شود و به مبلغ کل اضافه می‌گردد.
          </div>
        </div>
      </div>
    </div>
  );
};