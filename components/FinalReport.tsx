import React from 'react';
import { MonthRecord, AppSettings } from '../types';
import { calculateRow, formatRial, formatNumber } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer } from 'lucide-react';

interface Props {
  data: MonthRecord[];
  settings: AppSettings;
}

export const FinalReport: React.FC<Props> = ({ data, settings }) => {
  const calculatedData = data.map(row => {
    const res = calculateRow(row, settings);
    return {
      name: row.name,
      producedTonnage: row.producedTonnage || 0,
      ...res
    };
  });

  const totals = calculatedData.reduce((acc, curr) => ({
    producedTonnage: acc.producedTonnage + curr.producedTonnage,
    effectiveStopHours: acc.effectiveStopHours + curr.effectiveStopHours,
    tonnageLost: acc.tonnageLost + curr.finalContractorTonnage,
    baseRialAmount: acc.baseRialAmount + curr.baseRialAmount,
    adjustmentDelta: acc.adjustmentDelta + curr.adjustmentDelta,
    totalAdjustedAmount: acc.totalAdjustedAmount + curr.totalAdjustedAmount
  }), {
    producedTonnage: 0,
    effectiveStopHours: 0,
    tonnageLost: 0,
    baseRialAmount: 0,
    adjustmentDelta: 0,
    totalAdjustedAmount: 0
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">نمودار تناژ سهم پیمانکار (تفکیکی)</h3>
        {/* Use dir="ltr" explicitly as attribute for Recharts container */}
        <div className="h-[300px] w-full" dir="ltr">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={calculatedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => formatNumber(val, 0)} />
              <Tooltip formatter={(value: number) => `${formatNumber(value)} تن`} />
              <Legend />
              <Bar dataKey="contractorChainTonnage" name="سهم زنجیر (تن)" stackId="a" fill="#3b82f6" />
              <Bar dataKey="contractorPartTonnage" name="سهم قطعه (تن)" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">این نمودار تناژ نهایی سهم پیمانکار (پس از اعمال ضرایب) را به تفکیک زنجیر و قطعه نمایش می‌دهد.</p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800">جدول تجمیعی سالیانه</h2>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border px-3 py-1 rounded-lg hover:bg-gray-200 transition"
          >
            <Printer size={16} />
            چاپ گزارش
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="px-4 py-4">ماه</th>
                <th className="px-4 py-4 text-teal-900 bg-teal-50">تولید واقعی (تن)</th>
                <th className="px-4 py-4">مجموع توقفات موثر (ساعت)</th>
                <th className="px-4 py-4">تناژ سهم پیمانکار</th>
                <th className="px-4 py-4 text-blue-800 bg-blue-50">مبلغ پایه (ریال)</th>
                <th className="px-4 py-4 text-orange-800 bg-orange-50">مبلغ افزوده تعدیل (ریال)</th>
                <th className="px-4 py-4 text-green-800 bg-green-50 font-bold text-base">مجموع نهایی (ریال)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {calculatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-teal-800 font-bold bg-teal-50/30">{formatNumber(row.producedTonnage)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatNumber(row.effectiveStopHours)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatNumber(row.finalContractorTonnage)}</td>
                  <td className="px-4 py-3 text-blue-700 font-mono bg-blue-50/30">{formatRial(row.baseRialAmount)}</td>
                  <td className="px-4 py-3 text-orange-700 font-mono bg-orange-50/30">{formatRial(row.adjustmentDelta)}</td>
                  <td className="px-4 py-3 text-green-700 font-bold font-mono bg-green-50/30">{formatRial(row.totalAdjustedAmount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-800 text-white font-bold">
              <tr>
                <td className="px-4 py-4">جمع کل</td>
                <td className="px-4 py-4 text-teal-300">{formatNumber(totals.producedTonnage)}</td>
                <td className="px-4 py-4">{formatNumber(totals.effectiveStopHours)}</td>
                <td className="px-4 py-4">{formatNumber(totals.tonnageLost)}</td>
                <td className="px-4 py-4 text-blue-200">{formatRial(totals.baseRialAmount)}</td>
                <td className="px-4 py-4 text-orange-200">{formatRial(totals.adjustmentDelta)}</td>
                <td className="px-4 py-4 text-green-300 text-base">{formatRial(totals.totalAdjustedAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};