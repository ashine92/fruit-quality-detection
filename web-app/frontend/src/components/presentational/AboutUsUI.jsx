import { motion } from 'motion/react';
import { 
  Leaf, Cpu, Wifi, ShieldCheck, Users, 
  Target, TrendingUp, AlertTriangle, Activity, CheckCircle2,
  Factory, Eye, ScanLine, Award, Box, Camera, Microscope
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

function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center flex-col text-center mb-12">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-3xl lg:text-4xl font-black text-on-surface tracking-tight">{title}</h2>
      {sub && <p className="text-on-surface-variant mt-2 max-w-2xl mx-auto">{sub}</p>}
    </div>
  );
}

function ChallengeCard({ icon: Icon, title, desc, color }) {
  return (
    <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-8 border border-outline-variant hover:border-outline transition-colors relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24" style={{ color }} />
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-xl font-black text-on-surface mb-3 relative z-10">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed relative z-10">{desc}</p>
    </motion.div>
  );
}

function TechPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-outline-variant bg-surface-container-low">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{label}</span>
    </div>
  );
}

function TeamMember({ name, role }) {
  return (
    <motion.div variants={fadeInUp} className="flex flex-col items-center text-center p-6 glass-card rounded-3xl hover:-translate-y-2 transition-transform duration-300">
      <div className="w-20 h-20 rounded-full bg-gradient-primary p-[3px] mb-4 shadow-lg glow-green">
        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
          <Users className="w-8 h-8 text-on-surface-variant/50" />
        </div>
      </div>
      <h4 className="text-lg font-black text-on-surface">{name}</h4>
      <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{role}</p>
    </motion.div>
  );
}

export default function AboutUsUI() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-20 overflow-hidden">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 flex flex-col items-center text-center min-h-[60vh] justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 space-y-6 max-w-4xl px-4">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card border border-primary/30 bg-primary/10 mb-4">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">About Our Project</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.1] font-black text-on-surface tracking-tight">
            <span className="whitespace-nowrap">Reshaping Quality Control</span> <br />
            <span className="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              with Artificial Intelligence
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed pt-4">
            The AgriVision Edge system provides an automated fruit sorting solution that combines the speed of machinery with the accuracy of computer vision to completely replace inefficient manual inspection methods.
          </motion.p>
        </motion.div>
      </section>

      {/* ── 2. Industry Challenges ── */}
      <section className="py-20 relative border-t border-outline-variant/30">
        <SectionTitle 
          icon={Factory} 
          title="Industry Challenges" 
          sub="Addressing the ongoing issues in traditional agricultural sorting processes." 
        />
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <ChallengeCard 
            icon={Users} color="#f59e0b"
            title="Labor Dependency" 
            desc="Rising labor costs and shortages of skilled workers make it difficult for facilities to maintain maximum capacity during harvest seasons."
          />
          <ChallengeCard 
            icon={Eye} color="#ef4444"
            title="Subjectivity in Inspection" 
            desc="Manual visual sorting is affected by fatigue, lighting conditions, and personal experience, leading to inconsistent output quality."
          />
          <ChallengeCard 
            icon={Box} color="#84cc16"
            title="Food Waste" 
            desc="Failing to detect spoiled or moldy fruit can cause contamination of healthy products during storage and transit, resulting in significant losses."
          />
        </motion.div>
      </section>

      {/* ── 3. Core Technology ── */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-surface-container-low rounded-[3rem] -z-10" />
        <div className="px-8 lg:px-16 py-16">
          <SectionTitle 
            icon={Microscope} 
            title="Core Technology" 
            sub="We bring data analytics out of the lab and directly into industrial production environments." 
          />

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex-1 w-full space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
                  <span className="flex w-3 h-3 rounded-full bg-primary" /> Edge Computing (QCS6490)
                </h3>
                <p className="text-on-surface-variant leading-relaxed">Instead of sending data to the cloud, the entire recognition process using Convolutional Neural Networks (CNNs) is executed directly on edge devices. This ensures millisecond latency and 100% offline capability.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
                  <span className="flex w-3 h-3 rounded-full bg-blue-500" /> Computer Vision
                </h3>
                <p className="text-on-surface-variant leading-relaxed">"Seeing the invisible." Advanced image processing algorithms scan the entire fruit surface to detect ripeness, rot spots, and mold right on the moving conveyor belt.</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <TechPill icon={Cpu} label="Qualcomm Edge" />
                <TechPill icon={Camera} label="Optical Scanning" />
                <TechPill icon={Wifi} label="IoT Dashboard" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex-1 w-full max-w-md relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-low/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-overlay" />
                <img src="/images/factory.png" alt="Factory Integration" className="w-full h-auto object-cover aspect-square" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. Value Proposition ── */}
      <section className="py-20 relative">
        <SectionTitle 
          icon={Award} 
          title="Value Proposition" 
          sub="Measuring success with real-world industrial metrics." 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <FadeUp delay={0.1}>
            <div className="glass-card p-8 rounded-3xl border border-outline-variant flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-on-surface mb-2">Accuracy &gt; 95%</h4>
                <p className="text-sm text-on-surface-variant">Eliminates human error entirely. Ensures consistent output quality and protects brand reputation.</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="glass-card p-8 rounded-3xl border border-outline-variant flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-on-surface mb-2">Superior Throughput</h4>
                <p className="text-sm text-on-surface-variant">Capable of continuous 24/7 sorting without performance degradation, maximizing Yield Rate.</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="glass-card p-8 rounded-3xl border border-outline-variant flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-on-surface mb-2">Clear Data Traceability</h4>
                <p className="text-sm text-on-surface-variant">All results are stored and visualized on the Dashboard, supporting timely business decisions.</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.4}>
            <div className="glass-card p-8 rounded-3xl border border-outline-variant flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-on-surface mb-2">Cost Optimization</h4>
                <p className="text-sm text-on-surface-variant">Minimizes QC personnel costs and prevents economic losses from contamination spread in storage.</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 5. Project Team ── */}
      <section className="py-20 relative border-t border-outline-variant/30">
        <SectionTitle 
          icon={Users} 
          title="Development Team" 
          sub="The people behind the research and development of this POC." 
        />
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <TeamMember name="Nguyễn Ngọc Hồng Ánh" role="Researcher & Developer" />
          <TeamMember name="Nguyễn Thiện Hưng" role="Researcher & Developer" />
          <TeamMember name="Phan Ngọc Ngân" role="Researcher & Developer" />
          <TeamMember name="Võ Thị Kim Thoa" role="Researcher & Developer" />
        </motion.div>
      </section>

    </div>
  );
}
