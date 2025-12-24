
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../services/dataContext';
import { Card, Button, Input, TextArea, Modal } from '../components/Shared';
import { Save, Moon, Sun, Image as ImageIcon, Shield, Fingerprint, Palette, Check, CreditCard, Upload, Trash2, ScanLine } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'افتراضي', primary: '#2563eb', secondary: '#4f46e5' },
  { name: 'بنفسجي', primary: '#7c3aed', secondary: '#db2777' },
  { name: 'أخضر غامق', primary: '#059669', secondary: '#0d9488' },
  { name: 'أحمر ناري', primary: '#dc2626', secondary: '#ea580c' },
  { name: 'ليلي', primary: '#0f172a', secondary: '#334155' },
  { name: 'ذهبي', primary: '#b45309', secondary: '#78350f' },
];

const ColorPicker: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void 
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
    <div className="flex flex-col">
      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{label}</span>
      <span className="text-xs text-slate-400 uppercase font-mono mt-1">{value}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="relative overflow-hidden w-10 h-10 rounded-lg shadow-sm ring-1 ring-slate-200 dark:ring-slate-600">
        <input 
          type="color" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 m-0"
        />
      </div>
    </div>
  </div>
);

export const Settings: React.FC = () => {
  const { settings, updateSettings, toggleTheme } = useData();
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Biometric Setup State
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    // Visual feedback
    const btn = document.getElementById('save-btn');
    if(btn) {
       const originalContent = btn.innerHTML;
       btn.innerHTML = '<span class="flex items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><polyline points="20 6 9 17 4 12"></polyline></svg> تم الحفظ!</span>';
       setTimeout(() => btn.innerHTML = originalContent, 2000);
    }
  };

  const applyPreset = (preset: { primary: string, secondary: string }) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("حجم الصورة كبير جداً. يرجى استخدام صورة أقل من 1 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBiometricToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
     const isChecking = e.target.checked;
     if (isChecking) {
        // Show simulation modal
        setScanSuccess(false);
        setScanning(false);
        setShowBiometricModal(true);
     } else {
        setFormData(prev => ({ ...prev, enableBiometric: false }));
     }
  };

  const startScanSimulation = () => {
     setScanning(true);
     setTimeout(() => {
        setScanning(false);
        setScanSuccess(true);
        setTimeout(() => {
           setFormData(prev => ({ ...prev, enableBiometric: true }));
           setShowBiometricModal(false);
        }, 1000);
     }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">الإعدادات العامة</h2>

      {/* Theme & Colors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Toggle */}
        <Card className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               المظهر
               {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </h3>
            <p className="text-slate-500 text-sm">التبديل بين الوضع الفاتح والداكن.</p>
          </div>
          <div className="flex items-center">
             <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.darkMode} onChange={toggleTheme} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </Card>

        {/* Security / Biometric */}
        <Card className="flex items-center justify-between p-6">
           <div>
             <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-green-600" />
                الأمان والدخول
             </h3>
             <p className="text-slate-500 text-sm">تفعيل المصادقة بالبصمة (للموبايل).</p>
           </div>
           <div className="flex items-center gap-2">
             <Fingerprint size={24} className={formData.enableBiometric ? "text-blue-500" : "text-slate-300"} />
             <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={!!formData.enableBiometric} 
                onChange={handleBiometricToggle} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
           </div>
        </Card>
      </div>

      <form onSubmit={handleSave}>
        <Card className="space-y-6 p-8">
          {/* Branding Colors Section */}
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               <Palette size={18} className="text-blue-600" />
               ألوان العلامة التجارية
            </h3>
            <p className="text-slate-500 text-sm">تخصيص ألوان النظام لتناسب هويتك التجارية. اختر من القوالب أو خصص الألوان يدويًا.</p>
          </div>
          
          {/* Color Preview & Presets */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex flex-col items-center gap-2 group min-w-[80px]"
                >
                  <div className="w-12 h-12 rounded-full flex overflow-hidden border-2 border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    <div className="w-1/2 h-full" style={{ backgroundColor: preset.primary }}></div>
                    <div className="w-1/2 h-full" style={{ backgroundColor: preset.secondary }}></div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker 
                label="اللون الأساسي (Primary)" 
                value={formData.primaryColor || '#2563eb'} 
                onChange={(val) => setFormData(prev => ({ ...prev, primaryColor: val }))}
              />
              <ColorPicker 
                label="اللون الثانوي (Secondary)" 
                value={formData.secondaryColor || '#4f46e5'} 
                onChange={(val) => setFormData(prev => ({ ...prev, secondaryColor: val }))}
              />
            </div>
            
            {/* Live Preview Box */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">معاينة حية</h4>
               <div className="flex gap-3">
                  <button type="button" style={{ backgroundColor: formData.primaryColor }} className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg opacity-90 hover:opacity-100 transition-opacity">
                     زر أساسي
                  </button>
                  <button type="button" style={{ backgroundColor: formData.secondaryColor }} className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg opacity-90 hover:opacity-100 transition-opacity">
                     زر ثانوي
                  </button>
                  <div className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium" style={{ color: formData.primaryColor, borderColor: formData.primaryColor }}>
                     زر حدود
                  </div>
               </div>
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">هوية الوكالة والفواتير</h3>
            <p className="text-slate-500 text-sm">هذه البيانات تظهر في القائمة الجانبية وعلى ترويسة الفواتير.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Logo Upload Section */}
            <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">شعار الوكالة</label>
               <div className="flex items-start gap-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                     {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                     ) : (
                        <ImageIcon className="text-slate-300 w-8 h-8" />
                     )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        قم برفع شعار بخلفية شفافة (PNG) للحصول على أفضل نتيجة في الفواتير. الحد الأقصى 1 ميجابايت.
                     </p>
                     <div className="flex gap-2">
                        <input 
                           type="file" 
                           accept="image/*" 
                           ref={fileInputRef}
                           className="hidden"
                           onChange={handleLogoUpload}
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-xs">
                           <Upload size={14} className="ml-2" />
                           رفع صورة
                        </Button>
                        {formData.logoUrl && (
                           <Button type="button" variant="danger" onClick={removeLogo} className="text-xs">
                              <Trash2 size={14} className="ml-2" />
                              حذف
                           </Button>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            <Input 
              label="اسم الوكالة"
              value={formData.agencyName}
              onChange={e => setFormData({...formData, agencyName: e.target.value})}
            />
            <Input 
              label="رقم الهاتف الرسمي"
              value={formData.agencyPhone}
              onChange={e => setFormData({...formData, agencyPhone: e.target.value})}
            />
            <Input 
              label="الرقم الضريبي"
              value={formData.taxNumber}
              onChange={e => setFormData({...formData, taxNumber: e.target.value})}
            />
            <div className="md:col-span-2">
               <Input 
                label="العنوان الفعلي"
                value={formData.agencyAddress}
                onChange={e => setFormData({...formData, agencyAddress: e.target.value})}
              />
            </div>
          </div>
          
          {/* Bank Details Section */}
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4 mt-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               <CreditCard size={18} className="text-blue-600" />
               بيانات البنك والتحويل
            </h3>
            <p className="text-slate-500 text-sm">تظهر هذه المعلومات أسفل الفاتورة للعميل.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input 
               label="اسم البنك"
               placeholder="مثال: البنك الأهلي التجاري"
               value={formData.bankName || ''}
               onChange={e => setFormData({...formData, bankName: e.target.value})}
             />
             <Input 
               label="اسم المستفيد"
               placeholder="الاسم الموجود على الحساب"
               value={formData.bankBeneficiary || ''}
               onChange={e => setFormData({...formData, bankBeneficiary: e.target.value})}
             />
             <div className="md:col-span-2">
                <Input 
                  label="رقم الحساب / IBAN"
                  placeholder="SA00 0000 0000 0000 0000"
                  value={formData.bankAccount || ''}
                  onChange={e => setFormData({...formData, bankAccount: e.target.value})}
                  style={{ fontFamily: 'monospace' }}
                />
             </div>
          </div>

          <div className="md:col-span-2 mt-4">
              <TextArea 
                 label="نص تذييل الفاتورة (Footer)"
                 value={formData.footerText}
                 onChange={e => setFormData({...formData, footerText: e.target.value})}
                 placeholder="مثال: شكرًا لتعاملكم معنا، التحويل البنكي على حساب رقم..."
              />
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
             <Button type="submit" id="save-btn" className="px-8">
               <Save size={18} className="ml-2" />
               حفظ التغييرات
             </Button>
          </div>
        </Card>
      </form>

      {/* Biometric Simulation Modal */}
      <Modal 
         isOpen={showBiometricModal} 
         onClose={() => {setShowBiometricModal(false); setScanning(false); setScanSuccess(false);}} 
         title="إعداد بصمة الإصبع"
         maxWidth="max-w-sm"
      >
         <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${scanSuccess ? 'bg-green-100' : 'bg-blue-50'}`}>
               <div className={`absolute inset-0 rounded-full border-4 border-blue-500 ${scanning ? 'animate-ping opacity-20' : 'opacity-0'}`}></div>
               {scanSuccess ? (
                  <Check size={48} className="text-green-600 animate-in zoom-in" />
               ) : (
                  <Fingerprint size={48} className={`text-blue-600 ${scanning ? 'animate-pulse' : ''}`} />
               )}
            </div>
            
            <div className="text-center space-y-2">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {scanSuccess ? 'تم تسجيل البصمة بنجاح' : scanning ? 'جاري المسح...' : 'تسجيل بصمة جديدة'}
               </h3>
               <p className="text-sm text-slate-500">
                  {scanSuccess ? 'تم تفعيل الدخول بالبصمة لهذا الجهاز.' : 'يرجى وضع إصبعك على المستشعر لتأكيد هويتك.'}
               </p>
            </div>

            {!scanSuccess && !scanning && (
               <Button onClick={startScanSimulation} className="w-full py-3 text-lg shadow-lg">
                  <ScanLine className="ml-2" size={20} />
                  بدء المسح
               </Button>
            )}
         </div>
      </Modal>
    </div>
  );
};
