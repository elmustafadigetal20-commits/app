
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Card, Button, Input, Select, Badge, Modal, TextArea, WhatsAppButton } from '../components/Shared';
import { Plus, Search, MapPin, Globe, Smartphone, Calendar, DollarSign, Edit, Filter, ListFilter, LayoutGrid, List } from 'lucide-react';
import { Order, OrderStatus, ServiceType, Currency } from '../types';
import { SERVICE_OPTIONS, PLATFORM_OPTIONS, CURRENCY_OPTIONS } from '../constants';

export const Orders: React.FC = () => {
  const { orders, clients, addOrder, updateOrder } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // For toggling view preference on larger screens if desired

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const statusMatch = filterStatus === 'all' || o.status === filterStatus;
    const clientName = clients.find(c => c.id === o.clientId)?.companyName.toLowerCase() || '';
    const searchMatch = 
      clientName.includes(searchTerm.toLowerCase()) || 
      o.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.domainName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Status Counts for Tabs
  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder?.clientId || !editingOrder.serviceType) return;

    const updatedOrder = { ...editingOrder } as Order;
    
    // Cleanup fields based on type
    if (updatedOrder.serviceType === ServiceType.WEB_DESIGN || updatedOrder.serviceType === ServiceType.SEO) {
      updatedOrder.platform = undefined;
      updatedOrder.targetPhone = undefined;
      updatedOrder.targetRegions = undefined;
      updatedOrder.adText = undefined;
    } else {
      updatedOrder.domainName = undefined;
    }

    if (updatedOrder.id) {
      updateOrder(updatedOrder);
    } else {
      const newOrder: Order = {
        ...updatedOrder,
        id: 'ord-' + Math.random().toString(36).substr(2, 6),
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString().split('T')[0],
      };
      addOrder(newOrder);
    }
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const openAddModal = () => {
    setEditingOrder({
      clientId: clients.length > 0 ? clients[0].id : '',
      serviceType: ServiceType.ADS_SOCIAL,
      currency: 'SAR',
      platform: 'Facebook',
      budget: 0,
      adText: '',
      targetPhone: '',
      targetRegions: '',
      domainName: '',
    });
    setIsModalOpen(true);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.companyName || 'Unknown';

  const renderServiceFields = () => {
    const type = editingOrder?.serviceType;
    const isAds = type === ServiceType.ADS_SOCIAL || type === ServiceType.ADS_GOOGLE;
    const isWeb = type === ServiceType.WEB_DESIGN || type === ServiceType.SEO;
    const isField = type === ServiceType.FIELD_SERVICE;

    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
           <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
             {isAds ? <Smartphone size={16} /> : isWeb ? <Globe size={16} /> : <List size={16} />}
           </span>
           <h4 className="text-sm font-bold text-slate-800 dark:text-white">تفاصيل الخدمة التقنية</h4>
        </div>
        
        {isAds && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="المنصة الإعلانية"
                value={editingOrder?.platform}
                onChange={e => setEditingOrder(prev => ({ ...prev, platform: e.target.value }))}
              >
                {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Input
                label="رقم الهاتف للإعلان"
                value={editingOrder?.targetPhone || ''}
                onChange={e => setEditingOrder(prev => ({ ...prev, targetPhone: e.target.value }))}
                placeholder="+966..."
              />
            </div>
            <Input 
                label="المناطق المستهدفة"
                value={editingOrder?.targetRegions || ''}
                onChange={e => setEditingOrder(prev => ({ ...prev, targetRegions: e.target.value }))}
                placeholder="الرياض، جدة، القاهرة..."
                icon={<MapPin size={16} />}
            />
            <TextArea 
               label="نص الإعلان / العرض"
               value={editingOrder?.adText || ''}
               onChange={e => setEditingOrder(prev => ({ ...prev, adText: e.target.value }))}
               placeholder="مثال: خصم 20% لفترة محدودة..."
            />
          </div>
        )}

        {isWeb && (
           <div className="space-y-4">
             <Input
              label="اسم النطاق (Domain)"
              value={editingOrder?.domainName || ''}
              onChange={e => setEditingOrder(prev => ({ ...prev, domainName: e.target.value }))}
              placeholder="example.com"
              icon={<Globe size={16} />}
            />
            <TextArea 
               label="متطلبات الموقع / الملاحظات"
               value={editingOrder?.adText || ''}
               onChange={e => setEditingOrder(prev => ({ ...prev, adText: e.target.value }))}
               placeholder="وصف الصفحات المطلوبة، الألوان المفضلة..."
            />
           </div>
        )}
        
        {isField && (
           <TextArea 
             label="تفاصيل الخدمة الميدانية"
             value={editingOrder?.adText || ''}
             onChange={e => setEditingOrder(prev => ({ ...prev, adText: e.target.value }))}
             placeholder="وصف العمل المطلوب..."
           />
        )}
      </div>
    );
  };

  const renderOrderIcon = (type: ServiceType) => {
    if (type.includes('Web') || type.includes('SEO')) return <Globe size={20} className="text-purple-600 dark:text-purple-400" />;
    return <Smartphone size={20} className="text-blue-600 dark:text-blue-400" />;
  };

  const getServiceColor = (type: ServiceType) => {
    if (type.includes('Web') || type.includes('SEO')) return 'purple';
    return 'blue';
  };

  const StatusTabs = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-6">
      <button 
        onClick={() => setFilterStatus('all')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
          ${filterStatus === 'all' 
            ? 'bg-slate-800 text-white shadow-lg dark:bg-white dark:text-slate-900' 
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}
      >
        <span>الكل</span>
        <span className={`px-1.5 py-0.5 rounded-md text-xs ${filterStatus === 'all' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{getStatusCount('all')}</span>
      </button>
      
      {Object.values(OrderStatus).map(status => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${filterStatus === status 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}
        >
          <span>{status}</span>
          <span className={`px-1.5 py-0.5 rounded-md text-xs ${filterStatus === status ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{getStatusCount(status)}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">الطلبات والمشاريع</h2>
           <p className="text-slate-500 mt-1 text-sm">إدارة ومتابعة سير العمل وحالة تنفيذ الخدمات.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <div className="relative flex-1 lg:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث عن طلب..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-all"
              />
           </div>
           <Button onClick={openAddModal} className="shrink-0 shadow-lg shadow-blue-600/20">
             <Plus size={18} className="ml-2" />
             <span className="hidden sm:inline">طلب جديد</span>
             <span className="sm:hidden">جديد</span>
           </Button>
        </div>
      </div>

      {/* Filters Tabs */}
      <StatusTabs />

      {/* --- Responsive Grid View (Mobile & Tablet) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xl:hidden">
        {filteredOrders.map(order => {
          const isPurple = getServiceColor(order.serviceType) === 'purple';
          return (
            <div key={order.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
               {/* Side Accent Line */}
               <div className={`absolute top-0 right-0 w-1.5 h-full ${isPurple ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
               
               <div className="flex justify-between items-start mb-4 pr-3">
                  <div className="flex items-center gap-3">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isPurple ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                        {renderOrderIcon(order.serviceType)}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-1">{getClientName(order.clientId)}</h3>
                        <p className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md inline-block">
                           {order.serviceType}
                        </p>
                     </div>
                  </div>
                  <Badge color={
                    order.status === 'نشطة' ? 'green' :
                    order.status === 'قيد الانتظار' ? 'yellow' :
                    order.status === 'منتهية' ? 'gray' : 'blue'
                  }>{order.status}</Badge>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3 mb-4 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-500 text-xs">التفاصيل:</span>
                     <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]" dir="ltr">
                        {order.platform || order.domainName || 'خدمة عامة'}
                     </span>
                  </div>
                  {order.targetPhone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 text-xs">رقم الإعلان:</span>
                      <WhatsAppButton phone={order.targetPhone} compact className="!py-0.5 !px-2 !text-xs !h-6" label={order.targetPhone} />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                     <span className="text-slate-500 text-xs">الميزانية:</span>
                     <span className="font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-sm text-xs">
                        {order.budget?.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">{order.currency}</span>
                     </span>
                  </div>
               </div>

               <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs py-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700" onClick={() => { setEditingOrder(order); setIsModalOpen(true); }}>
                     <Edit size={14} className="ml-1" /> تعديل
                  </Button>
                  <div className="flex-1 min-w-[120px]">
                    <Select 
                      value={order.status}
                      onChange={(e) => updateOrder({ ...order, status: e.target.value as OrderStatus })}
                      className="!mb-0 !py-2 !px-2 !text-xs w-full cursor-pointer hover:border-blue-400 focus:border-blue-500 transition-colors"
                    >
                      {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
               </div>
            </div>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
             <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-3">
               <ListFilter size={32} className="text-slate-400" />
             </div>
             <p className="text-slate-500 font-medium">لا توجد طلبات مطابقة للفلتر</p>
             <Button variant="ghost" onClick={() => {setFilterStatus('all'); setSearchTerm('')}} className="mt-2 text-sm text-blue-600">
               مسح الفلتر
             </Button>
          </div>
        )}
      </div>

      {/* --- Desktop View (Table) --- */}
      <div className="hidden xl:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-1/4">العميل / الخدمة</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-1/4">تفاصيل التنفيذ</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">الميزانية</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredOrders.map(order => {
                const isPurple = getServiceColor(order.serviceType) === 'purple';
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPurple ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                              {renderOrderIcon(order.serviceType)}
                           </div>
                           <div>
                              <p className="font-bold text-slate-800 dark:text-white mb-0.5">{getClientName(order.clientId)}</p>
                              <p className="text-xs text-slate-500">{order.serviceType}</p>
                           </div>
                        </div>
                    </td>

                    <td className="px-6 py-4">
                       <div className="space-y-1">
                         <div className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            {order.platform ? <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">{order.platform}</span> : null}
                            <span dir="ltr">{order.domainName || order.platform ? '' : 'تفاصيل عامة'} {order.domainName}</span>
                         </div>
                         {order.targetPhone && (
                            <div className="flex items-center gap-1">
                               <span className="text-xs text-slate-400">رقم:</span>
                               <WhatsAppButton phone={order.targetPhone} compact className="!py-0.5 !px-2 !text-[10px] !h-6" label={order.targetPhone} />
                            </div>
                         )}
                       </div>
                    </td>

                    <td className="px-6 py-4">
                       <div className="font-bold text-slate-800 dark:text-white">
                          {order.budget ? order.budget.toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">{order.currency}</span>
                       </div>
                       <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={10} />
                          {order.createdAt}
                       </div>
                    </td>

                    <td className="px-6 py-4">
                       <div className="w-32">
                          <Select 
                            value={order.status}
                            onChange={(e) => updateOrder({ ...order, status: e.target.value as OrderStatus })}
                            className="!mb-0 !py-1.5 !px-2 !text-xs w-full !bg-transparent border-slate-200 dark:border-slate-700 hover:border-blue-400 focus:ring-0 shadow-none"
                          >
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </Select>
                       </div>
                    </td>

                    <td className="px-6 py-4 text-left">
                       <Button variant="outline" className="text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditingOrder(order); setIsModalOpen(true); }}>
                          تعديل
                       </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                         <Search size={32} className="mb-2 opacity-50" />
                         <p>لا توجد طلبات</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal is shared for both views */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder?.id ? "تعديل بيانات الطلب" : "إنشاء طلب جديد"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="text-right space-y-5">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select 
              label="العميل" 
              value={editingOrder?.clientId}
              onChange={e => setEditingOrder(prev => ({ ...prev, clientId: e.target.value }))}
              disabled={!!editingOrder?.id}
              className="font-medium"
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </Select>
            <Select 
              label="نوع الخدمة" 
              value={editingOrder?.serviceType}
              onChange={e => setEditingOrder(prev => ({ ...prev, serviceType: e.target.value as ServiceType }))}
              className="font-medium"
            >
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>

          {/* Section 2: Dynamic Fields */}
          {renderServiceFields()}

          {/* Section 3: Budget */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                   <DollarSign size={16} />
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">الميزانية والعملة</h4>
             </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input 
                    label="الميزانية المتوقعة"
                    type="number"
                    value={editingOrder?.budget || 0}
                    onChange={e => setEditingOrder(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="font-bold text-lg"
                  />
                </div>
                <div>
                  <Select
                      label="العملة"
                      value={editingOrder?.currency}
                      onChange={e => setEditingOrder(prev => ({ ...prev, currency: e.target.value as Currency }))}
                  >
                    {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button type="submit" className="min-w-[120px]">حفظ الطلب</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
