import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Filter, Calendar, Users, ArrowRight, Eye, RefreshCw } from 'lucide-react';

const yieldData = [
  { name: 'Mon', yield: 4000, gradeA: 2400, gradeB: 1000, rejected: 600 },
  { name: 'Tue', yield: 4500, gradeA: 2800, gradeB: 1200, rejected: 500 },
  { name: 'Wed', yield: 5200, gradeA: 3300, gradeB: 1400, rejected: 500 },
  { name: 'Thu', yield: 4800, gradeA: 3000, gradeB: 1300, rejected: 500 },
  { name: 'Fri', yield: 5500, gradeA: 3500, gradeB: 1500, rejected: 500 },
  { name: 'Sat', yield: 3000, gradeA: 1800, gradeB: 800, rejected: 400 },
  { name: 'Sun', yield: 2500, gradeA: 1500, gradeB: 700, rejected: 300 },
];

const distributionData = [
  { name: 'Grade A', value: 62, color: '#22c55e' },
  { name: 'Grade B', value: 22, color: '#eab308' },
  { name: 'Rejected', value: 16, color: '#ef4444' },
];

const logs = [
  { id: '#BN-9921', time: '2024-10-24 10:45', class: 'Ripe', confidence: '94%', color: '#22c55e' },
  { id: '#BN-9920', time: '2024-10-24 10:32', class: 'Unripe', confidence: '82%', color: '#eab308' },
  { id: '#BN-9919', time: '2024-10-24 10:15', class: 'Overripe', confidence: '76%', color: '#f97316' },
  { id: '#BN-9918', time: '2024-10-24 09:58', class: 'Rotten', confidence: '98%', color: '#ef4444' },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-display-md text-on-surface">Phân tích & Kiểm soát Chất lượng</h2>
          <p className="text-on-surface-variant">Giám sát xu hướng và điều chỉnh dự đoán AI.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-label-bold hover:bg-surface-variant transition-colors">
            <Calendar className="w-4 h-4 mr-2" /> Hôm nay
          </button>
          <button className="flex items-center px-4 py-2 bg-primary text-on-primary rounded-lg text-label-bold hover:opacity-90 transition-colors">
            <Filter className="w-4 h-4 mr-2" /> Lọc
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Yield Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-sm text-on-surface">Xu hướng Sản lượng (Theo Hạng)</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorGradeA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="gradeA" stroke="#22c55e" fillOpacity={1} fill="url(#colorGradeA)" strokeWidth={3} />
                <Area type="monotone" dataKey="gradeB" stroke="#eab308" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-headline-sm text-on-surface mb-6">Phân bổ Hạng Chuối</h3>
          <div className="flex-1 relative flex items-center justify-center">
            <div className="absolute text-center">
              <span className="text-display-md text-on-surface">84%</span>
              <p className="text-xs font-bold text-on-surface-variant uppercase">Đạt chuẩn</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-on-surface-variant">{item.name}</span>
                </div>
                <span className="text-on-surface">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h3 className="text-headline-sm text-on-surface">Nhật ký Dự đoán Độ tin cậy Thấp (&lt; 75%)</h3>
            <p className="text-xs text-on-surface-variant mt-1">Cần đánh giá thủ công để cải thiện mô hình AI.</p>
          </div>
          <button className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-outline" />
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              <th className="px-6 py-4">Thời điểm</th>
              <th className="px-6 py-4">Ảnh Snapshot</th>
              <th className="px-6 py-4">Dự đoán (AI)</th>
              <th className="px-6 py-4">Độ tin cậy</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-on-surface">14:22:05</div>
                  <div className="text-xs text-on-surface-variant">Hôm nay</div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-16 h-10 bg-black rounded overflow-hidden border border-outline-variant">
                     <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCApIlBt7WaYKVZ-XDEP-YFuFY3K-yeedOb5dt_zOkoQES_pfWOXdv_mbkL3C5BiAeltdwvWma9UhgOdQ9plu3opvOBsOjBqvndVlqdOJnFnZ5sKczfHqWQfS5fjAd8RoZl6bVuJGaiBxCM-lBQdGR5cVh9IcxPyuhMpTT9HnzXQn6oeXBu8iLMkJAxb4NLT7uvB5WmCGUFR7GD7XjGJkW72G28ESyg9SaB-f1b08EawKm6wRAsiUqkGbOolGfkj6_KC2iuq5PtX2rG" className="w-full h-full object-cover grayscale opacity-60" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-surface-container text-xs font-bold rounded-full" style={{ color: log.color }}>
                    Hạng {log.class}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#ba1a1a]">{log.confidence}</span>
                    <div className="w-16 bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#ba1a1a] h-full" style={{ width: log.confidence }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center text-xs font-bold text-on-secondary px-4 py-2 bg-secondary rounded-lg hover:opacity-90 transition-colors">
                    Gán nhãn lại
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
