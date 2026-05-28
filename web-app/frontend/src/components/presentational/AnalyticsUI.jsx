/**
 * AnalyticsUI - Presentational Component (JavaScript Version)
 */
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, X } from 'lucide-react';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function AnalyticsUI({ trendData, logs, onRefresh, onLabelAssign }) {
  const [selectedLog, setSelectedLog] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-display-md text-on-surface tracking-tighter">Phân tích & Kiểm soát Chất lượng</h2>
          <p className="text-on-surface-variant">Giám sát hiệu suất và độ lệch chuẩn của mô hình Edge AI.</p>
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
          <h3 className="text-headline-sm text-on-surface">Nhật ký</h3>
          <button onClick={onRefresh} className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-outline" />
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
              <th className="px-6 py-4">Serial ID</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Loại (AI)</th>
              <th className="px-6 py-4">Nhãn (Người)</th>
              <th className="px-6 py-4">Độ Tin Cậy</th>
              <th className="px-6 py-4 text-right">Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {logs?.map((log) => (
              <tr key={log.id} onDoubleClick={() => setSelectedLog(log)} className="hover:bg-surface-container/50 transition-colors cursor-pointer">
                <td className="px-6 py-4 text-xs font-bold text-on-surface">{log.id}</td>
                <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">{log.timestamp}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-surface-container text-[10px] font-bold rounded-full uppercase">
                    {log.className}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {log.isCorrected ? (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase border border-primary/20">
                      {log.humanLabel}
                    </span>
                  ) : (
                    <span className="text-on-surface-variant text-xs font-medium">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${log.confidence < 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {log.confidence}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {log.isCorrected ? (
                    <span className="text-[10px] font-bold text-primary px-3 py-1.5 bg-primary/10 rounded uppercase">Đã gán</span>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                      className="text-[10px] font-bold text-on-secondary px-3 py-1.5 bg-secondary rounded hover:opacity-80 transition-colors uppercase"
                    >
                      Gán nhãn
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
              <h3 className="text-headline-sm text-on-surface">
                Chi tiết nhận diện: {selectedLog.id}
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-surface-variant rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center overflow-y-auto">
              {selectedLog.snapshotUrl ? (
                <div className="w-full bg-black rounded-lg overflow-hidden flex justify-center border border-outline-variant">
                  <img 
                    src={selectedLog.snapshotUrl} 
                    alt={`Snapshot for ${selectedLog.id}`}
                    className="max-h-[60vh] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="200" viewBox="0 0 100 200"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999">Ảnh không khả dụng hoặc bị lỗi 404</text></svg>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-surface-container rounded-lg flex items-center justify-center border border-outline-variant border-dashed">
                  <p className="text-on-surface-variant">Không có dữ liệu hình ảnh</p>
                </div>
              )}
              
              <div className="mt-6 w-full grid grid-cols-2 gap-4 text-sm">
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Phân loại AI</span>
                  <p className="text-on-surface font-bold text-lg mt-1">{selectedLog.className}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Độ tin cậy</span>
                  <p className={`font-bold text-lg mt-1 ${selectedLog.confidence < 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedLog.confidence}%
                  </p>
                </div>
                <div className="col-span-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">Thời gian chụp</span>
                  <p className="text-on-surface font-bold mt-1">{selectedLog.timestamp}</p>
                </div>
              </div>
              
              {/* Assign Label Section */}
              <div className="mt-6 w-full border-t border-outline-variant pt-4">
                <h4 className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-3 text-center">
                  Đánh giá của con người (Gán nhãn)
                </h4>
                
                {selectedLog.isCorrected && selectedLog.humanLabel ? (
                  <div className="bg-primary/10 text-primary p-3 rounded-lg text-center font-bold text-sm border border-primary/20">
                    Đã xác nhận nhãn: {selectedLog.humanLabel}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Ripe', 'Unripe', 'Overripe', 'Rotten'].map(label => (
                      <button
                        key={label}
                        onClick={() => {
                          if (onLabelAssign) onLabelAssign(selectedLog.rawId, label);
                          setSelectedLog({ ...selectedLog, isCorrected: 1, humanLabel: label });
                        }}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors
                          ${selectedLog.className === label 
                            ? 'bg-surface-variant border-outline text-on-surface hover:bg-outline' 
                            : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-variant'
                          }
                        `}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
