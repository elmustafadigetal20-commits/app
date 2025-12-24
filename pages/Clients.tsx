
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Card, Button, Input, Select, Badge, Modal, TextArea, WhatsAppButton } from '../components/Shared';
import { Search, Plus, Download, Edit2, Mail, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { Client, Currency } from '../types';
import { CURRENCY_OPTIONS } from '../constants';

export const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'onetime'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm);
    const matchesType = filterType === 'all' 
      ? true 
      : filterType === 'monthly' ? client.isMonthly 
      : !client.isMonthly;
    return matchesSearch && matchesType;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.companyName) return;

    if (editingClient.id) {
      updateClient(editingClient as Client);
    } else {
      const newClient: Client = {
        ...editingClient as Client,
        id: Math.random().toString(36).substr(2, 9),
        joinedDate: new Date().toISOString().split('T')[0],
        // Init config if monthly
        monthlyConfig: editingClient.isMonthly ? {
           monthlyFee: editingClient.monthlyConfig?.monthlyFee || 0,
           paymentDay: editingClient.monthlyConfig?.paymentDay || 1,
           paymentHistory: []
        } : undefined
      };
      addClient(newClient);
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const openAddModal = () => {
    setEditingClient({
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      currency: 'SAR',
      isMonthly: false,
      address: '',
      notes: '',
      monthlyConfig: { monthlyFee: 0, paymentDay: 1, paymentHistory: [] }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient({ ...client });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">قاعدة العملاء</h2>
           <p className="text-slate-500 text-sm">إدارة بيانات التواصل، العقود، والتفضيلات.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <Download size={18} className="ml-2" />
            تصدير CSV
           </Button>
           <Button onClick={openAddModal}>
            <Plus size={18} className="ml-2" />
            عميل جديد
           </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث باسم الشركة أو رقم الهاتف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterType === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setFilterType('monthly')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterType === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
              عملاء شهريين
            </button>
            <button 
              onClick={() => setFilterType('onetime')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterType === 'onetime' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
              غير شهري
            </button>
          </div>
        </div>
      </Card>

      {/* Clients Grid: 1 col on mobile, 2 on tablet/laptop, 3 on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <Card key={client.id} className="hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{client.companyName}</h3>
                <p className="text-sm text-slate-500">{client.contactName}</p>
              </div>
              <Badge color={client.isMonthly ? 'blue' : 'gray'}>
                {client.isMonthly ? 'شهري' : 'مشروع'}
              </Badge>
            </div>
            
            <div className="space-y-3 mb-6">
              {/* WhatsApp Button replaces Phone row */}
              <div className="mt-2">
                 <WhatsAppButton phone={client.phone} className="w-full" />
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 px-2">
                <Mail size={16} className="text-slate-400" />
                <span>{client.email}</span>
              </div>
              {client.address && (
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 px-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
               {client.isMonthly && client.monthlyConfig?.monthlyFee ? (
                  <div className="flex flex-col items-start">
                     <div className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {client.monthlyConfig.monthlyFee} {client.currency}/شهر
                     </div>
                     {client.monthlyConfig.paymentDay && (
                        <span className="text-[10px] text-slate-400 mt-1">
                           استحقاق يوم {client.monthlyConfig.paymentDay}
                        </span>
                     )}
                  </div>
               ) : (
                 <span className="text-xs text-slate-400">انضم: {client.joinedDate}</span>
               )}
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-3 text-xs" onClick={() => openEditModal(client)}>
                  <Edit2 size={14} className="ml-1" />
                  تعديل
                </Button>
                <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => openDeleteModal(client.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          لا يوجد عملاء مطابقين للبحث
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingClient?.id ? "تعديل بيانات عميل" : "إضافة عميل جديد"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-right">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="اسم الشركة / النشاط"
              value={editingClient?.companyName}
              onChange={e => setEditingClient(prev => ({ ...prev, companyName: e.target.value }))}
              required
            />
            <Input 
              label="اسم المسؤول"
              value={editingClient?.contactName}
              onChange={e => setEditingClient(prev => ({ ...prev, contactName: e.target.value }))}
              required
            />
            <Input 
              label="رقم الهاتف (واتساب)"
              type="tel"
              value={editingClient?.phone}
              onChange={e => setEditingClient(prev => ({ ...prev, phone: e.target.value }))}
              required
              placeholder="+966xxxxxxxxx"
            />
            <Input 
              label="البريد الإلكتروني"
              type="email"
              value={editingClient?.email}
              onChange={e => setEditingClient(prev => ({ ...prev, email: e.target.value }))}
            />
            <Select 
              label="العملة الأساسية"
              value={editingClient?.currency}
              onChange={e => setEditingClient(prev => ({ ...prev, currency: e.target.value as Currency }))}
            >
              {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
             
             {/* Monthly Toggle & Config */}
             <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                <div className="flex items-center mb-4">
                  <input 
                    type="checkbox" 
                    id="isMonthly"
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    checked={editingClient?.isMonthly}
                    onChange={e => setEditingClient(prev => ({ 
                       ...prev, 
                       isMonthly: e.target.checked,
                       // Ensure monthlyConfig exists if checked
                       monthlyConfig: e.target.checked ? { monthlyFee: 0, paymentDay: 1, paymentHistory: [] } : undefined
                    }))}
                  />
                  <label htmlFor="isMonthly" className="mr-3 font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">تفعيل الاشتراك الشهري (إعلانات/متابعة)</label>
                </div>
                
                {editingClient?.isMonthly && (
                   <div className="animate-fadeIn grid grid-cols-2 gap-4">
                      <Input 
                        label="قيمة الاشتراك الشهري"
                        type="number"
                        placeholder="0.00"
                        value={editingClient?.monthlyConfig?.monthlyFee || ''}
                        onChange={e => setEditingClient(prev => ({ 
                           ...prev!, 
                           monthlyConfig: { 
                             paymentHistory: [], 
                             ...(prev?.monthlyConfig || {}), 
                             monthlyFee: Number(e.target.value) 
                           }
                        }))}
                      />
                      <Input 
                        label="يوم الاستحقاق (1-31)"
                        type="number"
                        min="1"
                        max="31"
                        value={editingClient?.monthlyConfig?.paymentDay || 1}
                        onChange={e => setEditingClient(prev => ({ 
                           ...prev!, 
                           monthlyConfig: { 
                             paymentHistory: [], 
                             monthlyFee: prev?.monthlyConfig?.monthlyFee || 0,
                             ...(prev?.monthlyConfig || {}), 
                             paymentDay: Number(e.target.value) 
                           }
                        }))}
                      />
                      <div className="col-span-2">
                         <p className="text-xs text-slate-500">
                           * سيظهر هذا العميل في صفحة "اشتراكات الإعلانات" لتوليد الفواتير الشهرية تلقائيًا.
                         </p>
                      </div>
                   </div>
                )}
             </div>
          </div>
          
          <Input 
            label="العنوان"
            value={editingClient?.address}
            onChange={e => setEditingClient(prev => ({ ...prev, address: e.target.value }))}
          />
          <TextArea 
            label="ملاحظات"
            value={editingClient?.notes}
            onChange={e => setEditingClient(prev => ({ ...prev, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button type="submit">حفظ البيانات</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="تأكيد الحذف"
      >
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">هل أنت متأكد من حذف العميل؟</h3>
          <p className="text-slate-500 mb-6 text-sm">سيتم حذف بيانات العميل وسجله بالكامل بشكل نهائي. تأكد من عدم وجود فواتير معلقة.</p>
          <div className="flex justify-center gap-3">
             <Button variant="secondary" onClick={closeDeleteModal}>إلغاء</Button>
             <Button variant="danger" onClick={confirmDelete}>نعم، احذف العميل</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
