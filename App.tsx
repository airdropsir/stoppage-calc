import React, { useState, useEffect, useRef } from 'react';
import { MonthRecord, AppSettings } from './types';
import { DEFAULT_SETTINGS, INITIAL_DATA } from './constants';
import { StoppageInput } from './components/StoppageInput';
import { ContractorShare } from './components/ContractorShare';
import { AdjustmentInput } from './components/AdjustmentInput';
import { FinalReport } from './components/FinalReport';
import { SettingsModal } from './components/SettingsModal';
import { PasswordModal } from './components/PasswordModal';
import { StoppageTimeModal } from './components/StoppageTimeModal';
import { ProducedTonnageModal } from './components/ProducedTonnageModal';
import { SidePanel } from './components/SidePanel';
import { Settings, FileText, Activity, Layers, Network, Briefcase, SlidersHorizontal, CalendarCheck } from 'lucide-react';

function App() {
  // --- State Management ---
  const [data, setData] = useState<MonthRecord[]>(INITIAL_DATA);
  const [settings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const isInitialLoad = useRef(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'stoppage' | 'contractor' | 'adjustment' | 'report'>('stoppage');
  
  // UI State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStoppageEntryOpen, setIsStoppageEntryOpen] = useState(false);
  const [isProducedTonnageOpen, setIsProducedTonnageOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Filter State
  const [selectedYears, setSelectedYears] = useState<number[]>([1403]);

  // Derived State (Filtered Data)
  const filteredData = data.filter(record => selectedYears.includes(record.yearGroup));

  // --- Helpers ---
  
  // This function merges saved data (which might be old format) with the new INITIAL_DATA structure
  const mergeWithInitial = (savedRecords: any[], initialRecords: MonthRecord[]): MonthRecord[] => {
    return initialRecords.map(initItem => {
      // Find matching record from saved data (by ID)
      const savedItem = savedRecords.find(s => s.id === initItem.id);
      
      if (savedItem) {
        return {
          ...initItem, // Keep the new structure (New Name, YearGroup)
          // Restore user values if they exist
          chainStopMinutes: savedItem.chainStopMinutes ?? 0,
          partStopMinutes: savedItem.partStopMinutes ?? 0,
          producedTonnage: savedItem.producedTonnage ?? 0, // New Field
          chainStopPercent: savedItem.chainStopPercent ?? initItem.chainStopPercent,
          partStopPercent: savedItem.partStopPercent ?? initItem.partStopPercent,
          industryIndex: savedItem.industryIndex ?? initItem.industryIndex,
          wageIndex: savedItem.wageIndex ?? initItem.wageIndex,
        };
      }
      // If no saved data for this month (e.g. new months added), use initial default
      return initItem;
    });
  };

  // --- Persistence & Networking ---
  
  // 1. Load Data on Mount (Try Server -> Fallback LocalStorage)
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const serverData = await response.json();
          if (serverData) {
            // Merge logic: Use structure from constants, values from DB
            const mergedData = mergeWithInitial(serverData.data || [], INITIAL_DATA);
            setData(mergedData);
            setAppSettings(serverData.settings || DEFAULT_SETTINGS);
            setIsConnected(true);
            isInitialLoad.current = false;
            return;
          }
        }
      } catch (e) {
        console.warn("Server not reachable, falling back to local storage");
      }

      // Fallback
      const localData = localStorage.getItem('app_stoppage_data_v1');
      const localSettings = localStorage.getItem('app_settings_v1');
      if (localData) {
        const parsedData = JSON.parse(localData);
        // Merge logic ensures old localstorage data works with new structure
        setData(mergeWithInitial(parsedData, INITIAL_DATA));
      }
      if (localSettings) setAppSettings(JSON.parse(localSettings));
      isInitialLoad.current = false;
    };

    loadData();
  }, []);

  // 2. Sync Data on Change
  useEffect(() => {
    if (isInitialLoad.current) return;

    // Save to LocalStorage (Always backup)
    localStorage.setItem('app_stoppage_data_v1', JSON.stringify(data));
    localStorage.setItem('app_settings_v1', JSON.stringify(settings));

    // Save to Server
    const saveData = async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, settings })
        });
        setIsConnected(true);
      } catch (e) {
        setIsConnected(false);
      }
    };

    // Debounce slightly to avoid hammering server
    const timeout = setTimeout(saveData, 500);
    return () => clearTimeout(timeout);
  }, [data, settings]);


  // --- Handlers ---
  const handleDataChange = (id: number, field: keyof MonthRecord, value: number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleBulkChange = (field: keyof MonthRecord, value: number) => {
    // Apply to all data for consistency
    setData(prev => prev.map(item => ({ ...item, [field]: value })));
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
  };

  const onSettingsClick = () => {
    if (localStorage.getItem('app_auth_remembered') === 'true') {
        setIsSettingsOpen(true);
    } else {
        setIsPasswordModalOpen(true);
    }
  };

  const onPasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setIsSettingsOpen(true);
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year].sort();
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-[Vazirmatn]">
      
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MSSCO Logo" className="h-12 w-auto bg-white rounded-lg p-1 object-contain" />
            <div>
              <h1 className="text-xl font-bold">محاسبه‌گر توقفات صنعتی کارخانه گندله سازی سه چاهون</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400">سیستم جامع محاسبه عدم النفع و تعدیل</p>
                {isConnected ? (
                  <span className="flex items-center text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded-full border border-green-700">
                    <Network size={10} className="mr-1" /> آنلاین (شبکه)
                  </span>
                ) : (
                   <span className="flex items-center text-[10px] bg-orange-900 text-orange-300 px-2 py-0.5 rounded-full border border-orange-700">
                    <Network size={10} className="mr-1" /> آفلاین (ذخیره داخلی)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={() => setIsSidePanelOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm shadow-md border border-indigo-500"
            >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">ضرایب و خلاصه</span>
            </button>

            <button 
                onClick={onSettingsClick}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition text-sm border border-slate-600"
            >
                <Settings size={18} />
                <span className="hidden sm:inline">تنظیمات پایه</span>
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 mt-4 flex gap-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('stoppage')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'stoppage' 
                ? 'bg-[#f3f4f6] text-blue-600 font-bold translate-y-[1px]' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Activity size={18} />
            ورود اطلاعات و تناژ خام
          </button>

          <button 
            onClick={() => setActiveTab('contractor')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'contractor' 
                ? 'bg-[#f3f4f6] text-yellow-600 font-bold translate-y-[1px]' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Briefcase size={18} />
            عدم النفع پیمانکار
          </button>
          
          <button 
            onClick={() => setActiveTab('adjustment')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'adjustment' 
                ? 'bg-[#f3f4f6] text-rose-600 font-bold translate-y-[1px]' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers size={18} />
            محاسبه تعدیل
          </button>

          <button 
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all ${
              activeTab === 'report' 
                ? 'bg-[#f3f4f6] text-green-600 font-bold translate-y-[1px]' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText size={18} />
            گزارش نهایی
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 container mx-auto px-4 py-8">
        
        {/* Year Selector Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-full text-teal-700">
                    <CalendarCheck size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">انتخاب دوره مالی</h3>
                    <p className="text-xs text-gray-500">برای مشاهده محاسبات، سال‌های مورد نظر را انتخاب کنید.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1 hover:bg-white rounded-md transition">
                    <input 
                        type="checkbox" 
                        checked={selectedYears.includes(1403)}
                        onChange={() => toggleYear(1403)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className={`font-bold ${selectedYears.includes(1403) ? 'text-blue-700' : 'text-gray-600'}`}>
                        سال ۱۴۰۳
                        <span className="text-[10px] block font-normal text-gray-400">اردیبهشت ۰۳ تا فروردین ۰۴</span>
                    </span>
                </label>

                <div className="hidden md:block h-8 w-px bg-gray-300"></div>

                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1 hover:bg-white rounded-md transition">
                    <input 
                        type="checkbox" 
                        checked={selectedYears.includes(1404)}
                        onChange={() => toggleYear(1404)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className={`font-bold ${selectedYears.includes(1404) ? 'text-blue-700' : 'text-gray-600'}`}>
                        سال ۱۴۰۴
                        <span className="text-[10px] block font-normal text-gray-400">اردیبهشت ۰۴ تا آذر ۰۴</span>
                    </span>
                </label>
            </div>
        </div>

        {/* Full width content (Side panel is now a drawer) */}
        <main className="w-full">
            {filteredData.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-200">
                  <p className="text-gray-500 font-bold">هیچ سالی انتخاب نشده است.</p>
                  <p className="text-sm text-gray-400 mt-2">لطفا از پنل بالا حداقل یک سال را انتخاب کنید.</p>
              </div>
            ) : (
              <>
                {activeTab === 'stoppage' && (
                  <StoppageInput 
                    data={filteredData} 
                    settings={settings} 
                    onChange={handleDataChange} 
                  />
                )}

                {activeTab === 'contractor' && (
                  <ContractorShare data={filteredData} settings={settings} />
                )}
                
                {activeTab === 'adjustment' && (
                  <AdjustmentInput data={filteredData} settings={settings} onChange={handleDataChange} />
                )}

                {activeTab === 'report' && (
                  <FinalReport data={filteredData} settings={settings} />
                )}
              </>
            )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>نرم‌افزار داخلی محاسبه صورت وضعیت - تمامی داده‌ها به صورت خودکار در بانک اطلاعاتی سرور ذخیره می‌شوند.</p>
      </footer>

      {/* Side Panel Drawer */}
      <SidePanel 
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        data={filteredData}
        settings={settings}
        onBulkChange={handleBulkChange}
      />

      {/* Modals */}
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSuccess={onPasswordSuccess}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={handleSettingsSave}
        onOpenStoppageEntry={() => setIsStoppageEntryOpen(true)}
        onOpenProducedTonnage={() => setIsProducedTonnageOpen(true)}
      />

      <StoppageTimeModal 
        isOpen={isStoppageEntryOpen}
        onClose={() => setIsStoppageEntryOpen(false)}
        data={filteredData} 
        onChange={handleDataChange}
      />

      <ProducedTonnageModal 
        isOpen={isProducedTonnageOpen}
        onClose={() => setIsProducedTonnageOpen(false)}
        data={filteredData} 
        onChange={handleDataChange}
      />
    </div>
  );
}

export default App;