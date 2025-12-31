
import React, { useRef } from 'react';
import { AppSettings, MonthRecord } from '../types';
import { X, Save, Clock, Factory, Download, Upload } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  data: MonthRecord[]; // Added data prop for export
  onSave: (newSettings: AppSettings) => void;
  onImportData: (importedData: MonthRecord[], importedSettings: AppSettings) => void; // Added import handler
  onOpenStoppageEntry: () => void;
  onOpenProducedTonnage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  data,
  onSave, 
  onImportData,
  onOpenStoppageEntry,
  onOpenProducedTonnage
}) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof AppSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // Export Data
  const handleExport = () => {
    const backup = {
      data: data,
      settings: localSettings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Data
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed.data && Array.isArray(parsed.data) && parsed.settings) {
          if (window.confirm('آیا مطمئن هستید؟ با این کار اطلاعات فعلی جایگزین فایل انتخاب شده می‌شوند.')) {
            onImportData(parsed.data, parsed.settings);
            alert('اطلاعات با موفقیت بازیابی شد.');
            onClose();
          }
        } else {
          alert('فرمت فایل نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center sticky top-0">
          <h3 className="text-lg font-bold">تنظیمات و پشتیبان‌گیری</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          
          {/* Backup & Restore Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 space-y-3">
            <label className="block text-sm font-bold text-orange-900 mb-2">مدیریت داده‌ها (پشتیبان‌گیری)</label>
            
            <button 
              onClick={handleExport}
              className="w-full bg-white border border-orange-300 text-orange-800 hover:bg-orange-100 py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Download size={18} />
              دانلود فایل پشتیبان (Backup)
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Upload size={18} />
              بازنشانی اطلاعات از فایل
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
            
            <p className="text-[10px] text-orange-600/80 text-center leading-tight">
              برای انتقال اطلاعات به سایت جدید، ابتدا از نسخه قدیمی «دانلود» کنید و در سایت جدید «بازنشانی» را بزنید.
            </p>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Data Entry Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
            <label className="block text-sm font-bold text-slate-800 mb-2">دسترسی سریع به ورود اطلاعات</label>
            
            <button 
              onClick={() => { onClose(); onOpenStoppageEntry(); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Clock size={18} />
              ثبت زمان توقفات
            </button>
            
            <button 
              onClick={() => { onClose(); onOpenProducedTonnage(); }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Factory size={18} />
              ثبت تناژ تولیدی
            </button>
          </div>
          
          <hr className="border-gray-200 my-4" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تولید هر ساعت (Row 31)</label>
            <input 
              type="number" 
              value={localSettings.productionPerHour}
              onChange={(e) => handleChange('productionPerHour', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">قیمت ریالی (Row 32)</label>
            <input 
              type="number" 
              value={localSettings.pricePerUnit}
              onChange={(e) => handleChange('pricePerUnit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ضریب عدم النفع / سهم پیمانکار (٪)</label>
            <input 
              type="number" 
              value={localSettings.contractorSharePercent}
              onChange={(e) => handleChange('contractorSharePercent', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">درصد سهم حقوق و دستمزد در تعدیل</label>
            <input 
              type="number" 
              value={localSettings.wageSplitPercent}
              onChange={(e) => handleChange('wageSplitPercent', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">درصدهای پیش‌فرض</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">پیش‌فرض زنجیر (٪)</label>
                <input 
                  type="number" 
                  value={localSettings.defaultChainStopPercent}
                  onChange={(e) => handleChange('defaultChainStopPercent', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">پیش‌فرض قطعه (٪)</label>
                <input 
                  type="number" 
                  value={localSettings.defaultPartStopPercent}
                  onChange={(e) => handleChange('defaultPartStopPercent', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition">انصراف</button>
          <button 
            onClick={() => { onSave(localSettings); onClose(); }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Save size={18} />
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};
