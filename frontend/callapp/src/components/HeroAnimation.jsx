import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Video, Users, Mic, Monitor, MessageSquare, Phone } from "lucide-react";

const floatingIcons = [
  { Icon: Video, delay: 0, position: { x: "10%", y: "20%" }, gradient: "from-indigo-500 to-purple-500" },
  { Icon: Users, delay: 0.2, position: { x: "80%", y: "15%" }, gradient: "from-blue-500 to-cyan-500" },
  { Icon: Mic, delay: 0.4, position: { x: "15%", y: "70%" }, gradient: "from-purple-500 to-pink-500" },
  { Icon: Monitor, delay: 0.6, position: { x: "85%", y: "75%" }, gradient: "from-emerald-500 to-teal-500" },
  { Icon: MessageSquare, delay: 0.8, position: { x: "5%", y: "45%" }, gradient: "from-orange-500 to-red-500" },
  { Icon: Phone, delay: 1, position: { x: "90%", y: "45%" }, gradient: "from-cyan-500 to-blue-500" },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

export function HeroAnimation() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating 3D icons */}
      {floatingIcons.map((item, index) => {
        const IconComponent = item.Icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: item.position.x,
              top: item.position.y,
            }}
            initial={{ opacity: 0, scale: 0, rotateX: -180 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              x: mousePosition.x * (index % 2 === 0 ? 1 : -1),
              y: mousePosition.y * (index % 2 === 0 ? 1 : -1),
            }}
            transition={{
              duration: 1,
              delay: item.delay,
              x: { duration: 0.5 },
              y: { duration: 0.5 },
            }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotateY: [0, 360],
              }}
              transition={{
                y: {
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotateY: {
                  duration: 8 + index,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className={`relative size-16 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5 shadow-2xl`}
              style={{ perspective: "1000px" }}
            >
              <div className="size-full rounded-2xl bg-background/90 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <IconComponent className="size-8 text-white" />
              </div>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-50 blur-xl -z-10`} />
            </motion.div>
          </motion.div>
        );
      })}

      {/* 3D Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {floatingIcons.slice(0, -1).map((_, index) => (
          <motion.line
            key={index}
            x1={`${parseFloat(floatingIcons[index].position.x)}`}
            y1={`${parseFloat(floatingIcons[index].position.y)}`}
            x2={`${parseFloat(floatingIcons[index + 1].position.x)}`}
            y2={`${parseFloat(floatingIcons[index + 1].position.y)}`}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1 + index * 0.2 }}
          />
        ))}
      </svg>

      {/* Central glow orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="size-96 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-3xl" />
      </motion.div>
    </div>
  );
}
