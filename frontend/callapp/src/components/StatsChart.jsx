import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Loader } from 'lucide-react';
import { fetchDashboardChart } from './lib/api';

export function StatsChart() {
  const [view, setView] = useState('day');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const loadChart = async () => {
      setLoading(true);
      try {
        const days = view === 'day' ? 7 : 30;
        const data = await fetchDashboardChart(getToken, days);
        // Format dates for display
        const formatted = data.map((d) => ({
          ...d,
          label: new Date(d.date).toLocaleDateString('en-US', {
            weekday: view === 'day' ? 'long' : 'short',
          }),
          fullDate: new Date(d.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }));
        setChartData(formatted);
      } catch (err) {
        console.error('Failed to load chart:', err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    loadChart();
  }, [view, getToken]);

  const hasData = chartData.length > 0;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 backdrop-blur-xl shadow-2xl"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl mb-1">Call Analytics</h2>
          <p className="text-sm text-gray-400">
            {view === 'day' ? 'Last 7 Days (Daily)' : 'Last 30 Days (Weekly Trend)'}
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${view === 'day'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Day
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${view === 'week'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Week
          </motion.button>
        </div>
      </div>

      <div className="h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg mb-1">No call data yet</p>
            <p className="text-sm">Start making calls to see analytics here</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                interval={view === 'day' ? 0 : 4} // Show every day for 7-day view
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                label={{ value: 'Minutes / Count', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: '10px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                }}
                labelStyle={{ color: '#fff', marginBottom: '4px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '12px', padding: '2px 0' }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorCalls)"
                name="Total Calls"
              />
              <Area
                type="monotone"
                dataKey="durationMin"
                stroke="#a855f7"
                strokeWidth={3}
                fill="url(#colorDuration)"
                name="Call Time (min)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-400">Calls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm text-gray-400">Duration (min)</span>
        </div>
      </div>
    </motion.div>
  );
}
