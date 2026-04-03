import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus, Users, Check, Mail, Loader,
  UserCheck, Ban, Clock
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { AnimatedBackground } from '../components/AnimatedBackground';
import {
  fetchContacts,
  fetchPendingRequests,
  sendContactRequest,
  acceptContact,
  blockContact,
} from '../components/lib/api';

export default function Contacts() {
  const [activeView, setActiveView] = useState('contacts');
  const [tab, setTab] = useState('contacts'); // 'contacts' | 'pending' | 'add'
  const [contacts, setContacts] = useState([]);
  const [pending, setPending] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const { getToken } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsData, pendingData] = await Promise.all([
        fetchContacts(getToken),
        fetchPendingRequests(getToken),
      ]);
      setContacts(contactsData);
      setPending(pendingData);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'contacts' || tab === 'pending') {
      loadData();
    }
  }, [getToken, tab]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setActionLoading('send');
    setMessage(null);
    try {
      await sendContactRequest(getToken, email.trim());
      setMessage({ type: 'success', text: `Request sent to ${email}` });
      setEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (contactId) => {
    setActionLoading(contactId);
    try {
      await acceptContact(getToken, contactId);
      await loadData();
    } catch (err) {
      console.error('Failed to accept:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (contactId) => {
    setActionLoading(contactId);
    try {
      await blockContact(getToken, contactId);
      await loadData();
    } catch (err) {
      console.error('Failed to block:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      <AnimatedBackground />
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 overflow-y-auto ml-64 relative z-10">
        <div className="p-8 max-w-[1000px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Contacts
            </h1>
            <p className="text-gray-400">Manage your friends and contacts</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50 mb-8 w-fit">
            {[
              { id: 'contacts', label: 'My Contacts', icon: Users },
              { id: 'pending', label: `Pending (${pending.length})`, icon: Clock },
              { id: 'add', label: 'Add Contact', icon: UserPlus },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${tab === t.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 text-white'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </motion.button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <>
              {/* My Contacts */}
              {tab === 'contacts' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {contacts.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg">No contacts yet</p>
                      <p className="text-sm">Add contacts by their email address</p>
                    </div>
                  ) : (
                    contacts.map((c) => (
                      <motion.div
                        key={c.contactId}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-xl"
                      >
                        <div className="flex items-center gap-4">
                          {c.user.imageUrl ? (
                            <img
                              src={c.user.imageUrl}
                              alt={c.user.name}
                              className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                              {(c.user.name || c.user.email)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{c.user.name || 'User'}</p>
                            <p className="text-sm text-gray-400">{c.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Since {new Date(c.since).toLocaleDateString()}
                          </span>
                          <UserCheck className="w-5 h-5 text-green-400" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Pending Requests */}
              {tab === 'pending' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {pending.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg">No pending requests</p>
                    </div>
                  ) : (
                    pending.map((req) => (
                      <motion.div
                        key={req.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-yellow-500/20 backdrop-blur-xl"
                      >
                        <div className="flex items-center gap-4">
                          {req.sender.imageUrl ? (
                            <img
                              src={req.sender.imageUrl}
                              alt={req.sender.name}
                              className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-lg">
                              {(req.sender.name || req.sender.email)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{req.sender.name || 'User'}</p>
                            <p className="text-sm text-gray-400">{req.sender.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAccept(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50"
                          >
                            {actionLoading === req.id ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <Check className="w-5 h-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleBlock(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                          >
                            <Ban className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Add Contact */}
              {tab === 'add' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md"
                >
                  <form onSubmit={handleSendRequest} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!email.trim() || actionLoading === 'send'}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {actionLoading === 'send' ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Send Request
                        </>
                      )}
                    </motion.button>
                  </form>

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-4 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
