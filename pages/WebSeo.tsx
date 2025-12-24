
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Card, Button, Input, Select, Badge, Modal, TextArea, WhatsAppButton } from '../components/Shared';
import { Globe, Plus, CheckCircle, Clock, DollarSign, ExternalLink, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import { SiteProject, Currency } from '../types';
import { CURRENCY_OPTIONS } from '../constants';

export const WebSeo: React.FC = () => {
  const { clients, siteProjects, addSiteProject, updateSiteProject, markMonthPaid, revertSiteMonthPayment } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<SiteProject>>({
    currency: 'SAR',
    monthlyFee: 0,
    thirdPartyCost: 0,
    status: 'Active',
    paymentHistory: [],
    paymentDay: 1
  });

  // State for Revert Confirmation
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [paymentToRevert, setPaymentToRevert] = useState<{ siteId: string; month: string } | null>(null);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.companyName || 'Unknown';
  const getClientPhone = (id: string) => clients.find(c => c.id === id)?.phone || '';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.clientId) return;

    if (isEdit && currentProject.id) {
       updateSiteProject(currentProject as SiteProject);
    } else {
      const project: SiteProject = {
        ...currentProject as SiteProject,
        id: `SITE-${Date.now()}`,
        paymentHistory: [],
      };
      addSiteProject(project);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
     setCurrentProject({ currency: 'SAR', monthlyFee: 0, thirdPartyCost: 0, status: 'Active', paymentHistory: [], paymentDay: 1 });
     setIsEdit(false);
  }

  const openAddModal = () => {
     resetForm();
     setIsModalOpen(true);
  }

  const openEditModal = (project: SiteProject) => {
     setCurrentProject({...project});
     setIsEdit(true);
     setIsModalOpen(true);
  }

  const handleMonthClick = (site: SiteProject, month: string, isPaid: boolean) => {
    if (isPaid) {
       setPaymentToRevert({ siteId: site.id, month });
       setIsRevertModalOpen(true);
    } else {
       markMonthPaid(site.id, month);
    }
  };

  const confirmRevert = () => {
    if (paymentToRevert) {
      revertSiteMonthPayment(paymentToRevert.siteId, paymentToRevert.month);
      setIsRevertModalOpen(false);
      setPaymentToRevert(null);
    }
  };

  // Generate timeline: 4 past months + current + 1 next
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة المواقع و SEO</h2>
           <p className="text-slate-500 text-sm">متابعة المشاريع التقنية والاشتراكات الشهرية.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={18} className="ml-2" />
          إضافة موقع/مشروع
        </Button>
      </div>

      <div className="grid gap-6">
        {siteProjects.map(site => (
          <Card key={site.id} className="overflow-hidden !p-0">
            {/* Project Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
                      {site.domainName}
                      <a href={`https://${site.domainName}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    </h3>
                    <div className="flex flex-wrap gap-2 text-slate-500 text-sm mt-1 font-medium items-center">
                       <span>{getClientName(site.clientId)}</span>
                       <span className="text-slate-300">|</span>
                       
                       <WhatsAppButton phone={getClientPhone(site.clientId)} compact label={getClientPhone(site.clientId)} />
                       
                       <span className="text-slate-300">|</span>
                       <span>{site.serviceName}</span>
                       {site.paymentDay && (
                          <>
                             <span className="text-slate-300">|</span>
                             <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <CalendarDays size={14} />
                                استحقاق يوم {site.paymentDay}
                             </span>
                          </>
                       )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 min-w-[100px]">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">عمولة شهرية</p>
                    <p className="font-bold text-lg text-slate-800 dark:text-white">{site.monthlyFee}</p>
                    <span className="text-[10px] text-slate-400">{site.currency}</span>
                  </div>
                  <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 min-w-[100px]">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">تكاليف تشغيل</p>
                    <p className="font-bold text-lg text-slate-800 dark:text-white">{site.thirdPartyCost}</p>
                    <span className="text-[10px] text-slate-400">{site.currency}</span>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                     <Badge color={site.status === 'Active' ? 'green' : site.status === 'Development' ? 'blue' : 'gray'}>
                        {site.status === 'Active' ? 'نشط' : site.status === 'Development' ? 'تطوير' : 'غير نشط'}
                     </Badge>
                     <button 
                        onClick={() => openEditModal(site)}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                     >
                        <Edit2 size={12} />
                        تعديل
                     </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} />
                جدول المدفوعات (المتوقع)
              </h4>
              {/* Increased padding top for badges */}
              <div className="flex overflow-x-auto gap-3 pt-8 pb-2 custom-scrollbar px-1">
                {months.map(month => {
                  const payment = site.paymentHistory.find(p => p.month === month);
                  const isPaid = !!payment?.isPaid;
                  const isCurrent = month === currentMonthIso;
                  const monthDate = new Date(month + '-01');
                  const isFuture = monthDate > new Date(currentMonthIso + '-01');

                  return (
                    <div key={month} className={`
                      relative flex flex-col items-center justify-center min-w-[110px] p-4 rounded-xl border transition-all duration-200
                      ${isPaid 
                        ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800/50 shadow-sm cursor-pointer hover:border-red-300' 
                        : isCurrent
                          ? 'bg-white dark:bg-slate-800 border-purple-500 ring-4 ring-purple-500/10 shadow-md transform scale-105 z-10'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md cursor-pointer group'}
                    `}
                    onClick={() => handleMonthClick(site, month, isPaid)}
                    >
                      {isCurrent && (
                         <span className="absolute -top-3 bg-purple-600 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow-sm font-bold tracking-wide z-20 whitespace-nowrap">
                           الحالي
                         </span>
                       )}
                      <span className={`text-xs font-bold mb-2 font-mono ${isCurrent ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>{month}</span>
                      {isPaid ? (
                        <div className="flex flex-col items-center text-green-600 dark:text-green-500">
                          <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mb-1">
                             <CheckCircle size={16} />
                          </div>
                          <span className="text-[10px] font-bold">تم الدفع</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center group-hover:text-blue-600 transition-colors">
                          <div className={`w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center mb-1 transition-all ${isCurrent ? 'border-purple-300 text-purple-400' : 'border-slate-300 text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500'}`}>
                             <DollarSign size={14} />
                          </div>
                          <span className={`text-[10px] ${isCurrent ? 'text-purple-500 font-bold' : 'text-slate-400 group-hover:text-blue-600'}`}>
                             {isFuture ? 'قادم' : 'دفع الآن'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}

        {siteProjects.length === 0 && (
          <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <Globe size={48} className="mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">لا توجد مشاريع مضافة</h3>
            <p className="mb-6 max-w-sm mx-auto">قم بإضافة موقع عميل جديد لتتبع الدفعات الشهرية وتكاليف الـ SEO.</p>
            <Button onClick={openAddModal}>
              <Plus size={18} className="ml-2" />
              إضافة مشروع جديد
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         title={isEdit ? "تعديل بيانات المشروع" : "إضافة مشروع موقع/SEO جديد"}
      >
        <form onSubmit={handleSave} className="space-y-5 text-right">
          <Select 
            label="العميل" 
            value={currentProject.clientId}
            onChange={e => setCurrentProject({...currentProject, clientId: e.target.value})}
            required
            disabled={isEdit}
          >
            <option value="">اختر العميل</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </Select>
          
          <div className="grid grid-cols-2 gap-5">
             <Input 
               label="اسم الدومين"
               value={currentProject.domainName}
               onChange={e => setCurrentProject({...currentProject, domainName: e.target.value})}
               placeholder="example.com"
               required
             />
             <Input 
               label="نوع الخدمة"
               value={currentProject.serviceName}
               onChange={e => setCurrentProject({...currentProject, serviceName: e.target.value})}
               placeholder="SEO, صيانة, استضافة"
             />
          </div>

          <div className="grid grid-cols-2 gap-5 bg-slate-50 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
             <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">تفاصيل مالية</div>
             <Input 
               label="العمولة الشهرية (لنا)"
               type="number"
               value={currentProject.monthlyFee}
               onChange={e => setCurrentProject({...currentProject, monthlyFee: Number(e.target.value)})}
             />
             <Input 
               label="تكاليف تشغيل (باك لينك/سيرفر)"
               type="number"
               value={currentProject.thirdPartyCost}
               onChange={e => setCurrentProject({...currentProject, thirdPartyCost: Number(e.target.value)})}
             />
             <div className="col-span-1">
                <Select
                  label="العملة"
                  value={currentProject.currency}
                  onChange={e => setCurrentProject({...currentProject, currency: e.target.value as Currency})}
                >
                  {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
             </div>
             <div className="col-span-1">
                <Input 
                  label="يوم الاستحقاق (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  value={currentProject.paymentDay || 1}
                  onChange={e => setCurrentProject({...currentProject, paymentDay: Number(e.target.value)})}
                />
             </div>
             
             {isEdit && (
                <div className="col-span-2">
                   <Select
                     label="حالة المشروع"
                     value={currentProject.status}
                     onChange={e => setCurrentProject({...currentProject, status: e.target.value as any})}
                   >
                     <option value="Active">نشط (Active)</option>
                     <option value="Development">قيد التطوير (Development)</option>
                     <option value="Inactive">غير نشط (Inactive)</option>
                   </Select>
                </div>
             )}
          </div>

          <TextArea 
            label="ملاحظات إضافية"
            value={currentProject.notes}
            onChange={e => setCurrentProject({...currentProject, notes: e.target.value})}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button type="submit">حفظ المشروع</Button>
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
