import React, { useState, useEffect } from 'react';
import { Lock, X, CheckSquare, Square } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check local storage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('app_auth_remembered');
    if (savedAuth === 'true' && isOpen) {
      onSuccess();
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) {
     // If closed and explicitly not remembered, reset password field
     if (!localStorage.getItem('app_auth_remembered')) {
         // keep internal state clean
     }
     return null; 
  }
  
  // If we just opened and we are remembered, we shouldn't see this modal (handled by effect above usually, 
  // but if effect runs after render, return null to avoid flash)
  if (localStorage.getItem('app_auth_remembered') === 'true') {
      return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Madox404*') {
      if (rememberMe) {
        localStorage.setItem('app_auth_remembered', 'true');
      }
      onSuccess();
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Lock size={18} />
            احراز هویت
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-4 text-sm">برای دسترسی به تنظیمات لطفا رمز عبور را وارد کنید:</p>
          
          <div className="mb-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full p-3 border rounded-lg outline-none transition text-center text-lg font-bold tracking-widest ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              placeholder="******"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2">رمز عبور اشتباه است.</p>}
          </div>

          <div className="mb-6 flex items-center gap-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
            {rememberMe ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-gray-400" />}
            <span className="text-sm text-gray-700 select-none">رمز عبور را ذخیره کن</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold"
          >
            ورود به تنظیمات
          </button>
        </form>
      </div>
    </div>
  );
};