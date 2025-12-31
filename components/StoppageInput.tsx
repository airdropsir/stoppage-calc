import React from 'react';
import { MonthRecord, AppSettings } from '../types';
import { formatNumber } from '../utils/calculations';
import { calculateRow } from '../utils/calculations';

interface Props {
  data: MonthRecord[];
  settings: AppSettings;
  onChange: (id: number, field: keyof MonthRecord, value: number) => void;
}

export const StoppageInput: React.FC<Props> = ({ data, settings }) => {
  
  // Calculate totals for footer
  const footerTotals = data.reduce((acc, row) => {
    const calc = calculateRow(row, settings);
    return {
      chainRaw: acc.chainRaw + calc.rawChainTonnage,
      partRaw: acc.partRaw + calc.rawPartTonnage,
      totalRaw: acc.totalRaw + calc.totalRawTonnage,
      totalProduced: acc.totalProduced + (row.producedTonnage || 0)
    };
  }, { chainRaw: 0, partRaw: 0, totalRaw: 0, totalProduced: 0 });

  return (
    <div className="w-full animate-fadeIn space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex justify-between items-center">
        <div>
           <strong>نحوه محاسبه:</strong> 
           <span className="mx-2">تناژ از دست رفته = (دقیقه توقف ÷ ۶۰) × تناژ تولیدی هر ساعت ({settings.productionPerHour})</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 min-w-[100px] sticky right-0 bg-gray-50 z-10">ماه</th>
                <th className="px-4 py-3 text-center bg-teal-50 text-teal-800 border-l border-gray-200">تولید واقعی</th>
                <th className="px-4 py-3 text-center bg-blue-50 text-blue-800" colSpan={2}>توقفات ناشی از مشکلات فنی زنجیر</th>
                <th className="px-4 py-3 text-center bg-green-50 text-green-800" colSpan={2}>توقفات ناشی از نبود قطعه یدکی</th>
                <th className="px-4 py-3 text-center bg-gray-100 text-gray-800 border-l border-gray-200">مجموع</th>
              </tr>
              <tr className="text-xs text-gray-500">
                <th className="px-4 py-2 sticky right-0 bg-gray-50"></th>
                
                {/* Produced Sub-header */}
                <th className="px-4 py-2 text-center bg-teal-50/50 font-bold text-teal-900 border-l border-gray-200">تناژ (تن)</th>

                {/* Chain Sub-headers */}
                <th className="px-4 py-2 text-center bg-blue-50/50">کل توقف (دقیقه)</th>
                <th className="px-4 py-2 text-center bg-blue-100/50 font-bold text-blue-900">تناژ از دست رفته</th>
                
                {/* Part Sub-headers */}
                <th className="px-4 py-2 text-center bg-green-50/50">کل توقف (دقیقه)</th>
                <th className="px-4 py-2 text-center bg-green-100/50 font-bold text-green-900">تناژ از دست رفته</th>

                {/* Total Sub-header */}
                <th className="px-4 py-2 text-center bg-gray-100/50 font-bold border-l border-gray-200">مجموع تناژ از دست رفته ماه (تن)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => {
                const calc = calculateRow(row, settings);

                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 sticky right-0 bg-white shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">{row.name}</td>
                    
                    {/* Produced Tonnage Display */}
                    <td className="p-2 text-center font-bold text-teal-800 bg-teal-50/10 border-l border-gray-200 font-sans" dir="ltr">
                        {row.producedTonnage > 0 ? formatNumber(row.producedTonnage) : '-'}
                    </td>

                    {/* Chain */}
                    <td className="p-2 text-center font-mono text-gray-600">
                      {row.chainStopMinutes}
                    </td>
                    <td className="p-2 bg-blue-50/30 text-center text-blue-900 font-sans text-lg font-bold" dir="ltr">
                      {formatNumber(calc.rawChainTonnage)}
                    </td>

                    {/* Part */}
                    <td className="p-2 text-center font-mono text-gray-600">
                       {row.partStopMinutes}
                    </td>
                    <td className="p-2 bg-green-50/30 text-center text-green-900 font-sans text-lg font-bold" dir="ltr">
                      {formatNumber(calc.rawPartTonnage)}
                    </td>

                    {/* Total Raw */}
                    <td className="p-2 bg-gray-50 border-l border-gray-200">
                      <div className="flex items-center justify-center gap-2 text-gray-900 text-lg font-bold h-full font-sans bg-gray-100 rounded px-2" dir="ltr">
                        {formatNumber(calc.totalRawTonnage)}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-800 text-white sticky bottom-0 z-20">
              <tr>
                <td className="px-4 py-3 font-bold">جمع کل</td>
                <td className="px-4 py-3 text-center text-teal-300 font-bold text-lg border-l border-slate-700" dir="ltr">{formatNumber(footerTotals.totalProduced)}</td>
                <td className="px-4 py-3 text-center text-slate-300 font-mono"></td>
                <td className="px-4 py-3 text-center text-blue-300 font-bold text-lg" dir="ltr">{formatNumber(footerTotals.chainRaw)}</td>
                <td className="px-4 py-3 text-center text-slate-300 font-mono"></td>
                <td className="px-4 py-3 text-center text-green-300 font-bold text-lg" dir="ltr">{formatNumber(footerTotals.partRaw)}</td>
                <td className="px-4 py-3 text-center text-white font-bold text-xl border-l border-slate-700 bg-slate-900" dir="ltr">
                  {formatNumber(footerTotals.totalRaw)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};