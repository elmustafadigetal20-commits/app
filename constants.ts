
import { Client, Currency, Order, OrderStatus, ServiceType, Invoice } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    companyName: 'مؤسسة الرياض للتجارة',
    contactName: 'أحمد السديري',
    phone: '+966500000000',
    email: 'ahmed@riyadhtrading.com',
    isMonthly: true,
    currency: 'SAR',
    joinedDate: '2025-01-15',
    notes: 'عميل مميز - باقة ذهبية',
    monthlyConfig: {
      monthlyFee: 5000,
      paymentDay: 1,
      paymentHistory: []
    }
  },
  {
    id: 'c2',
    companyName: 'مطعم الكوثر - القاهرة',
    contactName: 'محمود المصري',
    phone: '+201000000000',
    email: 'mahmoud@alkawthar.com',
    isMonthly: false,
    currency: 'EGP',
    joinedDate: '2025-02-20',
    address: 'مدينة نصر، القاهرة',
  },
  {
    id: 'c3',
    companyName: 'شركة النقل السريع',
    contactName: 'خالد العتيبي',
    phone: '+966555555555',
    email: 'khaled@transport.sa',
    isMonthly: true,
    currency: 'SAR',
    joinedDate: '2025-03-10',
    monthlyConfig: {
      monthlyFee: 3000,
      paymentDay: 15,
      paymentHistory: []
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    clientId: 'c1',
    serviceType: ServiceType.ADS_SOCIAL,
    platform: 'TikTok',
    budget: 5000,
    currency: 'SAR',
    status: OrderStatus.ACTIVE,
    createdAt: '2025-10-01',
    adText: 'خصم 50% لنهاية العام',
  },
  {
    id: 'o2',
    clientId: 'c2',
    serviceType: ServiceType.WEB_DESIGN,
    domainName: 'alkawthar-food.com',
    budget: 15000,
    currency: 'EGP',
    status: OrderStatus.IN_PROGRESS,
    createdAt: '2025-10-05',
  },
  {
    id: 'o3',
    clientId: 'c3',
    serviceType: ServiceType.SEO,
    budget: 2000,
    currency: 'SAR',
    status: OrderStatus.ACTIVE,
    createdAt: '2025-09-15',
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    clientId: 'c1',
    orderId: 'o1',
    amount: 5000,
    currency: 'SAR',
    dueDate: '2025-11-01',
    isPaid: false,
    items: [{ description: 'إدارة حملة تيك توك - شهر أكتوبر', cost: 5000 }],
    createdAt: '2025-10-01',
  },
  {
    id: 'inv-002',
    clientId: 'c2',
    orderId: 'o2',
    amount: 7500,
    currency: 'EGP',
    dueDate: '2025-10-15',
    isPaid: true,
    items: [{ description: 'دفعة أولى - تصميم موقع', cost: 7500 }],
    createdAt: '2025-10-05',
  }
];

export const SERVICE_OPTIONS = Object.values(ServiceType);
export const PLATFORM_OPTIONS = ['Facebook', 'Instagram', 'Snapchat', 'TikTok', 'Google Search', 'YouTube', 'LinkedIn'];
export const CURRENCY_OPTIONS: Currency[] = ['SAR', 'EGP'];
