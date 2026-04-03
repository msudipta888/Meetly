import { Home, Users, Video, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';



export function Sidebar({ activeView, setActiveView }) {
  const userId = localStorage.getItem("userId")
  const menuItems = [
    { id: '/', label: 'Home', icon: Home },
    { id: `/lobby`, label: 'Lobby', icon: Users },
    { id: `/contacts`, label: 'Contacts', icon: UserPlus },
  ];
  const navigate = useNavigate()
  const handleChange = (id) => {
    setActiveView(id);
    navigate(`${id}`)
  }
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] border-r border-gray-800/50 backdrop-blur-xl z-50"
      style={{
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="p-6">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VideoCall
            </h2>
            <p className="text-xs text-gray-500">Analytics</p>
          </div>
        </motion.div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleChange(item.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/20'
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span className={isActive ? 'text-white' : 'text-gray-400'}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Decoration */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-xs text-gray-400 mb-2">Need help?</p>
            <p className="text-sm text-purple-300">Visit our docs</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
