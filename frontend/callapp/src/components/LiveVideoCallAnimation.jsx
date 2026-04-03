import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { 
  Video, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Users, 
  MessageSquare, 
  Settings,
  VideoOff,
  Sparkles,
  Zap,
  Shield,
  Camera,
  Grid3x3,
  Maximize2,
  Volume2
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

const participants = [
  { 
    name: "Alex Rivera", 
    initials: "AR", 
    role: "CEO",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    status: "speaking",
  },
  { 
    name: "Sarah Kim", 
    initials: "SK", 
    role: "Designer",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    status: "active",
  },
  { 
    name: "Jordan Lee", 
    initials: "JL", 
    role: "Developer",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    status: "active",
  },
  { 
    name: "Morgan Park", 
    initials: "MP", 
    role: "Product",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    status: "muted",
  },
  { 
    name: "Taylor Swift", 
    initials: "TS", 
    role: "Marketing",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    status: "active",
  },
];

const floatingIcons = [
  { icon: Sparkles, color: "text-purple-400", delay: 0 },
  { icon: Zap, color: "text-cyan-400", delay: 0.5 },
  { icon: Shield, color: "text-emerald-400", delay: 1 },
];

export function LiveVideoCallAnimation() {
  const [activeParticipant, setActiveParticipant] = useState(0);
  const [showParticipants, setShowParticipants] = useState(true);
  const [notification, setNotification] = useState("");
  const [audioLevels, setAudioLevels] = useState(Array(12).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveParticipant((prev) => (prev + 1) % participants.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevels(Array.from({ length: 12 }, () => Math.random() * 100));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const notifications = [
      "🎉 Sarah joined the call",
      "📺 Screen sharing started",
      "💬 New message received",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setNotification(notifications[index % notifications.length]);
      setTimeout(() => setNotification(""), 3000);
      index++;
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-20 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-sm text-purple-300">Next-Gen Video Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Crystal Clear Connections
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the future of video calling with AI-powered clarity and seamless collaboration
          </p>
        </motion.div>

        {/* Main video interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glassmorphic container */}
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
            
            {/* Top control bar */}
            <div className="relative z-20 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                    <span className="text-white">Live • 42:18</span>
                  </motion.div>
                  
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-purple-300">
                    <Camera className="w-3 h-3 mr-1" />
                    4K Ultra HD
                  </Badge>
                  
                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300">
                    <Zap className="w-3 h-3 mr-1" />
                    Low Latency
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <Grid3x3 className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <Maximize2 className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Video grid */}
            <div className="relative p-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Main speaker - large */}
                <motion.div
                  layout
                  className="col-span-2 row-span-2 relative aspect-video rounded-2xl overflow-hidden group"
                >
                  {/* Video background with gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${participants[activeParticipant].gradient}`}>
                    <div className="absolute inset-0 bg-black/40" />
                  </div>

                  {/* Animated border for active speaker */}
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-2xl border-4 border-transparent bg-gradient-to-r ${participants[activeParticipant].gradient} bg-clip-border`}
                    style={{
                      WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />

                  {/* Participant avatar */}
                  <div className="relative h-full flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Avatar className="w-40 h-40 border-4 border-white/20 shadow-2xl">
                        <AvatarFallback className={`bg-gradient-to-br ${participants[activeParticipant].gradient} text-white text-5xl`}>
                          {participants[activeParticipant].initials}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </div>

                  {/* Audio visualizer */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center gap-1 px-4 pb-4">
                    {audioLevels.map((level, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: `${level}%` }}
                        transition={{ duration: 0.1 }}
                        className={`w-2 bg-gradient-to-t ${participants[activeParticipant].gradient} rounded-full`}
                        style={{ minHeight: '8px' }}
                      />
                    ))}
                  </div>

                  {/* Name tag */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                        />
                        <div>
                          <div className="text-white font-semibold">{participants[activeParticipant].name}</div>
                          <div className="text-gray-400 text-sm">{participants[activeParticipant].role}</div>
                        </div>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-2">
                        <Mic className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20"
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20"
                    >
                      <Volume2 className="w-5 h-5 text-white" />
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Other participants */}
                <AnimatePresence>
                  {showParticipants && participants.slice(1, 5).map((participant, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      {/* Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${participant.gradient} opacity-30`} />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

                      {/* Content */}
                      <div className="relative h-full flex items-center justify-center p-3">
                        {participant.status === "muted" ? (
                          <div className="text-center space-y-2">
                            <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${participant.gradient} flex items-center justify-center`}>
                              <VideoOff className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <Avatar className="w-16 h-16 border-2 border-white/20">
                            <AvatarFallback className={`bg-gradient-to-br ${participant.gradient} text-white`}>
                              {participant.initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Name overlay */}
                      <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-white text-xs truncate">{participant.name}</div>
                            <div className="text-gray-400 text-xs">{participant.role}</div>
                          </div>
                          {participant.status === "muted" ? (
                            <MicOff className="w-3 h-3 text-red-400 flex-shrink-0" />
                          ) : (
                            <Mic className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Hover effect */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-white/5 backdrop-blur-sm"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom control bar */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-20 px-6 py-6 border-t border-white/10 bg-black/20 backdrop-blur-xl"
            >
              <div className="flex items-center justify-center gap-3">
                {/* Mic button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 transition-all"
                >
                  <Mic className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Mute</span>
                  </div>
                </motion.button>

                {/* Video button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 transition-all"
                >
                  <Video className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Camera</span>
                  </div>
                </motion.button>

                {/* Share screen */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 transition-all"
                >
                  <Monitor className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Share</span>
                  </div>
                </motion.button>

                {/* End call - prominent */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/50 transition-all mx-2"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 whitespace-nowrap">End Call</span>
                  </div>
                </motion.button>

                {/* Participants */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 transition-all"
                >
                  <Users className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center border-2 border-black/50">
                    {participants.length}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 whitespace-nowrap">People</span>
                  </div>
                </motion.button>

                {/* Chat */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 transition-all"
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center border-2 border-black/50">
                    3
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Chat</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Floating decorative elements */}
          {floatingIcons.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  delay: item.delay,
                }}
                className="absolute top-0 right-0 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
                style={{
                  top: `${-80 - index * 100}px`,
                  right: `${-60 + index * 40}px`,
                }}
              >
                <Icon className={`w-8 h-8 ${item.color}`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Notification toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
            >
              <p className="text-white">{notification}</p>
            </motion.div>
          )}
        </AnimatePresence>

       
      </div>
    </div>
  );
}
