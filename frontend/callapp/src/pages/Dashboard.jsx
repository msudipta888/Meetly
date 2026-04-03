import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Sidebar } from '../components/Sidebar';
import { StatsChart } from '../components/StatsChart';
import { CallHistoryCarousel } from '../components/CallHistoryCarousel';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Video, Clock, Loader, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchDashboardStats } from '../components/lib/api';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('home');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats(getToken);
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [getToken]);

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      <AnimatedBackground />
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 overflow-y-auto scroll-smooth ml-64 relative z-10">
        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Video Call Analytics
                </h1>
                <p className="text-gray-400">Track your video call performance and insights</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300"
              >
                <Video className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid ml-[90px] grid-cols-1 md:grid-cols-3 w-full gap-x-[40px] mb-8"
          >
            {loading ? (
              <div className="col-span-3 flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                <StatCard
                  icon={<Video className="w-6 h-6" />}
                  title="Daily Calls (Today)"
                  value={stats?.todayCalls || '0'}
                  color="blue"
                  subtitle={`${stats?.weekCalls || 0} this week`}
                />
                <StatCard
                  icon={<Clock className="w-6 h-6" />}
                  title="Weekly Active hours"
                  value={`${stats?.weekHours || 0}h`}
                  color="purple"
                  subtitle={`${stats?.todayHours || 0}h today`}
                />
                <StatCard
                  icon={<Sparkles className="w-6 h-6" />}
                  title="Average Duration"
                  value={`${stats?.avgDurationMin || 0} min`}
                  color="pink"
                  subtitle="Across all sessions"
                />
              </>
            )}
          </motion.div>

          <div className="w-full">
            <StatsChart />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CallHistoryCarousel />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 shadow-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 shadow-purple-500/20',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 shadow-pink-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl shadow-xl transition-all duration-300`}
      style={{
        transform: 'perspective(1000px) rotateX(0deg)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
    </motion.div>
  );
}
