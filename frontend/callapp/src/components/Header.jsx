import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Video } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5"
        : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 flex h-20 items-center justify-between">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
        >
          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <Video className="size-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            VideoConnect
          </span>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8">
          {["Features", "About", "Contact"].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative text-gray-400 hover:text-white transition-colors group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 cursor-pointer hidden sm:flex"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
          </SignedOut>

          <SignedIn>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white cursor-pointer"
              onClick={() => navigate(`/dashboard`)}
            >
              Dashboard
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 cursor-pointer hidden sm:flex"
            onClick={() => {
              if (user) {
                navigate(`/lobby`);
              } else {
                navigate("/signin");
              }
            }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
