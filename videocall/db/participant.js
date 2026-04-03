import prisma from "./prisma.js";

/**
 * Add a participant to a room
 */
export const addParticipant = async ({ userId, roomId, role = "PARTICIPANT" }) => {
  // Check if user is already an active participant
  const existing = await prisma.roomParticipant.findFirst({
    where: { userId, roomId, leftAt: null },
  });

  if (existing) return existing;

  return prisma.roomParticipant.create({
    data: { userId, roomId, role },
  });
};

/**
 * Mark a participant as having left the room
 */
export const removeParticipant = async (userId, roomId) => {
  // Find the latest active participation (no leftAt)
  const participation = await prisma.roomParticipant.findFirst({
    where: { userId, roomId, leftAt: null },
    orderBy: { joinedAt: "desc" },
  });

  if (!participation) return null;

  return prisma.roomParticipant.update({
    where: { id: participation.id },
    data: { leftAt: new Date() },
  });
};

/**
 * Get active participants in a room
 */
export const getActiveParticipants = async (roomId) => {
  return prisma.roomParticipant.findMany({
    where: { roomId, leftAt: null },
    include: {
      user: { select: { id: true, clerkId: true, name: true, imageUrl: true, email: true } },
    },
  });
};

/**
 * Count active participants in a room
 */
export const countActiveParticipants = async (roomId) => {
  return prisma.roomParticipant.count({
    where: { roomId, leftAt: null },
  });
};
