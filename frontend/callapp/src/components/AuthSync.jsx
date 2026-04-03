import { SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const AuthSync = () => {
    const { userId, isSignedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSignedIn && userId) {
            navigate(`/lobby`);
        }
    }, [isSignedIn, userId, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
            <SignedOut>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Please sign in to continue</p>

                    <SignInButton mode="modal">
                        <button className="cursor-pointer rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95">
                            Sign In
                        </button>
                    </SignInButton>
                </motion.div>
            </SignedOut>

        </div>
    )
}
export default AuthSync;