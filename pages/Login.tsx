
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { useData } from '../services/dataContext';
import { Fingerprint, Lock, User, Loader2, ArrowRight, Check, AlertCircle, Send } from 'lucide-react';

// Define the Window interface extension to include emailjs
declare global {
  interface Window {
    emailjs: any;
  }
}

// --- EMAILJS CONFIGURATION ---
// تم ربط المفاتيح الخاصة بك بنجاح
const EMAILJS_SERVICE_ID = "service_ricrxyc";
const EMAILJS_TEMPLATE_ID = "template_fokm7j6";
const EMAILJS_PUBLIC_KEY = "YJ48Krm1kWk8VU89s";

export const Login: React.FC = () => {
  const { login, biometricLogin, isBiometricEnabled } = useAuth();
  const { settings } = useData();
  
  // Initialize with empty strings
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Clear inputs on mount
  useEffect(() => {
     const timer = setTimeout(() => {
        setUsername('');
        setPassword('');
     }, 100);
     return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    // Simulate network delay
    setTimeout(async () => {
        const success = await login(username, password);
        if (!success) {
          setError('بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.');
          setLoading(false);
        }
    }, 1000);
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccessMsg('');

    // Check if EmailJS is configured
    if (!window.emailjs) {
       setLoading(false);
       setError('مكتبة EmailJS غير محملة. يرجى التحقق من الاتصال بالإنترنت.');
       return;
    }

    try {
       // Initialize EmailJS
       window.emailjs.init(EMAILJS_PUBLIC_KEY);

       // Send the email
       // Note: We use the parameters {{username}} and {{password}} that match your template
       await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
             to_email: 'elmustafa.digital@gmail.com', // The recipient
             username: 'elmustafa',                   // Variable 1
             password: 'Mustafa.462020'               // Variable 2
          }
       );

       setLoading(false);
       setSuccessMsg(`تم إرسال بريد إلكتروني بنجاح إلى elmustafa.digital@gmail.com يحتوي على بيانات الدخول.`);

    } catch (err) {
       console.error('EmailJS Error:', err);
       setLoading(false);
       setError('حدث خطأ أثناء محاولة إرسال البريد الإلكتروني. يرجى التحقق من إعدادات الخدمة.');
    }
  };

  const handleBiometric = async () => {
    setLoading(true);
    await biometricLogin();
    setLoading(false);
  };

  const primary = settings.primaryColor || '#2563eb';   
  const secondary = settings.secondaryColor || '#4f46e5'; 

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-slate-50">
      
      {/* ================= BACKGROUND ARTWORK ================= */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
         <div 
            className="absolute inset-0 opacity-10"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
         ></div>
         <div 
            className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full blur-[80px] opacity-20 animate-pulse"
            style={{ background: `radial-gradient(circle, ${secondary}, transparent 70%)` }}
         ></div>
         <div 
            className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[80px] opacity-20"
            style={{ background: `radial-gradient(circle, ${primary}, transparent 70%)` }}
         ></div>
         <svg className="absolute bottom-0 left-0 w-full opacity-30" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path 
               fill={primary} 
               fillOpacity="0.1" 
               d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
         </svg>
      </div>

      {/* ================= LOGIN CARD ================= */}
      <div className="relative z-10 w-full max-w-[420px] p-6">
         <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden relative">
            <div 
               className="h-2 w-full absolute top-0 left-0"
               style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
            ></div>

            <div className="p-8 md:p-10">
               <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white shadow-lg mb-6 ring-1 ring-slate-100 transform hover:scale-105 transition-transform duration-300">
                     {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                     ) : (
                        <div 
                           className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
                           style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                        >
                           DM
                        </div>
                     )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">تسجيل الدخول</h1>
                  <p className="text-slate-500 text-sm mt-2">المنطقة الآمنة - يرجى التحقق من الهوية</p>
               </div>

               <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                  
                  {error && (
                     <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 mb-4">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <span className="text-xs font-bold text-red-600">{error}</span>
                     </div>
                  )}
                  
                  {successMsg && (
                     <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 mb-4 shadow-sm">
                        <div className="bg-green-100 p-1.5 rounded-full shrink-0">
                           <Send size={16} className="text-green-600" />
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-green-800 mb-1">تم إرسال البيانات</h4>
                           <p className="text-xs font-medium text-green-700 leading-snug whitespace-pre-line">{successMsg}</p>
                        </div>
                     </div>
                  )}

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-600 mr-1">اسم المستخدم</label>
                     <div className={`relative group transition-all duration-300 ${focusedField === 'username' ? 'scale-[1.01]' : ''}`}>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                           <User size={20} className="transition-colors duration-300" style={{ color: focusedField === 'username' || username ? primary : '#94a3b8' }} />
                        </div>
                        <input
                           type="text"
                           id="username_field"
                           name="username_field" 
                           autoComplete="off"
                           value={username}
                           onChange={e => setUsername(e.target.value)}
                           onFocus={() => setFocusedField('username')}
                           onBlur={() => setFocusedField(null)}
                           className="block w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-sm text-sm font-medium"
                           style={{ borderColor: focusedField === 'username' ? primary : undefined }}
                           placeholder="أدخل اسم المستخدم"
                           required
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600 mr-1">كلمة المرور</label>
                        <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold hover:underline" style={{ color: secondary }}>
                           هل نسيت كلمة المرور؟
                        </button>
                     </div>
                     <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                           <Lock size={20} className="transition-colors duration-300" style={{ color: focusedField === 'password' || password ? primary : '#94a3b8' }} />
                        </div>
                        <input
                           type="password"
                           id="password_field"
                           name="password_field"
                           autoComplete="new-password"
                           value={password}
                           onChange={e => setPassword(e.target.value)}
                           onFocus={() => setFocusedField('password')}
                           onBlur={() => setFocusedField(null)}
                           className="block w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-sm text-sm font-medium"
                           style={{ borderColor: focusedField === 'password' ? primary : undefined }}
                           placeholder="أدخل كلمة المرور"
                           required
                        />
                     </div>
                  </div>

                  <div className="flex items-center pt-2">
                     <label className="relative inline-flex items-center cursor-pointer select-none group">
                        <input 
                           type="checkbox" 
                           className="sr-only peer"
                           checked={rememberMe}
                           onChange={e => setRememberMe(e.target.checked)}
                        />
                        <div className="w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 peer-checked:border-transparent" style={{ borderColor: '#cbd5e1', backgroundColor: rememberMe ? primary : 'transparent' }}>
                           <Check size={14} className={`text-white transition-transform ${rememberMe ? 'scale-100' : 'scale-0'}`} />
                        </div>
                        <span className="mr-3 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">تذكر تسجيلي (24 ساعة)</span>
                     </label>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group"
                     style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                     <span className="relative flex items-center gap-2">
                        {loading ? (
                           <>جاري التحقق <Loader2 className="animate-spin" size={18} /></>
                        ) : (
                           <>تسجيل الدخول <ArrowRight size={18} /></>
                        )}
                     </span>
                  </button>
               </form>

               {isBiometricEnabled && (
                  <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                     <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">أو سجل الدخول باستخدام</p>
                     <button 
                        onClick={handleBiometric}
                        className="inline-flex items-center justify-center p-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all hover:scale-110 active:scale-95"
                        title="الدخول بالبصمة"
                     >
                        <Fingerprint size={24} style={{ color: primary }} />
                     </button>
                  </div>
               )}
            </div>
         </div>

         <div className="text-center mt-8 opacity-70">
            <p className="text-xs font-medium text-slate-500">
               نظام آمن © {new Date().getFullYear()} {settings.agencyName}
            </p>
         </div>
      </div>
    </div>
  );
};
