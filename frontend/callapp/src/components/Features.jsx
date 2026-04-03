import { motion, useScroll, useTransform } from "motion/react";
import { 
  Video, 
  Users, 
  Shield, 
  Zap, 
  MessageSquare, 
  ScreenShare,
  Lock,
  Globe
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Video,
    title: "HD Video Quality",
    description: "Crystal-clear 1080p video with adaptive quality for any bandwidth.",
    gradient: "from-indigo-500 to-purple-500",
    position: { row: 1, col: 1 }
  },
  {
    icon: ScreenShare,
    title: "Screen Sharing",
    description: "Share your screen, specific windows, or applications with one click.",
    gradient: "from-blue-500 to-cyan-500",
    position: { row: 1, col: 2 }
  },
  {
    icon: Users,
    title: "5 Participants In Room",
    description: "Host meetings with much participants on all plans.",
    gradient: "from-purple-500 to-pink-500",
    position: { row: 2, col: 1 }
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Keep conversations flowing with integrated chat and reactions.",
    gradient: "from-pink-500 to-rose-500",
    position: { row: 2, col: 2 }
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Bank-level security ensures your conversations stay private.",
    gradient: "from-emerald-500 to-teal-500",
    position: { row: 3, col: 1 }
  },
  {
    icon: Zap,
    title: "Instant Meetings",
    description: "Start or join meetings instantly with no downloads required.",
    gradient: "from-yellow-500 to-orange-500",
    position: { row: 3, col: 2 }
  },
  {
    icon: Lock,
    title: "Meeting Lock",
    description: "Control who joins with waiting rooms and password protection.",
    gradient: "from-red-500 to-pink-500",
    position: { row: 4, col: 1 }
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect from anywhere with servers in 50+ countries worldwide.",
    gradient: "from-cyan-500 to-blue-500",
    position: { row: 4, col: 2 }
  }
];

export function Features() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);

  return (
    <section ref={containerRef} className="relative py-32 px-4 mt-6 overflow-hidden" id="features">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-indigo-950/20 to-background" />
      
      <motion.div 
        style={{ y }}
        className="absolute top-1/4 right-0 size-[500px] rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl"
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        className="absolute bottom-1/4 left-0 size-[500px] rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-4 py-2 backdrop-blur-sm mb-6">
              <Zap className="size-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">Powerful Features</span>
            </div>
          </motion.div>
          <h2 className="text-5xl md:text-6xl bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Everything You Need for Better Meetings
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to make remote collaboration feel natural and effortless.
          </p>
        </motion.div>

        {/* 3D Feature Grid */}
        <div className="relative" style={{ perspective: "2000px" }}>
          <motion.div
            style={{ rotateX }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const cardRef = useRef<HTMLDivElement>(null);
              const { scrollYProgress: cardProgress } = useScroll({
                target: cardRef,
                offset: ["start end", "end start"]
              });

              const cardY = useTransform(cardProgress, [0, 0.5, 1], [50, 0, -50]);
              const cardRotateY = useTransform(
                cardProgress, 
                [0, 0.5, 1], 
                [index % 2 === 0 ? -15 : 15, 0, index % 2 === 0 ? 15 : -15]
              );
              const cardScale = useTransform(cardProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

              return (
                <motion.div
                  key={index}
                  ref={cardRef}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: (index % 2) * 0.1 }}
                  style={{
                    y: cardY,
                    rotateY: cardRotateY,
                    scale: cardScale,
                  }}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: index % 2 === 0 ? 5 : -5,
                      z: 50,
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 overflow-hidden"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />

                    {/* Floating icon */}
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ 
                        rotateY: 360,
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className={`relative size-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 shadow-2xl`}>
                        <div className="size-full rounded-2xl bg-background/90 flex items-center justify-center">
                          <Icon className="size-8 text-white" />
                        </div>
                      </div>
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-50`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>

                    <div className="relative space-y-3" style={{ transform: "translateZ(20px)" }}>
                      <h3 className="text-2xl text-white">{feature.title}</h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className={`absolute -top-20 -right-20 size-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                    <div className={`absolute -bottom-20 -left-20 size-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                        backgroundSize: "200% 200%",
                      }}
                      animate={{
                        backgroundPosition: ["0% 0%", "200% 200%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />

                    <motion.div
                      className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      style={{
                        background: `linear-gradient(45deg, transparent, ${feature.gradient.includes('indigo') ? '#6366f1' : feature.gradient.includes('blue') ? '#3b82f6' : feature.gradient.includes('purple') ? '#8b5cf6' : feature.gradient.includes('pink') ? '#ec4899' : feature.gradient.includes('emerald') ? '#10b981' : feature.gradient.includes('yellow') ? '#f59e0b' : feature.gradient.includes('red') ? '#ef4444' : '#06b6d4'})`,
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        padding: "2px",
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
