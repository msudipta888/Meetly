import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Play, ArrowRight, Sparkles, User } from "lucide-react";
import { LiveVideoCallAnimation } from "./LiveVideoCallAnimation";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import UseAuth from "../context/UseAuth";

export function Hero() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId")

  const ref = useRef(null);
  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-purple-950/50 to-background"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000,transparent)]" />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-0 size-[600px] rounded-full bg-gradient-to-r from-indigo-500/40 to-purple-500/40 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 right-0 size-[600px] rounded-full bg-gradient-to-r from-blue-500/40 to-cyan-500/40 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 w-full">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Heading section */}
          <div className="space-y-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 px-6 py-3 backdrop-blur-xl"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="size-5 text-indigo-400" />
              </motion.div>
              <span className="text-indigo-300">AI-Powered Video Collaboration</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[1.1]">
                <span className="block bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
                  The Future of
                </span>
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Video Meetings
                </span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              >
                Experience crystal-clear video calls with AI-powered features.
                Connect, collaborate, and create together from anywhere in the world.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-2xl shadow-indigo-500/50 group px-8 py-6 text-lg h-auto cursor-pointer"
                  onClick={() => { userId !== undefined ? navigate(`/lobby`) : navigate("/signin") }}
                >
                  Get Started
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-3 bg-white/5 border-white/20 hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg h-auto"
                >
                  <Play className="size-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap gap-8 md:gap-12 justify-center pt-8"
            >
              {[
                { value: "50M+", label: "Active Users", gradient: "from-indigo-400 to-purple-400", glow: "from-indigo-500/20 to-purple-500/20" },
                { value: "4.9/5", label: "User Rating", gradient: "from-blue-400 to-cyan-400", glow: "from-blue-500/20 to-cyan-500/20" },
                { value: "99.9%", label: "Uptime", gradient: "from-emerald-400 to-teal-400", glow: "from-emerald-500/20 to-teal-500/20" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 1.2 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="relative group"
                >
                  <div className={`text-5xl md:text-6xl bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 mt-1">{stat.label}</div>
                  <motion.div
                    className={`absolute -inset-4 bg-gradient-to-r ${stat.glow} blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity`}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-full max-w-6xl"
          >
            <LiveVideoCallAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}