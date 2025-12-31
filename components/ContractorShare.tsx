import React from 'react';
import { MonthRecord, AppSettings } from '../types';
import { calculateRow, formatNumber, formatRial } from '../utils/calculations';

interface Props {
  data: MonthRecord[];
  settings: AppSettings;
}

export const ContractorShare: React.FC<Props> = ({ data, settings }) => {
  
  const footerTotals = data.reduce((acc, row) => {
    const calc = calculateRow(row, settings);
    return {
      chainRaw: acc.chainRaw + calc.rawChainTonnage,
      chainEff: acc.chainEff + calc.effectiveChainTonnage,
      partRaw: acc.partRaw + calc.rawPartTonnage,
      partEff: acc.partEff + calc.effectivePartTonnage,
      totalEff: acc.totalEff + calc.totalEffectiveTonnage,
      finalContractor: acc.finalContractor + calc.finalContractorTonnage,
      totalRial: acc.totalRial + calc.baseRialAmount
    };
  }, { chainRaw: 0, chainEff: 0, partRaw: 0, partEff: 0, totalEff: 0, finalContractor: 0, totalRial: 0 });

  return (
    <div className="w-full animate-fadeIn space-y-4">
       <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-800 flex flex-col gap-2">
        <div className="font-bold border-b border-indigo-200 pb-2 mb-1">فرمول محاسبات تفکیکی:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <span className="font-bold text-blue-700">زنجیر:</span> تناژ از دست رفته زنجیر × درصد اعمال زنجیر = تناژ مؤثر زنجیر
            </div>
            <div>
                <span className="font-bold text-green-700">قطعه:</span> تناژ از دست رفته قطعه × درصد اعمال قطعه = تناژ مؤثر قطعه
            </div>
        </div>
        <div className="mt-2 pt-2 border-t border-indigo-200 text-xs opacity-75">
            عدم النفع پیمانکار نهایی = (مجموع تناژ مؤثر) × ضریب سهم پیمانکار ({settings.contractorSharePercent}٪)
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 min-w-[80px] sticky right-0 bg-gray-50 z-10 border-l">ماه</th>
                
                {/* Chain Section */}
                <th className="px-2 py-3 text-center bg-blue-50 text-blue-900 border-l border-blue-100" colSpan={3}>محاسبات زنجیر</th>
                
                {/* Part Section */}
                <th className="px-2 py-3 text-center bg-green-50 text-green-900 border-l border-green-100" colSpan={3}>محاسبات قطعه</th>

                {/* Final Section */}
                <th className="px-4 py-3 text-center bg-gray-100 text-gray-900 border-l border-gray-200">مجموع مؤثر</th>
                <th className="px-4 py-3 text-center bg-yellow-50 text-yellow-900 border-l border-yellow-200">عدم النفع پیمانکار</th>
                <th className="px-4 py-3 text-center bg-gray-800 text-white">ریالی (پایه)</th>
              </tr>
              <tr className="text-xs text-gray-500 bg-gray-50 border-b">
                 <th className="sticky right-0 bg-gray-50 border-l"></th>
                 
                 {/* Chain Subcols */}
                 <th className="px-2 py-2 text-center text-blue-800 bg-blue-50/50">تناژ از دست رفته</th>
                 <th className="px-2 py-2 text-center text-blue-800 bg-blue-50/50">درصد</th>
                 <th className="px-2 py-2 text-center text-blue-900 font-bold bg-blue-100/30 border-l border-blue-100">مؤثر</th>

                 {/* Part Subcols */}
                 <th className="px-2 py-2 text-center text-green-800 bg-green-50/50">تناژ از دست رفته</th>
                 <th className="px-2 py-2 text-center text-green-800 bg-green-50/50">درصد</th>
                 <th className="px-2 py-2 text-center text-green-900 font-bold bg-green-100/30 border-l border-green-100">مؤثر</th>

                 <th className="px-2 py-2 text-center border-l bg-gray-100">(جمع مؤثر)</th>
                 <th className="px-2 py-2 text-center border-l bg-yellow-50 text-yellow-800">% {settings.contractorSharePercent}</th>
                 <th className="bg-gray-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => {
                const calc = calculateRow(row, settings);

                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 sticky right-0 bg-white shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)] border-l">{row.name}</td>
                    
                    {/* Chain Data */}
                    <td className="px-2 py-3 text-center text-gray-500 dir-ltr">{formatNumber(calc.rawChainTonnage)}</td>
                    <td className="px-2 py-3 text-center text-blue-600 text-xs">{row.chainStopPercent}%</td>
                    <td className="px-2 py-3 text-center font-bold text-blue-700 bg-blue-50/20 border-l border-blue-100 dir-ltr">{formatNumber(calc.effectiveChainTonnage)}</td>

                    {/* Part Data */}
                    <td className="px-2 py-3 text-center text-gray-500 dir-ltr">{formatNumber(calc.rawPartTonnage)}</td>
                    <td className="px-2 py-3 text-center text-green-600 text-xs">{row.partStopPercent}%</td>
                    <td className="px-2 py-3 text-center font-bold text-green-700 bg-green-50/20 border-l border-green-100 dir-ltr">{formatNumber(calc.effectivePartTonnage)}</td>

                    {/* Totals */}
                    <td className="px-4 py-3 text-center font-bold text-gray-800 bg-gray-50 border-l border-gray-200 dir-ltr">
                      {formatNumber(calc.totalEffectiveTonnage)}
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-yellow-700 bg-yellow-50/30 text-lg border-l border-yellow-200 dir-ltr">
                      {formatNumber(calc.finalContractorTonnage)}
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-white bg-gray-700 font-mono text-sm dir-ltr">
                      {formatRial(calc.baseRialAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-800 text-white sticky bottom-0 z-20 text-xs md:text-sm">
              <tr>
                <td className="px-4 py-3 font-bold border-l border-slate-600">جمع کل</td>
                
                <td className="px-2 py-3 text-center opacity-60 dir-ltr">{formatNumber(footerTotals.chainRaw)}</td>
                <td className="px-2 py-3"></td>
                <td className="px-2 py-3 text-center font-bold text-blue-300 border-l border-slate-600 dir-ltr">{formatNumber(footerTotals.chainEff)}</td>

                <td className="px-2 py-3 text-center opacity-60 dir-ltr">{formatNumber(footerTotals.partRaw)}</td>
                <td className="px-2 py-3"></td>
                <td className="px-2 py-3 text-center font-bold text-green-300 border-l border-slate-600 dir-ltr">{formatNumber(footerTotals.partEff)}</td>

                <td className="px-2 py-3 text-center font-bold border-l border-slate-600 dir-ltr">{formatNumber(footerTotals.totalEff)}</td>
                <td className="px-2 py-3 text-center font-bold text-yellow-400 text-base border-l border-slate-600 dir-ltr">{formatNumber(footerTotals.finalContractor)}</td>
                <td className="px-2 py-3 text-center font-bold text-green-400 text-base bg-slate-900 dir-ltr">
                  {formatRial(footerTotals.totalRial)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};