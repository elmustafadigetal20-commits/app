
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Order, Invoice, DashboardStats, OrderStatus, SiteProject, AppSettings, MonthlyPayment, Notification } from '../types';
import { INITIAL_CLIENTS, INITIAL_ORDERS, INITIAL_INVOICES } from '../constants';
import { useAuth } from './authContext';

interface DataContextType {
  clients: Client[];
  orders: Order[];
  invoices: Invoice[];
  siteProjects: SiteProject[];
  settings: AppSettings;
  stats: DashboardStats;
  notifications: Notification[];
  
  // Actions
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  markAdMonthPaid: (clientId: string, month: string) => void;
  revertAdMonthPayment: (clientId: string, month: string) => void; 
  
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  
  addInvoice: (invoice: Invoice) => void;
  toggleInvoicePaid: (id: string) => void;
  
  addSiteProject: (site: SiteProject) => void;
  updateSiteProject: (site: SiteProject) => void;
  markMonthPaid: (siteId: string, month: string) => void; 
  revertSiteMonthPayment: (siteId: string, month: string) => void; // New function
  
  updateSettings: (settings: AppSettings) => void;
  toggleTheme: () => void;
  markNotificationRead: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_SETTINGS: AppSettings = {
  agencyName: 'DigiManager Agency',
  agencyPhone: '+966 50 000 0000',
  agencyAddress: 'الرياض، المملكة العربية السعودية',
  darkMode: false,
  taxNumber: '300000000000003',
  footerText: 'شكرًا لتعاملكم معنا',
  enableBiometric: false,
  primaryColor: '#2563eb', // Default Blue 600
  secondaryColor: '#4f46e5', // Default Indigo 600
  
  // Defaults for Bank
  bankName: 'البنك الأهلي / الراجحي',
  bankAccount: 'SA00 0000 0000 0000 0000',
  bankBeneficiary: 'DigiManager Agency'
};

// --- Color Helpers ---

// Convert Hex to RGB object
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Mix color with white (tint) or black (shade)
const mix = (color: {r: number, g: number, b: number}, mixColor: {r: number, g: number, b: number}, weight: number) => {
  return {
    r: Math.round(color.r * (1 - weight) + mixColor.r * weight),
    g: Math.round(color.g * (1 - weight) + mixColor.g * weight),
    b: Math.round(color.b * (1 - weight) + mixColor.b * weight)
  };
};

const updateCssVariables = (prefix: string, baseHex: string) => {
  const baseRgb = hexToRgb(baseHex);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  
  // Tailwind palette weights approximation
  const palette = {
    50: mix(baseRgb, white, 0.95),
    100: mix(baseRgb, white, 0.9),
    200: mix(baseRgb, white, 0.75),
    300: mix(baseRgb, white, 0.6),
    400: mix(baseRgb, white, 0.3),
    500: mix(baseRgb, white, 0.1), // Base-ish
    600: baseRgb, // Using user selection as 600 (Main)
    700: mix(baseRgb, black, 0.15),
    800: mix(baseRgb, black, 0.3),
    900: mix(baseRgb, black, 0.45),
    950: mix(baseRgb, black, 0.6),
  };

  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--color-${prefix}-${key}`, `${value.r} ${value.g} ${value.b}`);
  });
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [siteProjects, setSiteProjects] = useState<SiteProject[]>([]);
  
  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('digi_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const { enableBiometric, isBiometricEnabled } = useAuth();

  // --- Auto Cleanup: Delete Paid Invoices > 3 Months Old ---
  useEffect(() => {
    setInvoices(currentInvoices => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const filtered = currentInvoices.filter(inv => {
        // Rule 1: Always keep unpaid invoices (regardless of age)
        if (!inv.isPaid) return true;
        
        // Rule 2: For paid invoices, check createdAt date
        // If createdAt is missing, assume it's new and keep it
        if (!inv.createdAt) return true;

        const createdDate = new Date(inv.createdAt);
        // Keep only if created within the last 90 days
        return createdDate >= ninetyDaysAgo;
      });

      if (filtered.length < currentInvoices.length) {
        console.log(`System Cleanup: Removed ${currentInvoices.length - filtered.length} old paid invoices.`);
      }
      
      return filtered;
    });
  }, []); // Empty dependency array ensures this runs only once on app startup

  // Sync Biometric Setting with Auth Context
  useEffect(() => {
     setSettings(prev => ({ ...prev, enableBiometric: isBiometricEnabled }));
  }, [isBiometricEnabled]);

  // Apply theme class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Apply Colors
  useEffect(() => {
    updateCssVariables('primary', settings.primaryColor || '#2563eb');
    updateCssVariables('secondary', settings.secondaryColor || '#4f46e5');
  }, [settings.primaryColor, settings.secondaryColor]);

  // Generate Notifications Logic
  useEffect(() => {
    const generated: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // 1. Pending Invoices (Overdue or Due Soon)
    invoices.forEach(inv => {
      if (!inv.isPaid) {
         const dueDate = new Date(inv.dueDate);
         dueDate.setHours(0,0,0,0);
         
         const diffTime = dueDate.getTime() - today.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

         if (diffDays < 0) {
            generated.push({
              id: `overdue-inv-${inv.id}`,
              title: 'فاتورة متأخرة',
              message: `الفاتورة #${inv.id} مستحقة منذ ${Math.abs(diffDays)} يوم.`,
              date: todayStr,
              read: false,
              type: 'error'
            });
         } else if (diffDays <= 3) {
            generated.push({
              id: `due-inv-${inv.id}`,
              title: 'فاتورة مستحقة قريباً',
              message: `الفاتورة #${inv.id} تستحق ${diffDays === 0 ? 'اليوم' : `خلال ${diffDays} يوم`}.`,
              date: todayStr,
              read: false,
              type: 'warning'
            });
         }
      }
    });

    // 2. Active Orders Summary
    const activeOrders = orders.filter(o => o.status === OrderStatus.ACTIVE).length;
    if (activeOrders > 0) {
      // Only add if not exists
      generated.push({
        id: `notif-active-orders-${todayStr}`,
        title: 'نشاط النظام',
        message: `هناك ${activeOrders} حملات إعلانية نشطة حاليًا.`,
        date: todayStr,
        read: false,
        type: 'info'
      });
    }

    // 3. Monthly Subscription Reminders (3 Days before)
    clients.forEach(client => {
      if (client.isMonthly && client.monthlyConfig?.paymentDay) {
        
        const paymentDay = client.monthlyConfig.paymentDay;
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11
        
        // Determine target date.
        let targetDueDate = new Date(currentYear, currentMonth, paymentDay);
        
        if (targetDueDate < today) {
           targetDueDate = new Date(currentYear, currentMonth + 1, paymentDay);
        }

        // Calculate diff in days
        const diffTime = targetDueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Logic: Notify if due within 0-3 days
        if (diffDays >= 0 && diffDays <= 3) {
           const targetMonthStr = `${targetDueDate.getFullYear()}-${String(targetDueDate.getMonth() + 1).padStart(2, '0')}`;
           
           // Check if paid
           const isPaid = client.monthlyConfig.paymentHistory?.find(p => p.month === targetMonthStr)?.isPaid;
           
           if (!isPaid) {
              generated.push({
                id: `sub-due-${client.id}-${targetMonthStr}`,
                title: 'استحقاق اشتراك شهري',
                message: `اشتراك "${client.companyName}" يستحق الدفع ${diffDays === 0 ? 'اليوم' : `خلال ${diffDays} أيام`} (يوم ${paymentDay}).`,
                date: todayStr,
                read: false,
                type: 'warning'
              });
           }
        }
      }
    });

    setNotifications(prev => {
       // Merge logic: Add new ones, keep read status of existing ones
       const manualNotifications = prev.filter(n => !n.id.startsWith('sub-due-') && !n.id.startsWith('due-inv-') && !n.id.startsWith('overdue-inv-') && !n.id.startsWith('notif-active-'));
       
       const merged = [...manualNotifications];
       
       generated.forEach(gen => {
          const existing = prev.find(p => p.id === gen.id);
          merged.push(existing ? { ...gen, read: existing.read } : gen);
       });
       
       return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, [invoices, orders, clients]);

  const stats: DashboardStats = {
    totalClients: clients.length,
    activeCampaigns: orders.filter(o => o.status === OrderStatus.ACTIVE).length,
    revenueSAR: invoices.filter(i => i.isPaid && i.currency === 'SAR').reduce((acc, curr) => acc + curr.amount, 0),
    revenueEGP: invoices.filter(i => i.isPaid && i.currency === 'EGP').reduce((acc, curr) => acc + curr.amount, 0),
    pendingInvoicesCount: invoices.filter(i => !i.isPaid).length,
  };

  const addClient = (client: Client) => setClients(prev => [client, ...prev]);
  const updateClient = (updatedClient: Client) => setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const markAdMonthPaid = (clientId: string, month: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId || !client.monthlyConfig) return client;

      const fee = client.monthlyConfig.monthlyFee;
      
      const history = client.monthlyConfig.paymentHistory || []; // Safety check
      const existingPayment = history.find(p => p.month === month);
      
      if (existingPayment?.isPaid) return client;

      const newInvoiceId = `INV-AD-${Date.now().toString().substr(-6)}`;
      const newInvoice: Invoice = {
        id: newInvoiceId,
        clientId: client.id,
        amount: fee,
        currency: client.currency,
        dueDate: new Date().toISOString().split('T')[0],
        isPaid: true,
        items: [
          { description: `اشتراك تسويق شهري (${month})`, cost: fee },
        ],
        createdAt: new Date().toISOString().split('T')[0]
      };
      addInvoice(newInvoice);

      const newPayment: MonthlyPayment = {
        month,
        isPaid: true,
        paidDate: new Date().toISOString().split('T')[0],
        amount: fee,
        invoiceId: newInvoiceId
      };

      const updatedHistory = history.filter(p => p.month !== month);
      updatedHistory.push(newPayment);

      return { 
        ...client, 
        monthlyConfig: {
          ...client.monthlyConfig,
          paymentHistory: updatedHistory
        }
      };
    }));
  };

  const revertAdMonthPayment = (clientId: string, month: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId || !client.monthlyConfig) return client;
      
      const history = client.monthlyConfig.paymentHistory || [];
      const payment = history.find(p => p.month === month);

      if (!payment) return client;

      // 1. Remove the invoice if it exists
      if (payment.invoiceId) {
        setInvoices(currentInvoices => currentInvoices.filter(inv => inv.id !== payment.invoiceId));
      }

      // 2. Remove the payment from history
      const updatedHistory = history.filter(p => p.month !== month);

      return { 
        ...client, 
        monthlyConfig: {
          ...client.monthlyConfig,
          paymentHistory: updatedHistory
        }
      };
    }));
  };

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const updateOrder = (updatedOrder: Order) => setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

  const addInvoice = (invoice: Invoice) => setInvoices(prev => [invoice, ...prev]);
  const toggleInvoicePaid = (id: string) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, isPaid: !inv.isPaid } : inv));

  const addSiteProject = (site: SiteProject) => setSiteProjects(prev => [site, ...prev]);
  const updateSiteProject = (site: SiteProject) => setSiteProjects(prev => prev.map(s => s.id === site.id ? site : s));

  const markMonthPaid = (siteId: string, month: string) => {
    setSiteProjects(prev => prev.map(site => {
      if (site.id !== siteId) return site;

      const totalAmount = site.monthlyFee + site.thirdPartyCost;
      
      const existingPayment = site.paymentHistory.find(p => p.month === month);
      if (existingPayment?.isPaid) return site;

      const newInvoiceId = `INV-SITE-${Date.now().toString().substr(-6)}`;
      const newInvoice: Invoice = {
        id: newInvoiceId,
        clientId: site.clientId,
        amount: totalAmount,
        currency: site.currency,
        dueDate: new Date().toISOString().split('T')[0],
        isPaid: true,
        items: [
          { description: `اشتراك شهري (${month}) - ${site.serviceName}`, cost: site.monthlyFee },
          { description: `تكاليف خدمات/شراء (${month})`, cost: site.thirdPartyCost },
        ],
        createdAt: new Date().toISOString().split('T')[0]
      };
      addInvoice(newInvoice);

      const newPayment: MonthlyPayment = {
        month,
        isPaid: true,
        paidDate: new Date().toISOString().split('T')[0],
        amount: totalAmount,
        invoiceId: newInvoiceId
      };

      const updatedHistory = site.paymentHistory.filter(p => p.month !== month);
      updatedHistory.push(newPayment);

      return { ...site, paymentHistory: updatedHistory };
    }));
  };

  const revertSiteMonthPayment = (siteId: string, month: string) => {
    setSiteProjects(prev => prev.map(site => {
      if (site.id !== siteId) return site;
      
      const payment = site.paymentHistory.find(p => p.month === month);
      if (!payment) return site;

      // 1. Remove Invoice
      if (payment.invoiceId) {
        setInvoices(currentInvoices => currentInvoices.filter(inv => inv.id !== payment.invoiceId));
      }

      // 2. Remove from history
      return {
        ...site,
        paymentHistory: site.paymentHistory.filter(p => p.month !== month)
      };
    }));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('digi_settings', JSON.stringify(newSettings));
    
    // Also update auth context biometric setting if changed
    if (newSettings.enableBiometric !== undefined) {
      enableBiometric(newSettings.enableBiometric);
    }
  };
  
  const toggleTheme = () => {
    setSettings(prev => {
      const next = { ...prev, darkMode: !prev.darkMode };
      localStorage.setItem('digi_settings', JSON.stringify(next));
      return next;
    });
  };
  
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <DataContext.Provider value={{
      clients, orders, invoices, siteProjects, settings, stats, notifications,
      addClient, updateClient, deleteClient, markAdMonthPaid, revertAdMonthPayment,
      addOrder, updateOrder,
      addInvoice, toggleInvoicePaid,
      addSiteProject, updateSiteProject, markMonthPaid, revertSiteMonthPayment,
      updateSettings, toggleTheme, markNotificationRead
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
