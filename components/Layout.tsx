
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Search,
  Bell,
  LogOut,
  Globe,
  ChevronLeft,
  CalendarCheck,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../services/dataContext';
import { useAuth } from '../services/authContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { settings, notifications, markNotificationRead, dbError } = useData();
  const { logout } = useAuth();
  
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
    { id: 'clients', label: 'قاعدة العملاء', icon: <Users size={20} /> },
    { id: 'monthly-ads', label: 'اشتراكات الإعلانات', icon: <CalendarCheck size={20} /> },
    { id: 'orders', label: 'الطلبات والمشاريع', icon: <ShoppingCart size={20} /> },
    { id: 'webseo', label: 'المواقع و SEO', icon: <Globe size={20} /> },
    { id: 'invoices', label: 'الفواتير والمالية', icon: <FileText size={20} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden font-sans transition-colors duration-200 flex-col">
      
      {/* Database Error Banner */}
      {dbError && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 z-[1000] shadow-lg">
           <AlertTriangle size={18} />
           <span>{dbError}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Overlay (Mobile & Tablet Portrait when open) */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Dark Blue Theme enforced */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 w-72 bg-slate-900 text-white z-50 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none flex flex-col border-l border-slate-800
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 flex justify-between items-center mb-2 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3 w-full">
              {settings.logoUrl ? (
                  <div className="w-full h-16 flex items-center justify-center overflow-hidden">
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain filter drop-shadow-md" />
                  </div>
              ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
                      DM
                    </div>
                    <div>
                      <span className="font-bold text-xl text-white block leading-tight">{settings.agencyName.split(' ')[0] || 'DigiManager'}</span>
                      <span className="text-xs text-slate-400 font-medium">لوحة الإدارة</span>
                    </div>
                  </div>
              )}
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white absolute left-4 top-6">
              <X size={20} />
            </button>
          </div>

          <nav className="px-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar mt-6">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">القائمة الرئيسية</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm group
                  ${currentPage === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`${currentPage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {currentPage === item.id && <ChevronLeft size={16} className="text-white/80" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50 mt-auto shrink-0">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors font-medium text-sm">
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 relative">
          
          {/* Mobile/Tablet Header */}
          <div className="lg:hidden bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-between items-center z-[999] relative shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg">
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{settings.agencyName}</h1>
            </div>
            
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 p-2 rounded-full relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
              </button>
              {notifOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 ring-1 ring-black/5">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200">الإشعارات</div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 && <p className="p-4 text-center text-xs text-slate-400">لا توجد إشعارات</p>}
                        {notifications.map(n => (
                          <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 border-b border-slate-50 dark:border-slate-700 text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <p className="text-xs font-bold text-slate-800 dark:text-white mb-1">{n.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                          </div>
                        ))}
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* Desktop Header */}
          <header className="hidden lg:flex bg-white dark:bg-slate-800 h-20 border-b border-slate-200 dark:border-slate-700 items-center justify-between px-8 z-[999] shrink-0 relative">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                {navItems.find(n => n.id === currentPage)?.label}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="relative w-full max-w-xs xl:max-w-sm group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث عام..." 
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              
              {/* Desktop Notification */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`relative transition-colors p-2 rounded-full ${notifOpen ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute left-0 top-full mt-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                        <span className="font-bold text-slate-800 dark:text-white">الإشعارات ({unreadCount})</span>
                        <span className="text-xs text-blue-600 cursor-pointer hover:underline">مسح الكل</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                              <Bell size={32} className="mb-2 opacity-20" />
                              <p className="text-sm">لا توجد إشعارات جديدة</p>
                            </div>
                        )}
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-4 border-b border-slate-50 dark:border-slate-700/50 text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                          >
                              <div className="flex justify-between items-start mb-1">
                                <p className={`text-sm font-bold ${!n.read ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                                <span className="text-[10px] text-slate-400">{n.date}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
                {/* Display Agency Name Text instead of Avatar/Logo */}
                <span className="font-bold text-slate-700 dark:text-white text-sm hidden lg:block">
                    {settings.agencyName || 'DigiManager Agency'}
                </span>
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 custom-scrollbar relative z-0">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1] opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
            </div>
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
