import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { Video, Users, MessageSquare, Calendar, Settings, Bell, Search, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const mockCalls = [
  { name: "Sarah Chen", time: "2 min ago", type: "video", initials: "SC", gradient: "from-indigo-500 to-purple-500" },
  { name: "John Doe", time: "1 hour ago", type: "audio", initials: "JD", gradient: "from-blue-500 to-cyan-500" },
  { name: "Team Standup", time: "3 hours ago", type: "video", initials: "TS", gradient: "from-purple-500 to-pink-500" },
  { name: "Mike Ross", time: "Yesterday", type: "video", initials: "MR", gradient: "from-emerald-500 to-teal-500" },
  { name: "Emma Wilson", time: "2 days ago", type: "audio", initials: "EW", gradient: "from-orange-500 to-red-500" },
  { name: "Client Demo", time: "3 days ago", type: "video", initials: "CD", gradient: "from-cyan-500 to-blue-500" },
];

// Keyboard layout
const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

export function DesktopShowcase() {
  const ref = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });

  const lidRotation = useTransform(scrollYProgress, [0, 0.5, 1], [95, -35, -35]);
  
 
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);
  
  // Screen opacity fades in as laptop opens
  const screenOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0.3, 1]);

  useEffect(() => {
    let pos = 0;
    const interval = setInterval(() => {
      pos += 0.6;
      if (pos > 800) pos = 0;
      setScrollProgress(pos);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 30;
    const y = (e.clientY - rect.top - rect.height / 2) / 30;
    setMousePos({ x, y });
  };

  return (
    <section ref={ref} className="relative py-28 px-4 min-h-screen flex items-center overflow-x-clip">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background pointer-events-none" />

      {/* soft decorative orbs */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/24 to-pink-500/24 blur-3xl pointer-events-none"
      />
      
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl w-full">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* left content: headline / features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 lg:order-1 order-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/8 to-pink-500/8 border border-purple-500/14 px-4 py-2">
              <Phone className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Desktop Experience</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Seamless Desktop Experience
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Take your conversations anywhere with our powerful desktop app.
                Connect with your team with the same quality and features.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Video, text: "HD video calls on any device", color: "from-indigo-500 to-purple-500" },
                { icon: MessageSquare, text: "Real-time messaging and reactions", color: "from-purple-500 to-pink-500" },
                { icon: Users, text: "Manage teams and contacts easily", color: "from-pink-500 to-rose-500" },
                { icon: Calendar, text: "Schedule and join meetings instantly", color: "from-blue-500 to-cyan-500" }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full rounded-xl bg-background/90 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-gray-300">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* right content: 3D laptop */}
          <motion.div
            style={{ scale }}
            className="relative lg:order-2 order-1 flex justify-center items-center w-full"
            onMouseMove={handleMouseMove}
          >
            <div style={{ perspective: "1500px" }} className="w-full flex justify-center">
              <motion.div
                animate={{
                  rotateX: mousePos.y * 0.3,
                  rotateY: mousePos.x * 0.3,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative"
              >
                {/* Laptop Base */}
                <div
                  style={{
                    width: "550px",
                    transformStyle: "preserve-3d",
                  }}
                  className="mx-auto"
                >
                  {/* SCREEN PART with opening animation */}
                  <motion.div
                    style={{
                      rotateX: lidRotation,
                      transformStyle: "preserve-3d",
                      transformOrigin: "bottom center",
                    }}
                    className="relative"
                  >
                    {/* Screen Bezel */}
                    <div className="relative rounded-t-2xl p-3 bg-gradient-to-br from-gray-900 to-black shadow-2xl"
                      style={{
                        background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      {/* Webcam */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                      </div>

                      {/* Screen Content */}
                      <motion.div 
                        style={{ opacity: screenOpacity }}
                        className="relative w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-lg overflow-hidden border border-white/5"
                        {...{
                          style: {
                            aspectRatio: "16/10",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
                            opacity: screenOpacity,
                          }
                        } }
                      >
                        {/* Screen glare effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Title bar */}
                        <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-b from-black/30 to-transparent border-b border-white/6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors cursor-pointer" />
                            <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-300 transition-colors cursor-pointer" />
                          </div>
                          <div className="flex-1 text-center text-sm text-gray-300">CallApp — Recent</div>
                          <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-pointer" />
                            <Settings className="w-4 h-4 text-gray-400 hover:text-white transition-colors cursor-pointer" />
                          </div>
                        </div>

                        <div className="flex h-full">
                          {/* Left sidebar */}
                          <aside className="w-48 bg-gradient-to-b from-transparent to-black/6 border-r border-white/6 p-3 hidden sm:block">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/4">
                                <Search className="w-4 h-4 text-gray-300" />
                                <input className="bg-transparent outline-none text-sm text-white placeholder:text-gray-400 w-full" placeholder="Search..." readOnly />
                              </div>

                              <nav className="mt-2 space-y-1">
                                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm">
                                  <Video className="w-4 h-4" />
                                  <span>Calls</span>
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/3 text-gray-200 text-sm transition-colors">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Chat</span>
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/3 text-gray-200 text-sm transition-colors">
                                  <Users className="w-4 h-4" />
                                  <span>Teams</span>
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/3 text-gray-200 text-sm transition-colors">
                                  <Calendar className="w-4 h-4" />
                                  <span>Calendar</span>
                                </button>
                              </nav>
                            </div>
                          </aside>

                          {/* Main content */}
                          <main className="flex-1 p-4 overflow-hidden">
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <h3 className="text-base font-semibold text-white">Recent Calls</h3>
                                <div className="text-xs text-gray-400">Newest first</div>
                              </div>
                            </div>

                            {/* scroll area */}
                            <div className="relative h-48 overflow-hidden rounded-lg border border-white/6 bg-background/5">
                              <motion.div
                                animate={{ y: -scrollProgress }}
                                transition={{ duration: 0.04, ease: "linear" }}
                                className="space-y-1 p-2"
                              >
                                {[...mockCalls, ...mockCalls].map((call, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/3 transition-colors cursor-pointer">
                                    <div className={`p-0.5 rounded-full bg-gradient-to-br ${call.gradient}`}>
                                      <Avatar className="w-8 h-8 border-2 border-background">
                                        <AvatarFallback className={`bg-gradient-to-br ${call.gradient} text-white text-xs`}>{call.initials}</AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white text-xs font-medium">{call.name}</div>
                                      <div className="text-gray-400 text-xs flex items-center gap-1">
                                        {call.type === "video" ? <Video className="w-2 h-2" /> : <Phone className="w-2 h-2" />}
                                        <span>{call.time}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            </div>

                            {/* stats */}
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/8 to-purple-500/8 border border-white/6">
                                <div className="text-xs text-gray-300">Active</div>
                                <div className="text-white text-sm font-semibold">3</div>
                              </div>
                              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/8 to-pink-500/8 border border-white/6">
                                <div className="text-xs text-gray-300">Missed</div>
                                <div className="text-white text-sm font-semibold">1</div>
                              </div>
                              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/8 to-blue-500/8 border border-white/6">
                                <div className="text-xs text-gray-300">Scheduled</div>
                                <div className="text-white text-sm font-semibold">4</div>
                              </div>
                            </div>
                          </main>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* HINGE - connects screen to base */}
                  <div
                    style={{
                      height: "10px",
                      background: "linear-gradient(90deg, #2a2a3e 0%, #1a1a2e 50%, #2a2a3e 100%)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.5)",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      borderBottom: "1px solid rgba(0,0,0,0.5)",
                    }}
                    className="relative rounded-sm"
                  >
                    {/* Hinge screws */}
                    <div className="absolute top-1/2 left-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-800 border border-gray-700" />
                    <div className="absolute top-1/2 right-12 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-800 border border-gray-700" />
                  </div>

                  {/* KEYBOARD/BASE PART */}
                  <div
                    style={{
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                    className="relative w-full rounded-b-2xl p-6 pt-8"
                  >
                    {/* Speaker grilles */}
                    <div className="absolute top-3 left-1/4 right-1/4 flex justify-between">
                      <div className="flex gap-0.5">
                        {[...Array(30)].map((_, i) => (
                          <div key={`sp-l-${i}`} className="w-0.5 h-1.5 rounded-full bg-gray-800/60" />
                        ))}
                      </div>
                    </div>

                    {/* Power Button */}
                    <div className="absolute top-3 right-6 flex flex-col items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                        style={{
                          boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        <motion.div 
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" 
                        />
                      </motion.button>
                    </div>

                    {/* Realistic Keyboard with individual keys */}
                    <div className="space-y-1.5 mb-6 px-4">
                      {/* Row 1 - Number row */}
                      <div className="flex gap-1 justify-center">
                        {keyboardRows[0].map((key, i) => (
                          <motion.div
                            key={`r1-${i}`}
                            whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)" }}
                            className="w-8 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-pointer"
                            style={{
                              boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="text-[8px] text-gray-300 select-none">{key}</span>
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-16 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[8px] text-gray-300 select-none">DEL</span>
                        </motion.div>
                      </div>

                      {/* Row 2 - QWERTY row */}
                      <div className="flex gap-1 justify-center">
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-12 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[8px] text-gray-300 select-none">TAB</span>
                        </motion.div>
                        {keyboardRows[1].map((key, i) => (
                          <motion.div
                            key={`r2-${i}`}
                            whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)" }}
                            className="w-8 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-pointer"
                            style={{
                              boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="text-[8px] text-gray-300 select-none">{key}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Row 3 - ASDF row */}
                      <div className="flex gap-1 justify-center">
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-14 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[8px] text-gray-300 select-none">CAPS</span>
                        </motion.div>
                        {keyboardRows[2].map((key, i) => (
                          <motion.div
                            key={`r3-${i}`}
                            whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)" }}
                            className="w-8 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-pointer"
                            style={{
                              boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="text-[8px] text-gray-300 select-none">{key}</span>
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-16 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[8px] text-gray-300 select-none">ENTER</span>
                        </motion.div>
                      </div>

                      {/* Row 4 - ZXCV row */}
                      <div className="flex gap-1 justify-center">
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-16 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[8px] text-gray-300 select-none">SHIFT</span>
                        </motion.div>
                        {keyboardRows[3].map((key, i) => (
                          <motion.div
                            key={`r4-${i}`}
                            whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)" }}
                            className="w-8 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-pointer"
                            style={{
                              boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="text-[8px] text-gray-300 select-none">{key}</span>
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-20 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[8px] text-gray-300 select-none">SHIFT</span>
                        </motion.div>
                      </div>

                      {/* Row 5 - Space bar row */}
                      <div className="flex gap-1 justify-center">
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-10 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[7px] text-gray-300 select-none">FN</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-10 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[7px] text-gray-300 select-none">CTRL</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-10 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[7px] text-gray-300 select-none">OPT</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)" }}
                          className="flex-1 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            maxWidth: "240px",
                          }}
                        />
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="w-10 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                          style={{
                            boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-[7px] text-gray-300 select-none">CMD</span>
                        </motion.div>
                        <div className="flex gap-1">
                          <motion.div
                            whileHover={{ y: -1 }}
                            className="w-8 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                            style={{
                              boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="text-[8px] text-gray-300 select-none">←</span>
                          </motion.div>
                          <div className="flex flex-col gap-0.5">
                            <motion.div
                              whileHover={{ y: -1 }}
                              className="w-8 h-3 rounded-t bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                              style={{
                                boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                              }}
                            >
                              <span className="text-[8px] text-gray-300 select-none">↑</span>
                            </motion.div>
                            <motion.div
                              whileHover={{ y: -1 }}
                              className="w-8 h-3 rounded-b bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                              style={{
                                boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                              }}
                            >
                              <span className="text-[8px] text-gray-300 select-none">↓</span>
                            </motion.div>
                          </div>
                          <motion.div
                            whileHover={{ y: -1 }}
                            className="w-8 h-7 rounded bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-900 shadow-lg flex items-center justify-center cursor-pointer"
                            style={{
                              boxShadow: "0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="text-[8px] text-gray-300 select-none">→</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Trackpad with realistic details */}
                    <motion.div
                      whileHover={{ boxShadow: "0 0 20px rgba(99, 102, 241, 0.3), inset 0 2px 4px rgba(0,0,0,0.8)" }}
                      className="mx-auto w-48 h-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-inner cursor-pointer"
                      style={{
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.05)",
                      }}
                    >
                      {/* Trackpad subtle texture */}
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-transparent via-white/[0.01] to-transparent" />
                    </motion.div>

                    {/* Brand logo */}
                    <div className="absolute bottom-2 left-6 text-[10px] text-gray-600 tracking-wider font-semibold">
                      CALLAPP
                    </div>

                    {/* Laptop feet indicators */}
                    <div className="absolute -bottom-1 left-8 w-4 h-1 rounded-full bg-gray-800/80" />
                    <div className="absolute -bottom-1 right-8 w-4 h-1 rounded-full bg-gray-800/80" />
                  </div>
                </div>

                {/* Enhanced shadow */}
                <div className="absolute -bottom-4 left-16 right-16 h-2 bg-gradient-to-r from-transparent via-gray-900/60 to-transparent rounded-full blur-lg" />
              </motion.div>
            </div>

            {/* floating accent */}
            <motion.div
              animate={{ y: [0, -16, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500/12 to-purple-500/12 border border-white/8 flex items-center justify-center pointer-events-none"
            >
              <Video className="w-12 h-12 text-indigo-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DesktopShowcase;
