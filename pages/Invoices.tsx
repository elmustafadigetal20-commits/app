
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Card, Button, Input, Select, Badge, Modal } from '../components/Shared';
import { Printer, Check, Plus, Search, Send, FileText, AlertCircle, CreditCard, Calendar, User, Download } from 'lucide-react';
import { Invoice, Currency } from '../types';
import { CURRENCY_OPTIONS } from '../constants';

export const Invoices: React.FC = () => {
  const { invoices, clients, addInvoice, toggleInvoicePaid, settings } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // State for new invoice form
  const [newInvoice, setNewInvoice] = useState<{
    clientId: string;
    amount: number;
    currency: Currency;
    description: string;
    dueDate: string;
  }>({
    clientId: '',
    amount: 0,
    currency: 'SAR',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const getClientName = (id: string) => clients.find(c => c.id === id)?.companyName || 'Unknown';
  const getClient = (id: string) => clients.find(c => c.id === id);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0); 
  const totalCollected = invoices.filter(i => i.isPaid).reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter(i => !i.isPaid).reduce((sum, inv) => sum + inv.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'paid' ? inv.isPaid 
      : !inv.isPaid;
    
    const clientName = getClientName(inv.clientId).toLowerCase();
    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const inv: Invoice = {
      id: `INV-${Date.now().toString().substr(-6)}`,
      clientId: newInvoice.clientId,
      amount: newInvoice.amount,
      currency: newInvoice.currency,
      dueDate: newInvoice.dueDate,
      isPaid: false,
      items: [{ description: newInvoice.description, cost: newInvoice.amount }],
      createdAt: new Date().toISOString().split('T')[0],
    };
    addInvoice(inv);
    setIsModalOpen(false);
  };

  // --- ROBUST PDF GENERATION: POPUP WINDOW ---
  const handleDownloadPDF = async () => {
    if (!selectedInvoice) return;
    setIsDownloading(true);

    try {
        const client = getClient(selectedInvoice.clientId);
        
        // Open new window
        const printWindow = window.open('', '_blank', 'width=1200,height=1200');
        if (!printWindow) {
            alert("يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة.");
            setIsDownloading(false);
            return;
        }

        // Generate HTML Content manually to ensure isolation
        const htmlContent = `
          <html dir="rtl" lang="ar">
            <head>
              <title>Invoice #${selectedInvoice.id}</title>
              <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
              <style>
                *, *::before, *::after { box-sizing: border-box; }
                body { 
                    margin: 0; 
                    padding: 0; 
                    background: #e2e8f0; 
                    font-family: 'Tajawal', sans-serif; 
                    -webkit-font-smoothing: antialiased;
                    display: flex;
                    justify-content: center;
                    padding-top: 20px;
                }
                
                /* A4 Container */
                .page {
                    width: 210mm;
                    height: 296mm; /* Fixed height for consistency */
                    padding: 0;
                    background: white;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Print Styles */
                @media print {
                  body { background: white; padding: 0; display: block; }
                  .page { width: 100%; height: 100%; margin: 0; box-shadow: none; page-break-after: avoid; page-break-inside: avoid; }
                  
                  /* Force Background Colors */
                  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }

                /* --- Design Variables --- */
                :root {
                    --primary: ${settings.primaryColor || '#2563eb'};
                    --secondary: ${settings.secondaryColor || '#1e293b'};
                    --accent: #f8fafc;
                    --text: #334155;
                }

                /* --- Header Section --- */
                .header {
                    background: var(--primary);
                    color: white;
                    padding: 40px 50px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
                    height: 180px;
                }
                
                .brand-section { display: flex; align-items: center; gap: 20px; }
                .logo-box { 
                    background: white; 
                    padding: 10px; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    height: 80px;
                    width: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .brand-text h1 { font-size: 24px; font-weight: 800; margin: 0; line-height: 1.2; }
                .brand-text p { font-size: 12px; opacity: 0.9; margin: 0; }

                .invoice-title { text-align: left; }
                .invoice-title h2 { font-size: 48px; font-weight: 900; margin: 0; letter-spacing: 2px; opacity: 0.2; line-height: 1; }
                .invoice-title h3 { font-size: 24px; font-weight: 700; margin: -15px 0 0 0; color: white; }

                /* --- Body Content --- */
                .content-wrapper {
                    padding: 20px 50px;
                    flex: 1; /* Pushes footer down */
                    display: flex;
                    flex-direction: column;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .info-card {
                    background: #f8fafc;
                    border-right: 4px solid var(--primary);
                    padding: 20px;
                    border-radius: 8px;
                }
                
                .info-label { font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                .info-value { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
                .info-sub { font-size: 13px; color: #475569; }

                .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
                .meta-row:last-child { border: none; margin: 0; padding: 0; }

                /* --- Table --- */
                .table-container { margin-bottom: auto; /* Push content below it */ }
                
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                thead th {
                    background: #1e293b;
                    color: white;
                    padding: 15px 20px;
                    font-size: 12px;
                    font-weight: bold;
                    text-align: right;
                }
                thead th:first-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
                thead th:last-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; text-align: left; }
                
                tbody td {
                    padding: 20px;
                    border-bottom: 1px solid #e2e8f0;
                    color: #334155;
                    font-size: 14px;
                    font-weight: 500;
                }
                tbody tr:last-child td { border-bottom: 2px solid #1e293b; }

                /* --- Totals & Payment --- */
                .bottom-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-top: 40px;
                    margin-bottom: 40px;
                }

                .payment-info {
                    width: 50%;
                }
                .payment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 15px; color: var(--primary); font-weight: bold; }
                .bank-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 15px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .bank-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; color: #475569; }
                .iban-box { 
                    background: #f1f5f9; 
                    padding: 8px; 
                    border-radius: 6px; 
                    font-family: monospace; 
                    text-align: center; 
                    font-weight: bold; 
                    color: #1e293b;
                    margin-top: 5px;
                }

                .totals-info { width: 40%; }
                .total-line { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: #64748b; }
                .grand-total-box {
                    background: var(--primary);
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                    margin-top: 15px;
                }
                .gt-label { font-size: 14px; font-weight: bold; opacity: 0.9; }
                .gt-value { font-size: 24px; font-weight: 900; }

                /* --- Footer --- */
                .footer-strip {
                    background: #1e293b;
                    color: #94a3b8;
                    padding: 15px 50px;
                    font-size: 11px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: auto; /* Fix to bottom */
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    background: ${selectedInvoice.isPaid ? '#dcfce7' : '#fef3c7'};
                    color: ${selectedInvoice.isPaid ? '#166534' : '#d97706'};
                    border: 1px solid ${selectedInvoice.isPaid ? '#bbf7d0' : '#fde68a'};
                }

              </style>
            </head>
            <body>
              <div class="page">
                
                <div class="header">
                    <div class="brand-section">
                        ${settings.logoUrl 
                          ? `<div class="logo-box"><img src="${settings.logoUrl}" style="width:100%; height:100%; object-fit:contain;" /></div>` 
                          : `<div class="logo-box" style="font-size:24px; color:var(--primary); font-weight:bold;">DM</div>`
                        }
                        <div class="brand-text">
                            <h1>${settings.agencyName}</h1>
                            <p>${settings.agencyAddress}</p>
                        </div>
                    </div>
                    <div class="invoice-title">
                        <h2>INVOICE</h2>
                        <h3>فاتورة ضريبية</h3>
                    </div>
                </div>

                <div class="content-wrapper">
                    
                    <div class="info-grid">
                        <!-- Client Info -->
                        <div class="info-card">
                            <div class="info-label">فاتورة إلى (Bill To)</div>
                            <div class="info-value">${client?.companyName}</div>
                            <div class="info-sub">${client?.contactName}</div>
                            <div class="info-sub" style="direction: ltr; text-align: right;">${client?.phone}</div>
                            <div class="info-sub">${client?.address || ''}</div>
                        </div>

                        <!-- Invoice Meta -->
                        <div class="info-card" style="background: white; border-right: none; border: 1px solid #e2e8f0;">
                            <div class="meta-row">
                                <span class="info-label">رقم الفاتورة</span>
                                <span class="info-value">#${selectedInvoice.id.replace('INV-', '')}</span>
                            </div>
                            <div class="meta-row">
                                <span class="info-label">تاريخ الإصدار</span>
                                <span class="info-value">${selectedInvoice.createdAt}</span>
                            </div>
                            <div class="meta-row">
                                <span class="info-label">تاريخ الاستحقاق</span>
                                <span class="info-value">${selectedInvoice.dueDate}</span>
                            </div>
                            <div class="meta-row" style="align-items: center;">
                                <span class="info-label">حالة الدفع</span>
                                <span class="status-badge">${selectedInvoice.isPaid ? 'تم الدفع' : 'مستحقة للدفع'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50%;">تفاصيل الخدمة / الوصف</th>
                                    <th style="text-align: center;">الكمية</th>
                                    <th>السعر الإفرادي</th>
                                    <th>المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedInvoice.items.map(item => `
                                    <tr>
                                        <td>${item.description}</td>
                                        <td style="text-align: center;">1</td>
                                        <td style="text-align: left;">${item.cost.toLocaleString()}</td>
                                        <td style="text-align: left; font-weight: bold;">${item.cost.toLocaleString()} <span style="font-size: 10px;">${selectedInvoice.currency}</span></td>
                                    </tr>
                                `).join('')}
                                <!-- Empty rows to fill space if needed visually -->
                                <tr><td colspan="4" style="border: none; padding: 10px;"></td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bottom-section">
                        <div class="payment-info">
                            <div class="payment-header">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                معلومات التحويل البنكي
                            </div>
                            <div class="bank-card">
                                <div class="bank-row">
                                    <span>اسم البنك</span>
                                    <strong>${settings.bankName}</strong>
                                </div>
                                <div class="bank-row">
                                    <span>اسم المستفيد</span>
                                    <strong>${settings.bankBeneficiary}</strong>
                                </div>
                                <div class="iban-box">${settings.bankAccount}</div>
                            </div>
                        </div>

                        <div class="totals-info">
                            <div class="total-line">
                                <span>المجموع الفرعي</span>
                                <span>${selectedInvoice.amount.toLocaleString()}</span>
                            </div>
                            <div class="total-line">
                                <span>الضريبة المضافة (0%)</span>
                                <span>0.00</span>
                            </div>
                            <div class="grand-total-box">
                                <span class="gt-label">الإجمالي النهائي</span>
                                <span class="gt-value">${selectedInvoice.amount.toLocaleString()} <small style="font-size: 14px; font-weight: normal;">${selectedInvoice.currency}</small></span>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="footer-strip">
                    <div>${settings.footerText || 'شكراً لثقتكم بنا'}</div>
                    <div style="font-family: monospace;">${settings.agencyPhone}  |  support@digimanager.com</div>
                </div>

              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 800);
                }
              </script>
            </body>
          </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();

    } catch (err) {
        console.error("PDF Error:", err);
        alert("حدث خطأ أثناء إعداد الفاتورة.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleSendEmail = () => {
    if (!selectedInvoice) return;
    const client = clients.find(c => c.id === selectedInvoice.clientId);
    const subject = `فاتورة رقم ${selectedInvoice.id} - ${settings.agencyName}`;
    const body = `مرحباً ${client?.contactName || 'عزيزي العميل'}،%0D%0A%0D%0Aمرفق الفاتورة رقم ${selectedInvoice.id} المستحقة بتاريخ ${selectedInvoice.dueDate}.%0D%0A%0D%0Aالمبلغ المستحق: ${selectedInvoice.amount} ${selectedInvoice.currency}%0D%0A%0D%0Aشكراً لتعاملكم معنا.%0D%0A${settings.agencyName}`;
    window.location.href = `mailto:${client?.email || ''}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* --- Main Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">الفواتير والمالية</h2>
           <p className="text-slate-500 mt-1">نظام إدارة الفواتير والتحصيلات المالية.</p>
        </div>
        <Button onClick={() => {
             setNewInvoice({
               clientId: clients[0]?.id || '',
               amount: 0,
               currency: 'SAR',
               description: '',
               dueDate: new Date().toISOString().split('T')[0]
             });
             setIsModalOpen(true);
        }} className="shadow-lg shadow-blue-600/20 w-full md:w-auto px-6 py-3">
          <Plus size={20} className="ml-2" />
          إصدار فاتورة جديدة
        </Button>
      </div>

      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="relative z-10 p-2">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 font-medium mb-1 text-sm opacity-80">إجمالي المفوتر</p>
                    <h3 className="text-3xl font-bold">{totalInvoiced.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg"><FileText size={24} className="text-white" /></div>
               </div>
               <div className="mt-4 text-xs text-blue-200">إجمالي قيمة جميع الفواتير الصادرة</div>
            </div>
         </Card>

         <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <div className="p-2">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 text-sm">تم التحصيل</p>
                    <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalCollected.toLocaleString()}</h3>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg"><Check size={24} className="text-emerald-600" /></div>
               </div>
               <div className="mt-4 text-xs text-slate-400">الدفعات المؤكدة والمستلمة</div>
            </div>
         </Card>

         <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 md:col-span-2 lg:col-span-1">
             <div className="p-2">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 text-sm">معلق (غير مدفوع)</p>
                    <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalPending.toLocaleString()}</h3>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg"><AlertCircle size={24} className="text-amber-600" /></div>
               </div>
               <div className="mt-4 text-xs text-slate-400">فواتير بانتظار السداد</div>
            </div>
         </Card>
      </div>

      {/* --- Invoices List --- */}
      <Card className="!p-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
         <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="بحث برقم الفاتورة أو اسم العميل..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
               />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
               <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>الكل</button>
               <button onClick={() => setFilterStatus('paid')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'paid' ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>مدفوعة</button>
               <button onClick={() => setFilterStatus('pending')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>معلقة</button>
            </div>
         </div>

         {/* --- Mobile/Tablet View (Cards) --- */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 xl:hidden bg-slate-50 dark:bg-slate-800/50">
            {filteredInvoices.map(inv => (
               <div key={inv.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${inv.isPaid ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <div className="flex justify-between items-start mb-3 pr-3">
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{getClientName(inv.clientId)}</h4>
                        <span className="text-xs text-slate-500 font-mono">#{inv.id}</span>
                     </div>
                     <Badge color={inv.isPaid ? 'green' : 'yellow'}>{inv.isPaid ? 'مدفوعة' : 'مستحقة'}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                     <div className="flex flex-col">
                        <span className="text-xs text-slate-400">المبلغ</span>
                        <span className="font-bold text-slate-800 dark:text-white">{inv.amount.toLocaleString()} <span className="text-[10px]">{inv.currency}</span></span>
                     </div>
                     <div className="flex flex-col text-left">
                        <span className="text-xs text-slate-400">الاستحقاق</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">{inv.dueDate}</span>
                     </div>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                     <Button variant="outline" className="text-xs py-1.5 h-8" onClick={() => setSelectedInvoice(inv)}>
                        <Printer size={14} className="ml-1" /> تفاصيل
                     </Button>
                     {!inv.isPaid && (
                        <Button variant="ghost" className="text-xs py-1.5 h-8 text-green-600 hover:bg-green-50" onClick={() => toggleInvoicePaid(inv.id)}>
                           <Check size={14} /> سداد
                        </Button>
                     )}
                  </div>
               </div>
            ))}
            {filteredInvoices.length === 0 && (
               <div className="col-span-full text-center py-8 text-slate-400">لا توجد فواتير</div>
            )}
         </div>

         {/* --- Desktop View (Table) --- */}
         <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="p-5">رقم الفاتورة</th>
                    <th className="p-5">العميل</th>
                    <th className="p-5">تاريخ الاستحقاق</th>
                    <th className="p-5">المبلغ</th>
                    <th className="p-5">الحالة</th>
                    <th className="p-5 text-left">إجراءات</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="p-5 font-mono text-slate-600 dark:text-slate-400 font-bold">{inv.id}</td>
                        <td className="p-5 font-bold text-slate-800 dark:text-white">{getClientName(inv.clientId)}</td>
                        <td className="p-5 text-slate-500">{inv.dueDate}</td>
                        <td className="p-5">
                           <span className="font-bold text-slate-900 dark:text-white text-base">{inv.amount.toLocaleString()}</span>
                           <span className="text-xs text-slate-400 mr-1">{inv.currency}</span>
                        </td>
                        <td className="p-5">
                           <Badge color={inv.isPaid ? 'green' : 'yellow'}>{inv.isPaid ? 'مدفوعة' : 'مستحقة'}</Badge>
                        </td>
                        <td className="p-5">
                           <div className="flex gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                              <button 
                                 onClick={() => setSelectedInvoice(inv)} 
                                 className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                                 title="طباعة / عرض"
                              >
                                 <Printer size={18} />
                              </button>
                              {!inv.isPaid && (
                                 <button 
                                    onClick={() => toggleInvoicePaid(inv.id)} 
                                    className="p-2 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                                    title="تسجيل كمدفوعة"
                                 >
                                    <Check size={18} />
                                 </button>
                              )}
                           </div>
                        </td>
                    </tr>
                ))}
                {filteredInvoices.length === 0 && (
                   <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">لا توجد فواتير مطابقة</td>
                   </tr>
                )}
                </tbody>
            </table>
         </div>
      </Card>

      {/* --- INVOICE PREVIEW MODAL --- */}
      {selectedInvoice && (
        <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="معاينة الفاتورة" maxWidth="max-w-4xl">
          
          {/* 
             Preview Container: Matches Print Style logic but scaled for screen
          */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
             
             {/* Header */}
             <div className="p-8 border-b-4 border-blue-600 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                   {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />
                   ) : (
                      <div className="h-14 w-14 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl">DM</div>
                   )}
                   <div>
                      <h2 className="text-xl font-bold text-slate-800">{settings.agencyName}</h2>
                      <p className="text-xs text-slate-500">{settings.agencyPhone}</p>
                   </div>
                </div>
                <div className="text-left">
                   <h1 className="text-4xl font-bold text-slate-200 tracking-widest leading-none">INVOICE</h1>
                   <p className="text-blue-600 font-bold text-sm">فاتورة ضريبية</p>
                </div>
             </div>

             {/* Meta Strip */}
             <div className="bg-slate-100 px-8 py-3 flex justify-between border-b border-slate-200">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">رقم الفاتورة</p>
                   <p className="text-sm font-bold text-slate-800">#{selectedInvoice.id}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">تاريخ الإصدار</p>
                   <p className="text-sm font-bold text-slate-800">{selectedInvoice.createdAt}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">الاستحقاق</p>
                   <p className="text-sm font-bold text-slate-800">{selectedInvoice.dueDate}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase">الحالة</p>
                   <Badge color={selectedInvoice.isPaid ? 'green' : 'yellow'}>{selectedInvoice.isPaid ? 'مدفوعة' : 'مستحقة'}</Badge>
                </div>
             </div>

             <div className="p-8">
                {/* Bill To */}
                <div className="flex justify-between mb-8">
                   <div className="w-1/2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2 border-b inline-block pb-1">فاتورة إلى</p>
                      <h3 className="text-xl font-bold text-slate-800">{getClientName(selectedInvoice.clientId)}</h3>
                      <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                         <p>{getClient(selectedInvoice.clientId)?.contactName}</p>
                         <p>{getClient(selectedInvoice.clientId)?.phone}</p>
                         <p>{getClient(selectedInvoice.clientId)?.address}</p>
                      </div>
                   </div>
                   <div className="w-1/2 text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2 border-b inline-block pb-1">من</p>
                      <h3 className="text-lg font-bold text-slate-800">{settings.agencyName}</h3>
                      <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                         <p>{settings.agencyAddress}</p>
                         <p>الرقم الضريبي: {settings.taxNumber}</p>
                      </div>
                   </div>
                </div>

                {/* Table */}
                <table className="w-full mb-8">
                   <thead>
                      <tr className="bg-blue-600 text-white text-sm">
                         <th className="py-2 px-4 text-right">الوصف</th>
                         <th className="py-2 px-4 text-center w-20">الكمية</th>
                         <th className="py-2 px-4 text-left">السعر</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm text-slate-700">
                      {selectedInvoice.items.map((item, i) => (
                         <tr key={i} className="border-b border-slate-100">
                            <td className="py-3 px-4 font-medium">{item.description}</td>
                            <td className="py-3 px-4 text-center text-slate-500">1</td>
                            <td className="py-3 px-4 text-left font-bold">{item.cost.toLocaleString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>

                {/* Footer Section */}
                <div className="flex flex-col md:flex-row justify-between gap-8">
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm flex-1">
                      <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                         <CreditCard size={16} /> معلومات السداد
                      </h4>
                      <div className="space-y-1 text-slate-600 text-xs">
                         <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                            <span>البنك:</span>
                            <span className="font-bold">{settings.bankName}</span>
                         </div>
                         <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 pt-1">
                            <span>المستفيد:</span>
                            <span className="font-bold">{settings.bankBeneficiary}</span>
                         </div>
                         <div className="pt-2 text-center">
                            <span className="block text-slate-400 mb-1">IBAN</span>
                            <code className="bg-white px-2 py-1 rounded border border-slate-200 block">{settings.bankAccount}</code>
                         </div>
                      </div>
                   </div>

                   <div className="w-full md:w-5/12">
                      <div className="space-y-2 text-sm">
                         <div className="flex justify-between text-slate-500">
                            <span>المجموع الفرعي</span>
                            <span>{selectedInvoice.amount.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-slate-500">
                            <span>الضريبة (0%)</span>
                            <span>0.00</span>
                         </div>
                         <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-lg mt-2 shadow-lg shadow-blue-200">
                            <span className="font-bold">الإجمالي</span>
                            <span className="text-xl font-black">{selectedInvoice.amount.toLocaleString()} <span className="text-xs font-normal opacity-80">{selectedInvoice.currency}</span></span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-200 mt-4 rounded-b-xl">
             <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>إغلاق</Button>
             <div className="flex gap-2">
                <Button variant="outline" onClick={handleSendEmail}>
                   <Send size={16} className="ml-2" />
                   إرسال بريد
                </Button>
                <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px] shadow-lg">
                   {isDownloading ? (
                      <span className="flex items-center gap-2">جاري الطباعة...</span>
                   ) : (
                      <span className="flex items-center gap-2"><Printer size={18} /> طباعة / PDF</span>
                   )}
                </Button>
             </div>
          </div>
        </Modal>
      )}

      {/* New Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء فاتورة جديدة"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-right">
          <Select 
            label="العميل"
            value={newInvoice.clientId}
            onChange={e => setNewInvoice({...newInvoice, clientId: e.target.value})}
            required
          >
            <option value="" disabled>اختر العميل</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </Select>

          <Input 
            label="الوصف"
            value={newInvoice.description}
            onChange={e => setNewInvoice({...newInvoice, description: e.target.value})}
            required
            placeholder="مثال: خدمة تصميم موقع"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="المبلغ"
              type="number"
              value={newInvoice.amount}
              onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
              required
            />
            <Select 
              label="العملة"
              value={newInvoice.currency}
              onChange={e => setNewInvoice({...newInvoice, currency: e.target.value as Currency})}
            >
              {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>

          <Input 
            label="تاريخ الاستحقاق"
            type="date"
            value={newInvoice.dueDate}
            onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إغلاق</Button>
            <Button type="submit">إصدار الفاتورة</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
