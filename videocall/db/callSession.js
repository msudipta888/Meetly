import prisma from "./prisma.js";

/**
 * Start a call session for a user
 */
export const startCallSession = async ({ userId, roomId }) => {
  return prisma.callSession.create({
    data: { userId, roomId },
  });
};

/**
 * End a call session — compute duration and save
 */
export const endCallSession = async (sessionId, { avgNetworkScore, peakParticipants } = {}) => {
  const session = await prisma.callSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  const now = new Date();
  const durationSec = Math.floor((now - session.joinedAt) / 1000);

  return prisma.callSession.update({
    where: { id: sessionId },
    data: {
      leftAt: now,
      durationSec,
      avgNetworkScore,
      peakParticipants,
    },
  });
};

/**
 * Find active (not yet ended) call session for a user in a room
 */
export const findActiveSession = async (userId, roomId) => {
  return prisma.callSession.findFirst({
    where: { userId, roomId, leftAt: null },
    orderBy: { joinedAt: "desc" },
  });
};

/**
 * Get aggregated call stats for a user (for Dashboard)
 */
export const getUserCallStats = async (userId) => {
  const now = new Date();

  // Calculate boundaries precisely
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tempDate = new Date(now);
  const diff = tempDate.getDate() - tempDate.getDay();
  const startOfWeek = new Date(tempDate.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const [totalCalls, totalDuration, todayStats, weekStats] = await Promise.all([
    // Total completed calls
    prisma.callSession.count({
      where: { userId, leftAt: { not: null } },
    }),

    // Total duration stats
    prisma.callSession.aggregate({
      where: { userId, leftAt: { not: null } },
      _sum: { durationSec: true },
      _avg: { durationSec: true },
    }),

    // Today's stats
    prisma.callSession.aggregate({
      where: {
        userId,
        leftAt: { not: null },
        joinedAt: { gte: startOfToday }
      },
      _count: { _all: true },
      _sum: { durationSec: true },
    }),

    // This week's stats
    prisma.callSession.aggregate({
      where: {
        userId,
        leftAt: { not: null },
        joinedAt: { gte: startOfWeek }
      },
      _count: { _all: true },
      _sum: { durationSec: true },
    }),
  ]);

  const totalHours = Number(((totalDuration._sum.durationSec || 0) / 3600).toFixed(1));
  const avgDurationMin = Math.round((totalDuration._avg.durationSec || 0) / 60);

  const todayCalls = todayStats._count._all || 0;
  const todayHours = Number(((todayStats._sum.durationSec || 0) / 3600).toFixed(1));

  const weekCalls = weekStats._count._all || 0;
  const weekHours = Number(((weekStats._sum.durationSec || 0) / 3600).toFixed(1));

  return {
    totalCalls,
    totalHours,
    avgDurationMin,
    todayCalls,
    todayHours,
    weekCalls,
    weekHours
  };
};

/**
 * Get daily call stats for the chart (last N days)
 */
export const getDailyCallStats = async (userId, days = 7) => {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  since.setDate(since.getDate() - (days - 1));

  const sessions = await prisma.callSession.findMany({
    where: {
      userId,
      leftAt: { not: null },
      joinedAt: { gte: since },
    },
    select: {
      joinedAt: true,
      durationSec: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  // Group by date
  const dailyMap = new Map();

  // Pre-fill all days with 0s using local date keys
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    // Use YYYY-MM-DD in local time
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dailyMap.set(dateStr, { date: dateStr, calls: 0, durationSecTotal: 0 });
  }

  for (const s of sessions) {
    if (!s.joinedAt) continue;
    // Get local date key
    const j = s.joinedAt;
    const dateKey = `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, '0')}-${String(j.getDate()).padStart(2, '0')}`;

    if (dailyMap.has(dateKey)) {
      const entry = dailyMap.get(dateKey);
      entry.calls += 1;
      entry.durationSecTotal += Number(s.durationSec || 0);
    }
  }

  return Array.from(dailyMap.values()).map(entry => ({
    date: entry.date,
    calls: entry.calls,
    durationMin: Number((entry.durationSecTotal / 60).toFixed(2)) // 2 decimal places for precision
  }));
};
