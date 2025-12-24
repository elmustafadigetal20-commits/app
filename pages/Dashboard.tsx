
import React from 'react';
import { useData } from '../services/dataContext';
import { Card, Badge, Select, Button } from '../components/Shared';
import { Users, TrendingUp, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { stats, invoices, orders } = useData();

  const chartData = [
    { name: 'يناير', sar: 4000, egp: 2400 },
    { name: 'فبراير', sar: 3000, egp: 1398 },
    { name: 'مارس', sar: 2000, egp: 9800 },
    { name: 'أبريل', sar: 2780, egp: 3908 },
    { name: 'مايو', sar: 1890, egp: 4800 },
    { name: 'يونيو', sar: 2390, egp: 3800 },
    { name: 'يوليو', sar: 3490, egp: 4300 },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, footer }: any) => (
    <Card className="relative overflow-hidden">
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-3">{value}</h3>
          {footer && <div className="mt-2">{footer}</div>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">نظرة عامة</h2>
          <p className="text-slate-500 mt-1">ملخص أداء الوكالة، الإيرادات، وحالة العملاء.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="font-medium text-slate-600 dark:text-slate-300">النظام يعمل بكفاءة</span>
        </div>
      </div>

      {/* Stats Grid: 1 col mobile, 2 cols tablet (md), 4 cols desktop (xl) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي العملاء" 
          value={stats.totalClients} 
          icon={Users}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />

        <StatCard 
          title="حملات نشطة" 
          value={stats.activeCampaigns} 
          icon={TrendingUp}
          colorClass="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />

        <StatCard 
          title="فواتير معلقة" 
          value={stats.pendingInvoicesCount} 
          icon={AlertCircle}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          footer={<span className="text-xs text-amber-600 font-medium">تحتاج للمتابعة</span>}
        />

        <StatCard 
          title="الإيرادات (المحصلة)" 
          value={
            <div className="flex flex-col gap-1">
               <span className="text-2xl">{stats.revenueSAR.toLocaleString()} <span className="text-xs text-slate-400">SAR</span></span>
            </div>
          } 
          icon={Wallet}
          colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          footer={<span className="text-xs text-slate-500 font-medium">+ {stats.revenueEGP.toLocaleString()} EGP</span>}
        />
      </div>

      {/* Charts & Recent Activity: Stack on tablet, side-by-side on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white">التحليل المالي</h3>
             <Select className="!mb-0 !w-32 !py-1 !text-xs">
               <option>آخر 6 شهور</option>
               <option>هذا العام</option>
             </Select>
          </div>
          {/* Explicit height wrapper to prevent Recharts -1 width error */}
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis orientation="right" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sar" fill="#3b82f6" name="ريال سعودي" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="egp" fill="#94a3b8" name="جنيه مصري" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">أحدث الفواتير</h3>
            <button className="text-blue-600 text-sm hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">#{inv.id}</span>
                  <span className="text-[10px] text-slate-400">{inv.dueDate}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{inv.amount} <span className="text-[10px] font-normal text-slate-500">{inv.currency}</span></p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.isPaid ? 'مدفوعة' : 'معلقة'}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-sm text-slate-500 text-center">لا توجد فواتير حديثة</p>}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table - Show Table only on Large screens */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">آخر الطلبات النشطة</h3>
          <Button variant="outline" className="text-xs">إدارة الطلبات</Button>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[700px]">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 rounded-r-lg font-medium">الخدمة</th>
                <th className="px-4 py-3 font-medium">التفاصيل</th>
                <th className="px-4 py-3 font-medium">الميزانية</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 rounded-l-lg font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">{order.serviceType}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{order.platform || order.domainName || '-'}</td>
                  <td className="px-4 py-4 font-medium text-slate-800 dark:text-white">{order.budget ? `${order.budget.toLocaleString()} ${order.currency}` : '-'}</td>
                  <td className="px-4 py-4">
                    <Badge color={
                      order.status === 'نشطة' ? 'green' :
                      order.status === 'قيد الانتظار' ? 'yellow' :
                      order.status === 'منتهية' ? 'gray' : 'blue'
                    }>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs">{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
