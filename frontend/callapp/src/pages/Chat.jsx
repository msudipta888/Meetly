import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSocket } from "../socket/useSocket";
import { Button } from "../components/ui/button";
import UseAuth from "../context/UseAuth";
import { useAuth } from "@clerk/clerk-react";
import { Send, X, MessageCircle } from "lucide-react";
import { fetchRoomMessages } from "../components/lib/api";

const Chat = ({ setShowChat, showChat, roomUuid }) => {
  const [chat, setChat] = useState(null);
  const [userChat, setUserChat] = useState([]);
  const [isTyping, setIsTyping] = useState(null);
  const [mes, setMes] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const socket = useSocket();
  const { getToken } = useAuth();

  const messagesRef = useRef(null);
  const { users } = UseAuth();

  // Load persisted chat history from DB when chat opens
  useEffect(() => {
    if (!showChat || historyLoaded || !roomUuid) return;

    const loadHistory = async () => {
      try {
        const messages = await fetchRoomMessages(getToken, roomUuid);
        if (messages && messages.length > 0) {
          const historyMes = messages.map((m) => ({
            chat: m.content,
            userId: m.sender?.id || m.senderId,
            ts: new Date(m.sentAt).getTime(),
            image: m.sender?.imageUrl,
            type: "history",
            senderName: m.sender?.name,
          }));
          setMes((prev) => {
            // Avoid duplicates — only add messages not already present
            const existingTimestamps = new Set(prev.map((p) => p.ts));
            const newMessages = historyMes.filter((h) => !existingTimestamps.has(h.ts));
            return [...newMessages, ...prev];
          });
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [showChat, historyLoaded, roomUuid, getToken]);

  const sendChat = () => {
    const text = (chat || "").trim();
    if (!text) return;
    const payload = { userId: socket?.id, chat: text, ts: Date.now(), image: users?.profileImage };
    setUserChat((prev) => [...prev, payload]);
    socket?.emit("user-mes", payload);
    setChat("");
    socket?.emit("stop-typing", { userId: socket?.id });
  };

  const readAllChat = ({ userId, chat, ts, image }) => {
    console.log("id:", userId + " " + "chat:", chat);
    setMes((prev) => [...prev, { chat: chat, userId: userId, ts: ts || Date.now, image: image }]);
  };

  const showuserType = ({ userId }) => {
    setIsTyping(userId);
  };

  const showStopType = () => {
    setIsTyping(null);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("read-chat", readAllChat);
    socket.on("user-typing", showuserType);
    socket.on("stopTyping", showStopType);
    return () => {
      socket.off("read-chat", readAllChat);
      socket.off("user-typing", showuserType);
      socket.off("stopTyping", showStopType);
    };
  }, [socket]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mes, userChat]);

  const handleInputchange = (e) => {
    setChat(e.target.value);
    socket?.emit("typing", { userId: socket?.id });
    setTimeout(() => {
      setIsTyping(null);
      socket?.emit("stop-typing", { userId: socket?.id });
    }, 1200);
  };

  const mergedAllmes = useMemo(() => {
    const combined = [
      ...mes.map((m) => ({ ...m, type: m.type || "remote" })),
      ...userChat.map((m) => ({ ...m, type: "local" })),
    ];
    combined.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    return combined;
  }, [mes, userChat]);


  return (
    <AnimatePresence>
      {showChat && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 h-screen lg:w-full sm:w-96 z-50"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden"
            onClick={() => setShowChat(false)}
          />

          <motion.div
            initial={{ rotateY: -15, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -15, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative h-full ml-auto w-full sm:w-96 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 
                       shadow-2xl flex flex-col overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(100, 100, 255, 0.03)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative flex items-center justify-between p-5 border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/50"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                  />
                </div>
                <h2 className="text-white tracking-wide">Live Chat</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 
                           transition-colors duration-200"
                onClick={() => setShowChat(false)}
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Messages Container */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(100, 116, 139, 0.3) transparent",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(100, 116, 139, 0.3);
                  border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(100, 116, 139, 0.5);
                }
              `}</style>

              {mergedAllmes.length === 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-slate-400 mt-12 space-y-3"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-5xl"
                  >
                    👋
                  </motion.div>
                  <p>No messages yet. Say hello!</p>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {mergedAllmes.map((m, idx) => {
                  const isOwn = m.userId === socket?.id || m.type === "local";
                  return (
                    <motion.div
                      key={`msg-${idx}-${m.ts || idx}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} items-end gap-2`}
                    >
                      {!isOwn && (
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="flex-shrink-0"
                        >
                          <img
                            src={m.image}
                            className="w-8 h-8 rounded-full border-2 border-slate-700 shadow-lg object-cover"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            alt="User avatar"
                          />
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={{ scale: 1.02, rotateY: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className={`relative rounded-2xl px-4 py-2.5 max-w-[75%] break-words shadow-lg ${isOwn
                          ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm"
                          : "bg-gradient-to-br from-slate-800 to-slate-700 text-slate-100 rounded-bl-sm"
                          }`}
                        style={{
                          transformStyle: "preserve-3d",
                          boxShadow: isOwn
                            ? "0 4px 15px rgba(37, 99, 235, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)"
                            : "0 4px 15px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                          }}
                        />

                        <div className="relative z-10">
                          <div className="text-sm leading-relaxed">{m.chat}</div>
                          <div className={`text-[10px] opacity-70 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                            {m.ts
                              ? new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </div>
                        </div>
                      </motion.div>

                      {isOwn && (
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="flex-shrink-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                                        flex items-center justify-center shadow-lg border-2 border-slate-700">
                            <span className="text-xs text-white">You</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-4 py-2 min-h-[32px]"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                    </div>
                    <span className="italic">{isTyping} is typing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative p-4 border-t border-slate-800/50 backdrop-blur-xl bg-slate-900/50"
            >
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <input
                    value={chat || ""}
                    onChange={handleInputchange}
                    className="w-full bg-slate-800/80 backdrop-blur-sm text-white px-4 py-3 pr-4 
                             rounded-2xl outline-none placeholder-slate-500 border border-slate-700/50
                             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                             transition-all duration-200 shadow-inner"
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                                blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={sendChat}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                             text-white rounded-2xl px-5 py-3 shadow-lg h-auto
                             transition-all duration-200 border-0"
                    style={{
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chat;
