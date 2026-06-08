/**
 * AboutUI — Static presentational page
 * Mô tả hệ thống, kiến trúc, công nghệ và hướng dẫn sử dụng
 */
import { motion } from 'motion/react';
import {
  Leaf, Cpu, Wifi, Camera, BarChart3, History, Github,
  Zap, Shield, Globe, Database, Code2, ArrowRight, CheckCircle2,
  AlertTriangle, Info, Layers, Server, Monitor
} from 'lucide-react';

/* ── Fade-up wrapper ── */
function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section title ── */
function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="text-headline-lg text-on-surface">{title}</h2>
        {sub && <p className="text-sm text-on-surface-variant mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Badge ── */
function Badge({ label, color = 'green' }) {
  const colors = {
    green:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    amber:  'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    blue:   'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    red:    'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[color]}`}>
      {label}
    </span>
  );
}

/* ── Tech chip ── */
function TechChip({ name, role, icon: Icon, color }) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-on-surface leading-tight">{name}</p>
        <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 truncate">{role}</p>
      </div>
    </div>
  );
}

/* ── Arch node ── */
function ArchNode({ icon: Icon, label, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ backgroundColor: color + '20', border: `2px solid ${color}44` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div className="text-center">
        <p className="text-xs font-black text-on-surface">{label}</p>
        <p className="text-[9px] text-on-surface-variant font-medium">{sub}</p>
      </div>
    </motion.div>
  );
}

/* ── Arrow connector ── */
function Arrow() {
  return (
    <div className="flex items-center self-start mt-5">
      <div className="h-0.5 w-8 bg-outline-variant" />
      <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant -ml-1" />
    </div>
  );
}

/* ── Label flow item ── */
function LabelItem({ color, label, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-3.5 h-3.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: color }} />
      <div>
        <p className="text-sm font-black text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant font-medium">{desc}</p>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function AboutUI() {
  return (
    <div className="space-y-10 max-w-4xl">

      {/* ── Hero ── */}
      <FadeUp delay={0}>
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl glow-green shrink-0 animate-float">
              <Leaf className="w-9 h-9 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-display-md text-on-surface leading-tight">AgriVision Edge</h1>
                <Badge label="v1.0" color="green" />
                <Badge label="IoT" color="blue" />
                <Badge label="Edge AI" color="purple" />
              </div>
              <p className="text-base text-on-surface-variant font-medium leading-relaxed max-w-xl">
                Hệ thống phân loại chất lượng chuối theo thời gian thực sử dụng <strong className="text-on-surface">Edge AI</strong> trên thiết bị <strong className="text-on-surface">QCS6490</strong>, truyền dữ liệu qua <strong className="text-on-surface">WebSocket</strong> và hiển thị trên dashboard web hiện đại.
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Architecture ── */}
      <FadeUp delay={0.05}>
        <div className="glass-card rounded-2xl p-7">
          <SectionTitle icon={Layers} title="Kiến trúc hệ thống" sub="Luồng dữ liệu từ Camera → AI → Web" />

          <div className="flex flex-wrap items-start justify-center gap-2 sm:gap-0">
            <ArchNode icon={Camera}  label="Camera"    sub="USB / Laptop"     color="#6366f1" delay={0.1} />
            <Arrow />
            <ArchNode icon={Cpu}     label="Edge AI"   sub="QCS6490 / Laptop" color="#22c55e" delay={0.15} />
            <Arrow />
            <ArchNode icon={Server}  label="Backend"   sub="Node.js + SQLite" color="#f59e0b" delay={0.2} />
            <Arrow />
            <ArchNode icon={Monitor} label="Web App"   sub="React + Vite"     color="#0ea5e9" delay={0.25} />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant">
              <p className="font-black text-on-surface mb-1">① Camera → Firmware</p>
              <p className="text-on-surface-variant">OpenCV đọc frame từ camera, lật mirror, resize và encode JPEG.</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant">
              <p className="font-black text-on-surface mb-1">② Firmware → Backend</p>
              <p className="text-on-surface-variant">Stream frame qua WebSocket (Socket.io). Kết quả AI gửi qua REST API POST <code className="text-primary text-[10px]">/api/v1/inferences</code>.</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant">
              <p className="font-black text-on-surface mb-1">③ Backend → Web UI</p>
              <p className="text-on-surface-variant">Backend relay frame xuống browser qua Socket.io. Stats trả về qua REST API polling 5 giây.</p>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── AI Labels ── */}
      <FadeUp delay={0.1}>
        <div className="glass-card rounded-2xl p-7">
          <SectionTitle icon={Zap} title="Nhãn AI & Ngưỡng tin cậy" sub="Mô hình phân loại 4 lớp với bộ lọc confidence" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <LabelItem color="#22c55e" label="Ripe — Chín đúng độ"
                desc="Quả đạt tiêu chuẩn xuất xưởng. Màu vàng đều, không đốm." />
              <LabelItem color="#eab308" label="Unripe — Còn xanh"
                desc="Quả chưa chín. Có thể để thêm 2-3 ngày trước khi đóng gói." />
              <LabelItem color="#f97316" label="Overripe — Chín rục"
                desc="Quả quá chín. Cần tách riêng để chế biến hoặc loại bỏ." />
              <LabelItem color="#ef4444" label="Rotten — Hỏng/Thối"
                desc="Quả bị hỏng. Phải loại ra ngay, không để lây sang quả khác." />
              <LabelItem color="#9ca3af" label="Unknown — Không xác định"
                desc="Độ tin cậy AI < 70%. Không có chuối trong hình, hoặc ảnh bị mờ/góc lạ." />
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-black text-amber-800 dark:text-amber-300">Confidence Threshold: 70%</p>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Nếu điểm dự đoán cao nhất <strong>&lt; 70%</strong>, hệ thống tự động gán nhãn <strong>Unknown</strong> và vẫn lưu snapshot để người kiểm tra thủ công.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Yield Rate là gì?</p>
                <p className="text-xs text-on-surface-variant">
                  <strong className="text-on-surface">Yield Rate</strong> = (Ripe + Unripe) / Tổng × 100%<br />
                  Đây là tỷ lệ sản phẩm đạt chuẩn. Ripe và Unripe được tính là đạt vì Unripe có thể tiếp tục chín trong quá trình vận chuyển.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Rejected là gì?</p>
                <p className="text-xs text-on-surface-variant">
                  <strong className="text-on-surface">Rejected</strong> = Overripe + Rotten<br />
                  Những sản phẩm này phải loại ra khỏi dây chuyền để tránh lây nhiễm và đảm bảo chất lượng lô hàng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── Features ── */}
      <FadeUp delay={0.15}>
        <div className="glass-card rounded-2xl p-7">
          <SectionTitle icon={Monitor} title="Tính năng" sub="Các màn hình và chức năng của Web App" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Camera, color: '#6366f1', title: 'Dashboard',
                items: ['Live stream từ camera qua WebSocket', 'Confidence Gauge hình bán nguyệt', 'FPS counter overlay thời gian thực', 'Bật/tắt AI phân loại', 'Chụp ảnh snapshot thủ công', 'Thống kê 4 loại chuối với count-up']
              },
              {
                icon: BarChart3, color: '#22c55e', title: 'Analytics',
                items: ['KPI cards: Pass Rate, Rejected Rate, Avg Confidence', 'Area chart xu hướng sản lượng theo ngày', 'Pie chart phân bổ loại thời gian thực', 'Bảng log nhật ký dự đoán', 'Tìm kiếm & lọc theo class', 'Xuất CSV một click']
              },
              {
                icon: History, color: '#f59e0b', title: 'History',
                items: ['Grid ảnh tất cả snapshots đã lưu', 'Lọc theo nhãn: Ripe/Unripe/Overripe/Rotten', 'Tìm kiếm theo ID hoặc ngày chụp', 'Phân trang 12 ảnh/trang', 'Modal xem chi tiết và gán nhãn', 'Xuất CSV lịch sử']
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: feat.color + '20' }}>
                      <Icon className="w-4 h-4" style={{ color: feat.color }} />
                    </div>
                    <p className="font-black text-on-surface">{feat.title}</p>
                  </div>
                  <ul className="space-y-2">
                    {feat.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-on-surface-variant">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </FadeUp>

      {/* ── Tech Stack ── */}
      <FadeUp delay={0.2}>
        <div className="glass-card rounded-2xl p-7">
          <SectionTitle icon={Code2} title="Công nghệ sử dụng" sub="Stack đầy đủ từ firmware đến frontend" />

          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Frontend</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <TechChip name="React 19"      role="UI Framework"        icon={Globe}    color="#0ea5e9" />
                <TechChip name="Tailwind v4"   role="CSS Utility"         icon={Layers}   color="#06b6d4" />
                <TechChip name="Framer Motion" role="Animation"           icon={Zap}      color="#8b5cf6" />
                <TechChip name="Recharts"      role="Data Visualization"  icon={BarChart3} color="#22c55e" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Backend</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <TechChip name="Node.js"     role="Runtime"         icon={Server}   color="#84cc16" />
                <TechChip name="Socket.io"   role="WebSocket"       icon={Wifi}     color="#f59e0b" />
                <TechChip name="SQLite"      role="Database"        icon={Database} color="#64748b" />
                <TechChip name="Express.js"  role="HTTP Server"     icon={Globe}    color="#6366f1" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Firmware / Edge AI</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <TechChip name="Python 3.x"       role="Runtime"               icon={Code2}  color="#3b82f6" />
                <TechChip name="OpenCV"            role="Camera & Vision"       icon={Camera} color="#ef4444" />
                <TechChip name="Custom Vision"     role="AI Model (Azure)"      icon={Cpu}    color="#0284c7" />
                <TechChip name="Socket.io-client"  role="WebSocket Client"      icon={Wifi}   color="#f59e0b" />
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ── How to run ── */}
      <FadeUp delay={0.25}>
        <div className="glass-card rounded-2xl p-7">
          <SectionTitle icon={Info} title="Hướng dẫn chạy (Development)" sub="Thứ tự khởi động các service" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '01', label: 'Backend Server',
                cmds: ['cd web-app/', 'npm install', 'npm run dev'],
                note: 'Chạy trên port 5000. Khởi động trước tiên.',
                color: '#22c55e',
              },
              {
                step: '02', label: 'AI Mock (Test)',
                cmds: ['cd firmware/', 'pip install flask', 'python mock_ai.py'],
                note: 'Chạy trên port 5001. Dùng khi không có thiết bị thật.',
                color: '#f59e0b',
              },
              {
                step: '03', label: 'Camera Firmware',
                cmds: ['cd firmware/', 'pip install -r requirements.txt', 'python realtime.py --laptop'],
                note: 'Thêm --laptop để dùng webcam laptop. Bỏ flag khi chạy QCS6490.',
                color: '#6366f1',
              },
            ].map((s) => (
              <div key={s.step} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg" style={{ backgroundColor: s.color + '20', color: s.color }}>
                    STEP {s.step}
                  </span>
                  <p className="text-sm font-black text-on-surface">{s.label}</p>
                </div>
                <div className="bg-black/80 rounded-lg p-3 mb-3 font-mono">
                  {s.cmds.map((cmd, i) => (
                    <p key={i} className="text-[11px] text-green-400 leading-relaxed">
                      <span className="text-green-600 select-none">$ </span>{cmd}
                    </p>
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ── Footer ── */}
      <FadeUp delay={0.3}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-on-surface">AgriVision Edge</p>
              <p className="text-[10px] text-on-surface-variant">IoT in Factory — University Project</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge label="React 19" color="blue" />
            <Badge label="Socket.io" color="amber" />
            <Badge label="QCS6490" color="purple" />
            <Badge label="OpenCV" color="red" />
          </div>
        </div>
      </FadeUp>

    </div>
  );
}
