import React from 'react';
import { MonthRecord, AppSettings } from '../types';
import { SlidersHorizontal, Percent, TrendingDown, Coins, Wallet, Calculator, X } from 'lucide-react';
import { calculateGrandTotals, formatNumber, formatRial } from '../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MonthRecord[];
  settings: AppSettings;
  onBulkChange: (field: keyof MonthRecord, value: number) => void;
}

export const SidePanel: React.FC<Props> = ({ isOpen, onClose, data, settings, onBulkChange }) => {
  // Get current global values from the first record (assuming all are synced via bulk change)
  const currentChainPercent = data.length > 0 ? data[0].chainStopPercent : 100;
  const currentPartPercent = data.length > 0 ? data[0].partStopPercent : 100;
  
  const totals = calculateGrandTotals(data, settings);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-blue-600" />
              تنظیمات ضرایب
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
              <X size={24} />
            </button>
          </div>
          
          {/* Settings Box */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">درصد اعمال زنجیر</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0" max="100"
                    className="w-full p-3 pr-4 pl-10 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-center font-sans"
                    style={{ direction: 'ltr' }}
                    value={currentChainPercent}
                    onChange={(e) => onBulkChange('chainStopPercent', parseFloat(e.target.value) || 0)}
                  />
                  <Percent size={16} className="absolute top-4 left-3 text-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">درصد اعمال قطعه</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0" max="100"
                    className="w-full p-3 pr-4 pl-10 border border-green-200 bg-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg text-center font-sans"
                    style={{ direction: 'ltr' }}
                    value={currentPartPercent}
                    onChange={(e) => onBulkChange('partStopPercent', parseFloat(e.target.value) || 0)}
                  />
                  <Percent size={16} className="absolute top-4 left-3 text-green-400" />
                </div>
              </div>
            </div>
             <p className="text-xs text-gray-500 mt-3 text-center">این مقادیر روی تمام ماه‌های فیلتر شده اعمال می‌شوند.</p>
          </div>

          {/* Totals Box */}
          <div className="bg-slate-800 text-white p-5 rounded-xl shadow-md border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-4 border-b border-slate-600 pb-2">خلاصه وضعیت (فیلتر شده)</h3>
            
            <div className="space-y-4">
              {/* Raw Tonnage */}
              <div>
                 <div className="flex items-center gap-2 text-orange-300 text-xs mb-1">
                   <TrendingDown size={14} />
                   <span>مجموع تناژ از دست رفته (خام)</span>
                 </div>
                 <div className="text-2xl font-bold font-sans tracking-wider text-white" dir="ltr">
                   {formatNumber(totals.totalRawTonnage)}
                 </div>
                 <div className="text-[10px] text-slate-400 text-right mt-1">تن</div>
              </div>

              {/* Contractor Payment Tonnage */}
              <div className="pt-3 border-t border-slate-700">
                 <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
                   <Wallet size={14} />
                   <span>مجموع تناژ پرداختی به پیمانکار</span>
                 </div>
                 <div className="text-xl font-bold font-sans tracking-wider text-yellow-500" dir="ltr">
                   {formatNumber(totals.totalFinalContractorTonnage)}
                 </div>
                 <div className="text-[10px] text-slate-400 text-right mt-1">تن (با احتساب ضریب سهم)</div>
              </div>

              {/* Rial Total (Base) */}
              <div className="pt-3 border-t border-slate-700">
                 <div className="flex items-center gap-2 text-blue-300 text-xs mb-1">
                   <Coins size={14} />
                   <span>مجموع ریالی پرداختی (پایه)</span>
                 </div>
                 <div className="text-xl font-bold font-mono text-blue-400 tracking-tight" dir="ltr">
                   {formatRial(totals.totalBaseRial)}
                 </div>
              </div>

              {/* Rial Total (Adjusted) */}
              <div className="pt-3 border-t border-slate-700 bg-slate-700/50 p-2 rounded-lg -mx-2">
                 <div className="flex items-center gap-2 text-green-300 text-xs mb-1 font-bold">
                   <Calculator size={14} />
                   <span>مجموع ریالی (با تعدیل)</span>
                 </div>
                 <div className="text-xl font-bold font-mono text-green-400 tracking-tight" dir="ltr">
                   {formatRial(totals.totalAdjustedRial)}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};