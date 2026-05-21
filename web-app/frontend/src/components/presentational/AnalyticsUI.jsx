/**
 * AnalyticsUI - Presentational Component (JavaScript Version)
 */
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Calendar, RefreshCw } from 'lucide-react';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function AnalyticsUI({ trendData, logs, onRefresh }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-display-md text-on-surface tracking-tighter">Phân tích & Kiểm soát Chất lượng</h2>
          <p className="text-on-surface-variant">Giám sát hiệu suất và độ lệch chuẩn của mô hình Edge AI.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-label-bold hover:bg-surface-variant transition-colors text-xs uppercase tracking-widest">
            <Calendar className="w-4 h-4 mr-2" /> 24 Giờ Qua
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-on-primary rounded-lg text-label-bold hover:opacity-90 transition-colors text-xs uppercase tracking-widest">
            <Filter className="w-4 h-4 mr-2" /> Bộ Lọc
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h3 className="text-headline-sm text-on-surface mb-6">Sản lượng Hạng A (Theo Thời gian)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="yield" stroke="#000" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
                <Area type="monotone" dataKey="gradeA" stroke="#22c55e" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-headline-sm text-on-surface mb-6">Phân loại Tổng quát</h3>
          <div className="flex-1 relative flex items-center justify-center">
            <div className="absolute text-center">
              <span className="text-display-md text-on-surface">84%</span>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Đạt tiêu chuẩn</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={[{value: 62}, {value: 22}, {value: 16}]} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="text-headline-sm text-on-surface">Nhật ký Inference</h3>
          <button onClick={onRefresh} className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-outline" />
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
              <th className="px-6 py-4">Serial ID</th>
              <th className="px-6 py-4">Loại (AI)</th>
              <th className="px-6 py-4">Độ Tin Cậy</th>
              <th className="px-6 py-4 text-right">Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-on-surface">{log.id}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-surface-container text-[10px] font-bold rounded-full uppercase">
                    {log.className}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${log.confidence < 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {log.confidence}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-on-secondary px-3 py-1.5 bg-secondary rounded hover:opacity-80 transition-colors uppercase">Gán nhãn</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
