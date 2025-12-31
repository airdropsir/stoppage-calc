import React from 'react';
import { MonthRecord } from '../types';
import { X, Save, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: MonthRecord[];
  onChange: (id: number, field: keyof MonthRecord, value: number) => void;
}

export const StoppageTimeModal: React.FC<Props> = ({ isOpen, onClose, data, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} />
            ثبت زمان توقفات
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 rounded-tr-lg">ماه</th>
                <th className="px-4 py-3 text-center">توقف زنجیر (دقیقه)</th>
                <th className="px-4 py-3 text-center rounded-tl-lg">توقف قطعه (دقیقه)</th>
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
                      className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-blue-900"
                      value={row.chainStopMinutes || ''}
                      onChange={(e) => onChange(row.id, 'chainStopMinutes', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      min="0"
                      className="w-full p-2 border border-green-200 rounded focus:ring-2 focus:ring-green-500 outline-none text-center font-bold text-green-900"
                      value={row.partStopMinutes || ''}
                      onChange={(e) => onChange(row.id, 'partStopMinutes', parseFloat(e.target.value) || 0)}
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition font-bold"
          >
            <Save size={18} />
            تایید و بستن
          </button>
        </div>
      </div>
    </div>
  );
};