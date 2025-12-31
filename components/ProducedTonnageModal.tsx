import React from 'react';
import { MonthRecord } from '../types';
import { X, Save, Factory } from 'lucide-react';
import { formatNumber } from '../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MonthRecord[];
  onChange: (id: number, field: keyof MonthRecord, value: number) => void;
}

export const ProducedTonnageModal: React.FC<Props> = ({ isOpen, onClose, data, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-teal-700 text-white p-4 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Factory size={20} />
            ثبت تناژ تولیدی
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 rounded-r-lg">ماه</th>
                <th className="px-4 py-3 text-center rounded-l-lg">تناژ تولید شده (تن)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium bg-gray-50">{row.name}</td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      min="0"
                      className="w-full p-2 border border-teal-200 rounded focus:ring-2 focus:ring-teal-500 outline-none text-center font-bold text-teal-900 text-lg"
                      value={row.producedTonnage || ''}
                      onChange={(e) => onChange(row.id, 'producedTonnage', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t shrink-0 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 transition font-bold"
          >
            <Save size={18} />
            تایید و بستن
          </button>
        </div>
      </div>
    </div>
  );
};