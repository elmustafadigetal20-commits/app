
export type Currency = 'SAR' | 'EGP';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export enum ServiceType {
  ADS_SOCIAL = 'Ads (Social Media)',
  ADS_GOOGLE = 'Ads (Google)',
  WEB_DESIGN = 'Web Design',
  SEO = 'SEO & Maintenance',
  FIELD_SERVICE = 'Field Services',
}

export enum OrderStatus {
  PENDING = 'قيد الانتظار',
  IN_PROGRESS = 'جارٍ التنفيذ',
  ACTIVE = 'نشطة',
  COMPLETED = 'منتهية',
  CANCELLED = 'ملغاة',
}

export interface MonthlyPayment {
  month: string; // YYYY-MM
  isPaid: boolean;
  paidDate?: string;
  amount: number;
  invoiceId?: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
  isMonthly: boolean; 
  currency: Currency;
  joinedDate: string;
  notes?: string;
  // New: Configuration for monthly ad clients
  monthlyConfig?: {
    monthlyFee: number;
    paymentDay?: number; // 1-31
    paymentHistory: MonthlyPayment[];
  }
}

export interface Order {
  id: string;
  clientId: string;
  serviceType: ServiceType;
  platform?: string; 
  targetPhone?: string;
  targetRegions?: string; 
  adText?: string;
  budget?: number;
  currency: Currency;
  startDate?: string;
  endDate?: string;
  domainName?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  orderId?: string;
  amount: number;
  currency: Currency;
  dueDate: string;
  isPaid: boolean;
  items: { description: string; cost: number }[];
  createdAt: string;
}

export interface SiteProject {
  id: string;
  clientId: string;
  domainName: string;
  serviceName: string; // e.g., "SEO & Hosting"
  thirdPartyCost: number; // Cost paid to providers (backlinks, hosting)
  monthlyFee: number; // Agency profit
  paymentDay?: number; // 1-31
  currency: Currency;
  status: 'Active' | 'Inactive' | 'Development';
  paymentHistory: MonthlyPayment[];
  notes?: string;
}

export interface AppSettings {
  agencyName: string;
  agencyPhone: string;
  agencyAddress: string;
  logoUrl?: string; 
  darkMode: boolean;
  taxNumber?: string;
  footerText?: string;
  enableBiometric?: boolean;
  primaryColor?: string; // Hex code for primary brand color
  secondaryColor?: string; // Hex code for secondary accent color
  
  // Bank Details
  bankName?: string;
  bankAccount?: string; // IBAN or Account Number
  bankBeneficiary?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeCampaigns: number;
  revenueSAR: number;
  revenueEGP: number;
  pendingInvoicesCount: number;
}
