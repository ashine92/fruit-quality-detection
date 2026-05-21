import { ArrowLeft, Aperture, Sun, Focus, Palette, RotateCcw, CheckCircle2, Video } from 'lucide-react';
import { motion } from 'motion/react';

export default function Configuration() {
  const controls = [
    {
      group: 'Phơi sáng (Exposure)',
      icon: Aperture,
      variants: [
        { label: 'Thời gian phơi sáng', value: '1/250s', min: '1/1000s', max: '1/30s' },
        { label: 'Độ lợi (ISO/Gain)', value: '400', min: '100', max: '3200' },
      ]
    },
    {
      group: 'Cân bằng trắng (White Balance)',
      icon: Sun,
      variants: [
        { label: 'Nhiệt độ màu (K)', value: '5600K', min: '2000', max: '10000' },
      ]
    },
    {
      group: 'Lấy nét (Focus)',
      icon: Focus,
      variants: [
        { label: 'Tiêu cự thủ công', value: '0.85m', min: 'Macro', max: 'Infinity' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded bg-surface-container hover:bg-surface-variant transition-colors text-on-surface">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-display-md text-on-surface">Điều chỉnh Camera Thủ công</h2>
          <p className="text-on-surface-variant max-w-2xl">Tùy chỉnh các thông số quang học để tối ưu hóa hình ảnh đầu vào cho mô hình AI trong điều kiện ánh sáng đặc thù.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 flex flex-col gap-2">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
             <div className="bg-surface-container h-12 flex items-center justify-between px-4 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs uppercase tracking-widest">LIVE FEED: CAM_01</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                <span className="font-bold text-[10px] text-[#ba1a1a] uppercase tracking-tighter">Rec</span>
              </div>
            </div>
            
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
               <img 
                 className="absolute inset-0 w-full h-full object-cover opacity-70" 
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOVeEZcLOspJaPrPkz1U1cMgOUheDVLcxZIGDQYanoGzGOhrP-uBjsl6l7AjtWCfJaB8h1OuQSgAAwgKqitbwuBOeVAkc-JysxjvC-wL7TUQGP1QxaYeDZx22SVb_TUPOahOD_Qp_pDgnvex_2Uahg3hG1oVAdOONZ9UgTpg_BwGTL0fDSAI3vzsQMS5aZ9rVEfKzRKMjajTxLkGKFnyQyIQ-5NDbQwj4hsTwJZfDF-mZgrqxaKzeVIOTGTM3hoJDIkbXsywSKpDsb" 
               />
               
               <div className="absolute inset-0 border-2 border-white/10 pointer-events-none">
                 <div className="absolute top-1/3 w-full border-t border-white/10"></div>
                 <div className="absolute top-2/3 w-full border-t border-white/10"></div>
                 <div className="absolute left-1/3 h-full border-l border-white/10"></div>
                 <div className="absolute left-2/3 h-full border-l border-white/10"></div>
               </div>

               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 border border-white/40 relative">
                    <div className="absolute top-1/2 -left-3 w-6 h-px bg-white/40"></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-px bg-white/40"></div>
                    <div className="absolute -top-3 left-1/2 w-px h-6 bg-white/40"></div>
                    <div className="absolute -bottom-3 left-1/2 w-px h-6 bg-white/40"></div>
                  </div>
               </div>

               <div className="absolute bottom-6 left-6 w-48 h-32 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant rounded-lg p-3 flex flex-col shadow-2xl">
                 <span className="text-[10px] font-bold text-on-surface tracking-widest mb-2">HISTOGRAM</span>
                 <div className="flex-1 flex items-end gap-1">
                   {[30, 45, 60, 40, 75, 90, 85, 65, 50, 35, 20, 15].map((h, i) => (
                     <div key={i} className="flex-1 bg-outline-variant rounded-t-sm" style={{ height: `${h}%` }}></div>
                   ))}
                 </div>
                 <div className="flex justify-between mt-2 text-[8px] font-mono opacity-50">
                   <span>0</span><span>255</span>
                 </div>
               </div>

               <div className="absolute top-6 right-6 space-y-2">
                  <div className="bg-black/40 backdrop-blur px-3 py-1 rounded text-[10px] font-mono text-white border border-white/20">FPS: 60.0</div>
                  <div className="bg-black/40 backdrop-blur px-3 py-1 rounded text-[10px] font-mono text-white border border-white/20">RES: 4K UHD</div>
               </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm flex-1 p-6 flex flex-col gap-8 overflow-y-auto max-h-[700px]">
            {controls.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.group} className="space-y-6">
                  <h3 className="text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                       <Icon className="w-5 h-5 text-on-surface-variant" />
                    </div>
                    {group.group}
                  </h3>
                  <div className="space-y-6 px-1">
                    {group.variants.map((v) => (
                      <div key={v.label} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-on-surface-variant">{v.label}</label>
                          <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded border border-outline-variant font-bold">{v.value}</span>
                        </div>
                        <div className="relative pt-2">
                           <input 
                             type="range" 
                             className="w-full"
                           />
                           <div className="flex justify-between mt-2 text-[10px] text-outline font-bold uppercase tracking-tighter">
                             <span>{v.min}</span>
                             <span>{v.max}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="space-y-6">
               <h3 className="text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                    <Palette className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  Xử lý màu sắc
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Saturation</label>
                    <div className="flex items-center gap-3">
                       <input type="range" className="flex-1" />
                       <span className="text-xs font-bold">110%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Contrast</label>
                    <div className="flex items-center gap-3">
                       <input type="range" className="flex-1" />
                       <span className="text-xs font-bold">125%</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button className="flex-1 h-12 bg-surface-container-highest text-on-surface text-label-bold rounded-xl border border-outline-variant hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
              <RotateCcw className="w-4 h-4" /> Đặt lại mặc định
            </button>
            <button className="flex-[1.5] h-12 bg-primary text-on-primary text-label-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
              <CheckCircle2 className="w-4 h-4" /> Áp dụng cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
