import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight, Users, Clock, Calendar, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchCallHistory } from './lib/api';

/**
 * Format seconds into human readable duration
 */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function CallHistoryCarousel() {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getToken } = useAuth();
  const cardsPerPage = 3;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchCallHistory(getToken);
        // Transform DB data to display format
        const formatted = data.map((room) => {
          // Find the session belonging to the current user
          const mySession = room.callSessions?.find(s => s.userId === room.currentUserId);
          const myDurationSec = mySession?.durationSec || 0;

          // Only keep the current user's duration for the detailed list
          const individualDurations = mySession ? [{
            name: mySession.user?.name || "Me",
            duration: formatDuration(myDurationSec),
          }] : [];

          return {
            id: room.id,
            title: room.title || `Meeting`,
            creatorName: room.creator?.name || 'Unknown',
            duration: formatDuration(myDurationSec), 
            individualDurations,
            date: new Date(room.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            participants: room._count?.participants || 0,
            participantIds: room.participants?.find(p => p)?.user?.id || 'Unknown',
            roomId: room.roomUuid || room.id,
            status: room.status,
          };
        });
        setCallHistory(formatted);
      } catch (err) {
        console.error('Failed to load call history:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [getToken]);

  const totalPages = Math.max(1, Math.ceil(callHistory.length / cardsPerPage));

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleCards = callHistory.slice(
    currentIndex * cardsPerPage,
    (currentIndex + 1) * cardsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (callHistory.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl mb-1">Call History</h2>
          <p className="text-sm text-gray-400">Recent video call sessions</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Calendar className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-lg mb-1">No calls yet</p>
          <p className="text-sm">Your call history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Call History</h2>
          <p className="text-sm text-gray-400">Recent video call sessions</p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/20"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleCards.map((call, index) => (
              <CallHistoryCard key={call.id} call={call} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }).map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                : 'w-2 bg-gray-700'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

function CallHistoryCard({ call, index }) {
  const statusColors = {
    ACTIVE: 'text-green-400 bg-green-500/20 border-green-500/30',
    ENDED: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
    WAITING: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 group"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg mb-1 group-hover:text-blue-400 transition-colors">
            {call.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{call.date}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs border ${statusColors[call.status] || statusColors.ENDED}`}>
          {call.status}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Call Durations</p>
            </div>
          </div>
          <div className="space-y-1 pl-9">
            {call.individualDurations && call.individualDurations.length > 0 ? (
              call.individualDurations.map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 truncate max-w-[120px]" title={stat.name}>{stat.name}</span>
                  <span className="text-blue-400 font-medium">{stat.duration}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No session data</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-gray-400">My User ID</p>
            <p className="text-xs text-gray-300 truncate" title={call.participantIds}>
              {call.participantIds}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-xs text-gray-400 mb-1">Room ID</p>
          <p className="font-mono text-xs text-blue-400 truncate" title={call.roomId}>
            {call.roomId}
          </p>
        </div>
      </div>

      <motion.div
        className="mt-4 pt-4 border-t border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20 transition-all text-sm"
        >
          View Details
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
