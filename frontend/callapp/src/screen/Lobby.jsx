import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Video,
  Mail,
  Hash,
  ArrowRight,
  Sparkles,
  Users,
  Lock,
  Copy,
  ArrowLeft,
  Check,
  LogOut
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useSocket } from "../socket/useSocket";
import UseAuth from "../context/UseAuth";
import { Loader } from 'lucide-react'
import { SignOutButton, useClerk, UserButton, useUser, useAuth } from "@clerk/clerk-react";

export function Lobby() {
  const [data, setData] = useState({
    email: "",
    roomId: "",
  });
  const [view, setView] = useState("home"); // 'home' | 'create' | 'join'
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const { setUsers } = UseAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const { id } = useParams();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (id) {
      try {
        localStorage.setItem("userId", id);
      } catch (e) {
        console.warn("localStorage write failed", e);
      }
    }
  }, [id]);

  const [authLoading, setAuthLoading] = useState(true)

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault();
      const rawRoomId = view === 'create' ? createdRoomId : data.roomId;
      const finalRoomId = rawRoomId?.trim();

      const finalEmail = user?.emailAddresses[0]?.emailAddress || data.email;

      console.log("Submit attempt:", { view, finalRoomId, finalEmail });

      if (finalRoomId) {
        if (!socket) {
          alert("Connection error: Please wait for socket to connect.");
          return;
        }
        socket.emit("createRoom", { email: finalEmail, roomId: finalRoomId });
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = ({ status, roomId }) => {
      if (status === "success") {
        navigate(`/room/group/${roomId}`);
      }
    };

    socket.on("roomCreated", onRoomCreated);

    return () => {
      socket.off("roomCreated", onRoomCreated);
    };
  }, [socket, navigate, id]);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    };

    (async () => {
      try {
        const token = await getToken();

        const name = user.fullName || user.firstName || "User";
        const email = user.emailAddresses[0]?.emailAddress;
        const imageUrl = user.imageUrl;

        // Auto-fill form data with user info
        setData(prev => ({ ...prev, email: email || "" }));

        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/auth/sync`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            imageUrl
          })
        });
        if (res.ok) {
          setUsers({
            name: user.fullName,
            profileImage: user.imageUrl
          });
        } else {
          setUsers(null);
        }
      } catch (e) {
        console.error("Sync error:", e)
        setUsers(null);
      } finally {
        setAuthLoading(false)
      }
    })();
  }, [isLoaded, user, getToken, setUsers]);

  const generateRoomId = () => {
    const newId = crypto.randomUUID();
    setCreatedRoomId(newId);
    setView("create");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center rotate-180"><Loader size={30} /></div>
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-20">
      <div className="flex justify-around ">
        <div className="absolute top-4 left-4 z-50">
          <SignOutButton redirectUrl="/signin">
            <Button className="mt-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 backdrop-blur-sm transition-all">
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
        <div className="flex flex-col items-start absolute top-4 right-4 z-50">
          <UserButton />
        </div>
      </div>

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-20 size-96 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 right-20 size-96 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl"
      />

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 text-center lg:text-left"
        >

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="size-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">
                Join Video Meeting
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="block bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                Ready to
              </span>
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Connect?
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 leading-relaxed"
            >
              Enter your details to join or create a video meeting room.
              Experience crystal-clear communication instantly.
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {[
              { icon: Video, text: "HD Video & Audio Quality" },
              { icon: Users, text: "Unlimited Participants" },
              { icon: Lock, text: "End-to-End Encrypted" },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                    <Icon className="size-5 text-indigo-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 p-8 md:p-10 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center">
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

            {/* Back Button for non-home views */}
            {view !== "home" && (
              <button
                onClick={() => setView("home")}
                className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="size-6" />
              </button>
            )}

            {/* VIEW: HOME */}
            {view === "home" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-white">Welcome, {user?.firstName}</h2>
                  <p className="text-gray-400">Choose how you want to connect</p>
                </div>

                <div className="grid gap-4">
                  <Button
                    onClick={generateRoomId}
                    className="h-20 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl border-0 shadow-lg"
                  >
                    <Video className="size-6 mr-3" />
                    Create New Meeting
                  </Button>

                  <Button
                    onClick={() => setView("join")}
                    variant="outline"
                    className="h-20 text-lg bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl"
                  >
                    <Users className="size-6 mr-3" />
                    Join Existing Meeting
                  </Button>
                </div>
              </motion.div>
            )}

            {/* VIEW: CREATE */}
            {view === "create" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check className="size-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Meeting Ready</h2>
                  <p className="text-gray-400">Share this Room ID with others</p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/10 relative group">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Room ID</Label>
                  <div className="flex items-center justify-between">
                    <code className="text-xl text-indigo-300 font-mono">{createdRoomId}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="size-5 text-green-500" /> : <Copy className="size-5" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-14 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-medium shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Meeting Now
                  <ArrowRight className="size-5 ml-2" />
                </Button>
              </motion.div>
            )}


            {view === "join" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-2xl font-bold text-white">Join Meeting</h2>
                  <p className="text-gray-400">Enter the Room ID to connect</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="roomId" className="text-gray-300">Room ID</Label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 size-5" />
                      <Input
                        id="roomId"
                        autoFocus
                        placeholder="e.g. 8f92-23..."
                        value={data.roomId}
                        onChange={(e) => setData({ ...data, roomId: e.target.value })}
                        className="pl-12 h-14 bg-black/20 border-white/10 text-white text-lg rounded-xl focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!data.roomId}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Join Meeting
                    <ArrowRight className="size-5 ml-2" />
                  </Button>
                </form>
              </motion.div>
            )}

          </div>

          {/* Floating decorative elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-8 -right-8 size-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center pointer-events-none"
          >
            <Users className="size-10 text-indigo-400" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute -bottom-8 -left-8 size-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center pointer-events-none"
          >
            <Lock className="size-10 text-purple-400" />
          </motion.div>
        </motion.div>
      </div>
    </div >
  );
}
