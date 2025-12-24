
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Card, Button, Input, Modal, WhatsAppButton } from '../components/Shared';
import { CalendarCheck, CheckCircle, Clock, DollarSign, Search, AlertCircle, User, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import { Client } from '../types';

export const MonthlyAds: React.FC = () => {
  const { clients, markAdMonthPaid, revertAdMonthPayment, updateClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for editing subscription
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editConfig, setEditConfig] = useState({ monthlyFee: 0, paymentDay: 1 });

  // State for Unpay/Revert Confirmation
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [paymentToRevert, setPaymentToRevert] = useState<{ clientId: string; month: string } | null>(null);

  const monthlyClients = clients.filter(c => c.isMonthly);
  const filteredClients = monthlyClients.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const today = new Date();
  const currentMonthIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const months: string[] = [];
  for (let i = -1; i < 5; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${mon}`);
  }
  months.reverse();

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setEditConfig({
      monthlyFee: client.monthlyConfig?.monthlyFee || 0,
      paymentDay: client.monthlyConfig?.paymentDay || 1
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updatedClient: Client = {
      ...editingClient,
      monthlyConfig: {
        ...editingClient.monthlyConfig!,
        monthlyFee: editConfig.monthlyFee,
        paymentDay: editConfig.paymentDay
      }
    };

    updateClient(updatedClient);
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  const handleMonthClick = (client: Client, month: string, isPaid: boolean) => {
    if (isPaid) {
      // Open confirmation to revert
      setPaymentToRevert({ clientId: client.id, month });
      setIsRevertModalOpen(true);
    } else {
      // Mark as paid
      markAdMonthPaid(client.id, month);
    }
  };

  const confirmRevert = () => {
    if (paymentToRevert) {
      revertAdMonthPayment(paymentToRevert.clientId, paymentToRevert.month);
      setIsRevertModalOpen(false);
      setPaymentToRevert(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">اشتراكات الإعلانات الشهرية</h2>
           <p className="text-slate-500 text-sm">متابعة دفعات العملاء المشتركين في باقات التسويق.</p>
        </div>
        <div className="relative w-full sm:w-64">
           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="بحث عن عميل..." 
             className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredClients.map(client => {
          const currentPayment = client.monthlyConfig?.paymentHistory?.find(p => p.month === currentMonthIso);
          const isCurrentPaid = !!currentPayment?.isPaid;

          return (
            <Card key={client.id} className="overflow-hidden !p-0 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
               {/* Header Section */}
               <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl shrink-0">
                           <CalendarCheck size={24} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1 flex-wrap">
                             <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {client.companyName}
                             </h3>
                             {client.monthlyConfig?.monthlyFee && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap leading-tight ${isCurrentPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {isCurrentPaid ? 'مدفوع' : 'مستحق الدفع'}
                                </span>
                              )}
                           </div>
                           <div className="flex flex-wrap gap-3 text-sm text-slate-500 font-medium items-center mt-2">
                              <span className="flex items-center gap-1"><User size={14}/> {client.contactName}</span>
                              <span className="text-slate-300">|</span>
                              
                              <WhatsAppButton phone={client.phone} compact label={client.phone} />
                              
                              {client.monthlyConfig?.paymentDay && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <CalendarDays size={14} />
                                    استحقاق يوم {client.monthlyConfig.paymentDay}
                                  </span>
                                </>
                              )}
                           </div>
                        </div>
                     </div>
                     
                     {/* Financial Info & Actions */}
                     <div className="flex items-center gap-4 self-start md:self-center">
                        <div className="text-center px-5 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 min-w-[120px]">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">قيمة الاشتراك</p>
                            <p className="font-bold text-xl text-slate-800 dark:text-white">
                               {client.monthlyConfig?.monthlyFee ? client.monthlyConfig.monthlyFee.toLocaleString() : '0'}
                            </p>
                            <span className="text-[10px] text-slate-400 font-bold">{client.currency}</span>
                        </div>
                        <button 
                          onClick={() => openEditModal(client)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="تعديل تفاصيل الاشتراك"
                        >
                           <Edit2 size={18} />
                        </button>
                     </div>
                  </div>
               </div>
               
               {/* Timeline Section */}
               <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6">
                  {client.monthlyConfig?.monthlyFee ? (
                     <>
                       <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2 mb-4">
                          <Clock size={14} />
                          سجل المدفوعات والفواتير
                       </h4>
                       
                       {/* Timeline Container */}
                       <div className="flex overflow-x-auto gap-3 pt-8 pb-2 custom-scrollbar px-1">
                          {months.map(month => {
                             const payment = client.monthlyConfig?.paymentHistory?.find(p => p.month === month);
                             const isPaid = !!payment?.isPaid;
                             const isCurrent = month === currentMonthIso;
                             const monthDate = new Date(month + '-01');
                             const isFuture = monthDate > new Date(currentMonthIso + '-01');

                             return (
                                <div key={month} 
                                   className={`
                                      relative flex flex-col items-center justify-center min-w-[110px] p-4 rounded-xl border transition-all duration-200
                                      ${isPaid 
                                      ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800/50 shadow-sm cursor-pointer hover:border-red-300' 
                                      : isCurrent 
                                         ? 'bg-white dark:bg-slate-800 border-blue-500 ring-4 ring-blue-500/10 shadow-md transform scale-105 z-10'
                                         : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md cursor-pointer group opacity-90'}
                                   `}
                                   onClick={() => handleMonthClick(client, month, isPaid)}
                                >
                                   {isCurrent && (
                                     <span className="absolute -top-3 bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow-sm font-bold tracking-wide z-20 whitespace-nowrap">
                                       الحالي
                                     </span>
                                   )}
                                   
                                   <span className={`text-xs font-bold mb-2 font-mono ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                      {month}
                                   </span>
                                   
                                   {isPaid ? (
                                      <div className="flex flex-col items-center text-green-600 dark:text-green-500 animate-fadeIn">
                                         <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mb-1">
                                            <CheckCircle size={16} />
                                         </div>
                                         <span className="text-[10px] font-bold">تم الدفع</span>
                                      </div>
                                   ) : (
                                      <div className="flex flex-col items-center group-hover:text-blue-600 transition-colors">
                                         <div className={`w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center mb-1 transition-all ${isCurrent ? 'border-blue-300 text-blue-400' : 'border-slate-300 text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500'}`}>
                                            <DollarSign size={14} />
                                         </div>
                                         <span className={`text-[10px] ${isCurrent ? 'text-blue-500 font-bold' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600'}`}>
                                            {isFuture ? 'قادم' : 'دفع الآن'}
                                         </span>
                                      </div>
                                   )}
                                </div>
                             );
                          })}
                       </div>
                     </>
                  ) : (
                     <div className="flex items-center justify-center py-8 gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <AlertCircle size={24} />
                        <span className="text-sm font-medium">يرجى تحديد قيمة الاشتراك الشهري لبدء المتابعة.</span>
                        <Button variant="outline" className="text-xs" onClick={() => openEditModal(client)}>
                           تحديد الاشتراك
                        </Button>
                     </div>
                  )}
               </div>
            </Card>
          );
        })}

        {filteredClients.length === 0 && (
           <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <CalendarCheck size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">لا يوجد عملاء باشتراكات شهرية</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">تأكد من تفعيل خيار "اشتراك شهري" في صفحة العملاء لبدء المتابعة هنا.</p>
           </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل تفاصيل الاشتراك"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSubscription} className="space-y-4 text-right">
           <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">{editingClient?.companyName}</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400">تعديل البيانات المالية للاشتراك الشهري</p>
           </div>

           <Input 
             label="قيمة الاشتراك الشهري"
             type="number"
             value={editConfig.monthlyFee}
             onChange={e => setEditConfig({...editConfig, monthlyFee: Number(e.target.value)})}
           />

           <Input 
             label="يوم الاستحقاق الشهري (1-31)"
             type="number"
             min="1"
             max="31"
             value={editConfig.paymentDay}
             onChange={e => setEditConfig({...editConfig, paymentDay: Number(e.target.value)})}
           />
           
           <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>إلغاء</Button>
              <Button type="submit">حفظ التغييرات</Button>
           </div>
        </form>
      </Modal>

      {/* Revert Payment Confirmation Modal */}
      <Modal
        isOpen={isRevertModalOpen}
        onClose={() => setIsRevertModalOpen(false)}
        title="تأكيد إلغاء الدفع"
      >
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-red-600">
            <Trash2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">إلغاء تسجيل الدفعة؟</h3>
          <p className="text-slate-500 mb-6 text-sm">
            هل أنت متأكد من إلغاء حالة "تم الدفع" لشهر <span className="font-bold text-slate-800 dark:text-slate-300 font-mono">{paymentToRevert?.month}</span>؟
            <br />
            <span className="text-red-500 font-bold block mt-2">سيتم حذف الفاتورة المرتبطة نهائيًا من النظام.</span>
          </p>
          <div className="flex justify-center gap-3">
             <Button variant="secondary" onClick={() => setIsRevertModalOpen(false)}>تراجع</Button>
             <Button variant="danger" onClick={confirmRevert}>نعم، احذف الفاتورة وألغِ الدفع</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
