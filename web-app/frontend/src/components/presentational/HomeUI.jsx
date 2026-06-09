import { motion } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { 
  ArrowRight, Cpu, Wifi, Camera, BarChart3, Leaf, 
  Zap, Shield, Globe, Play, Server, Monitor,
  Database, Code2, CheckCircle2, AlertTriangle, Info, Layers
} from 'lucide-react';

/* ── Animation Variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Helpers from Old AboutUI & New UI ── */
function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
      />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="text-xl font-black text-on-surface mb-3 relative z-10">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed relative z-10">{desc}</p>
    </motion.div>
  );
}

function StepItem({ num, title, desc }) {
  return (
    <motion.div variants={fadeInUp} className="flex gap-5 relative">
      <div className="w-12 h-12 rounded-full bg-surface-container border-2 border-primary/30 flex items-center justify-center shrink-0 shadow-lg glow-green z-10">
        <span className="text-primary font-black">{num}</span>
      </div>
      <div className="pb-8">
        <h4 className="text-lg font-black text-on-surface mb-2">{title}</h4>
        <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

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

function ArchNode({ icon: Icon, label, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
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

function Arrow() {
  return (
    <div className="flex items-center self-start mt-5">
      <div className="h-0.5 w-8 bg-outline-variant" />
      <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant -ml-1" />
    </div>
  );
}

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
export default function HomeUI() {
  const setView = useUIStore((state) => state.setView);

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 overflow-hidden">
      
      {/* ── Hero Section (New Landing) ── */}
      <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-[85vh]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex-1 space-y-8 z-10 text-center lg:text-left">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 bg-primary/5">
            <span className="flex w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">v1.0 Edge AI System</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-[3rem] lg:text-[4.5rem] leading-[1.1] font-black text-on-surface tracking-tight">
            Smart Sorting <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Powered by Edge AI
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-on-surface-variant max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Hệ thống phân loại chất lượng trái cây theo thời gian thực sử dụng trí tuệ nhân tạo trên thiết bị biên (Edge). Xử lý ảnh siêu tốc, giám sát từ xa và thống kê sản lượng chuyên nghiệp.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl bg-gradient-primary text-white text-sm font-black uppercase tracking-wider shadow-xl shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all duration-300"
            >
              <Play className="w-5 h-5 fill-current" />
              Mở Dashboard Ngay
            </button>
            <button 
              onClick={() => setView('analytics')}
              className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl glass-card border-outline-variant text-on-surface text-sm font-bold hover:bg-surface-container transition-all duration-300"
            >
              <BarChart3 className="w-5 h-5" />
              Xem Báo Cáo
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50, rotateY: 15 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 w-full max-w-2xl relative z-10 perspective-1000"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-low/50 transform-gpu hover:scale-[1.02] transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay" />
            <img src="/images/hero.png" alt="Dashboard Mockup" className="w-full h-auto object-cover" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Leaf className="w-5 h-5 text-green-400" /></div>
                <div>
                  <p className="text-white font-bold text-sm">Real-time Analysis</p>
                  <p className="text-green-400 text-xs font-mono font-bold">120 FPS Active</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Accuracy</p>
                <p className="text-white text-xl font-black">99.8%</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid (New UI) ── */}
      <section className="py-24 relative">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16 space-y-4"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-black text-on-surface">Công Nghệ Đột Phá</motion.h2>
          <motion.p variants={fadeInUp} className="text-on-surface-variant max-w-2xl mx-auto">Kiến trúc phần mềm tối ưu cho tốc độ và độ tin cậy trong môi trường công nghiệp khắc nghiệt.</motion.p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <FeatureCard 
            icon={Cpu} color="#22c55e" 
            title="Edge Processing" 
            desc="Sức mạnh xử lý AI đặt ngay tại biên (QCS6490). Không phụ thuộc internet, độ trễ cực thấp, bảo mật dữ liệu tuyệt đối." 
          />
          <FeatureCard 
            icon={Wifi} color="#0ea5e9" 
            title="WebSocket Stream" 
            desc="Truyền tải luồng video và kết quả phân loại theo thời gian thực đến Dashboard mà không làm gián đoạn trải nghiệm." 
          />
          <FeatureCard 
            icon={BarChart3} color="#f59e0b" 
            title="Actionable Analytics" 
            desc="Biểu đồ trực quan, theo dõi Yield Rate và phát hiện xu hướng hỏng hóc để tối ưu hóa dây chuyền sản xuất." 
          />
        </motion.div>
      </section>

      {/* ── How it Works (Split New UI) ── */}
      <section className="py-24 relative border-t border-outline-variant/30">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="flex-1 w-full rounded-3xl overflow-hidden relative shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <img src="/images/factory.png" alt="Factory Conveyor" className="w-full h-full object-cover aspect-square sm:aspect-video lg:aspect-square" />
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <h3 className="text-white text-2xl font-black mb-2">Automated Conveyor Integration</h3>
              <p className="text-white/80 text-sm">Cảm biến và camera đồng bộ hóa với băng chuyền để phân tích từng sản phẩm với tốc độ mili-giây.</p>
            </div>
          </motion.div>

          <div className="flex-1 w-full">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-4"
            >
              <motion.div variants={fadeInUp} className="mb-10">
                <h2 className="text-3xl lg:text-4xl font-black text-on-surface mb-4">Luồng Hoạt Động</h2>
                <p className="text-on-surface-variant">Từ hình ảnh thô đến bảng báo cáo chi tiết chỉ trong nháy mắt.</p>
              </motion.div>

              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-6 bottom-16 left-6 w-0.5 bg-surface-container-high" />

                <StepItem num="1" title="Thu Thập Hình Ảnh" desc="Camera độ phân giải cao ghi lại hình ảnh sản phẩm liên tục trên băng chuyền." />
                <StepItem num="2" title="Phân Tích Bằng AI" desc="Thuật toán Deep Learning tại Edge phân tích bề mặt, màu sắc, xác định độ chín và phát hiện nấm mốc." />
                <StepItem num="3" title="Truyền Tải Real-time" desc="Dữ liệu và Frame hình được gửi ngay lập tức lên Backend thông qua giao thức Socket.io." />
                <StepItem num="4" title="Dashboard & Quyết Định" desc="Web UI hiển thị kết quả, người quản lý dễ dàng theo dõi, trích xuất báo cáo hoặc hiệu chỉnh lại nhãn nếu cần." />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Old AboutUI Sections Integrated Below ── */}
      <div className="max-w-4xl mx-auto space-y-10 mt-20 pt-10 border-t border-outline-variant/30">
        
        {/* Architecture */}
        <FadeUp delay={0}>
          <div className="glass-card rounded-2xl p-7 relative z-10">
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
                <p className="text-on-surface-variant">Stream frame qua WebSocket. Kết quả AI gửi qua REST API POST.</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant">
                <p className="font-black text-on-surface mb-1">③ Backend → Web UI</p>
                <p className="text-on-surface-variant">Backend relay frame xuống browser qua Socket.io. Stats trả về qua REST API.</p>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* AI Labels */}
        <FadeUp delay={0.1}>
          <div className="glass-card rounded-2xl p-7 relative z-10">
            <SectionTitle icon={Zap} title="Nhãn AI & Ngưỡng tin cậy" sub="Mô hình phân loại 4 lớp với bộ lọc confidence" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <LabelItem color="#22c55e" label="Ripe — Chín đúng độ" desc="Quả đạt tiêu chuẩn xuất xưởng. Màu vàng đều, không đốm." />
                <LabelItem color="#eab308" label="Unripe — Còn xanh" desc="Quả chưa chín. Có thể để thêm 2-3 ngày trước khi đóng gói." />
                <LabelItem color="#f97316" label="Overripe — Chín rục" desc="Quả quá chín. Cần tách riêng để chế biến hoặc loại bỏ." />
                <LabelItem color="#ef4444" label="Rotten — Hỏng/Thối" desc="Quả bị hỏng. Phải loại ra ngay, không để lây sang quả khác." />
                <LabelItem color="#9ca3af" label="Unknown — Không xác định" desc="Độ tin cậy AI < 70%. Cần kiểm tra thủ công." />
              </div>
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-black text-amber-800 dark:text-amber-300">Confidence Threshold: 70%</p>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Nếu dự đoán cao nhất &lt; 70%, hệ thống gán nhãn <strong>Unknown</strong>.</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Yield Rate là gì?</p>
                  <p className="text-xs text-on-surface-variant"><strong className="text-on-surface">Yield Rate</strong> = (Ripe + Unripe) / Tổng × 100%</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Rejected là gì?</p>
                  <p className="text-xs text-on-surface-variant"><strong className="text-on-surface">Rejected</strong> = Overripe + Rotten</p>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Tech Stack */}
        <FadeUp delay={0.2}>
          <div className="glass-card rounded-2xl p-7 relative z-10">
            <SectionTitle icon={Code2} title="Công nghệ sử dụng" sub="Stack đầy đủ từ firmware đến frontend" />
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Frontend</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <TechChip name="React 19" role="UI Framework" icon={Globe} color="#0ea5e9" />
                  <TechChip name="Tailwind v4" role="CSS Utility" icon={Layers} color="#06b6d4" />
                  <TechChip name="Framer Motion" role="Animation" icon={Zap} color="#8b5cf6" />
                  <TechChip name="Recharts" role="Data Visualization" icon={BarChart3} color="#22c55e" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Backend</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <TechChip name="Node.js" role="Runtime" icon={Server} color="#84cc16" />
                  <TechChip name="Socket.io" role="WebSocket" icon={Wifi} color="#f59e0b" />
                  <TechChip name="SQLite" role="Database" icon={Database} color="#64748b" />
                  <TechChip name="Express.js" role="HTTP Server" icon={Globe} color="#6366f1" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Edge AI</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <TechChip name="Python 3.x" role="Runtime" icon={Code2} color="#3b82f6" />
                  <TechChip name="OpenCV" role="Vision" icon={Camera} color="#ef4444" />
                  <TechChip name="Custom Vision" role="Model" icon={Cpu} color="#0284c7" />
                  <TechChip name="Socket.io-client" role="Client" icon={Wifi} color="#f59e0b" />
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* How to run */}
        <FadeUp delay={0.25}>
          <div className="glass-card rounded-2xl p-7 relative z-10">
            <SectionTitle icon={Info} title="Hướng dẫn chạy (Development)" sub="Thứ tự khởi động các service" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '01', label: 'Backend Server', cmds: ['cd web-app/', 'npm run dev'], color: '#22c55e' },
                { step: '02', label: 'AI Mock (Test)', cmds: ['cd firmware/', 'python mock_ai.py'], color: '#f59e0b' },
                { step: '03', label: 'Camera Firmware', cmds: ['cd firmware/', 'python realtime.py --laptop'], color: '#6366f1' },
              ].map((s) => (
                <div key={s.step} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg" style={{ backgroundColor: s.color + '20', color: s.color }}>STEP {s.step}</span>
                    <p className="text-sm font-black text-on-surface">{s.label}</p>
                  </div>
                  <div className="bg-black/80 rounded-lg p-3 mb-3 font-mono">
                    {s.cmds.map((cmd, i) => (
                      <p key={i} className="text-[11px] text-green-400 leading-relaxed">
                        <span className="text-green-600 select-none">$ </span>{cmd}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ── CTA ── */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="py-16 mt-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-primary text-center px-6"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">Sẵn sàng trải nghiệm <br />AgriVision Edge?</h2>
          <p className="text-primary-50 text-lg">Hệ thống đã được thiết lập sẵn. Bấm để truy cập ngay vào không gian giám sát thời gian thực.</p>
          <button 
            onClick={() => setView('dashboard')}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-primary text-base font-black uppercase tracking-wider hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            Vào Trang Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.section>

    </div>
  );
}
