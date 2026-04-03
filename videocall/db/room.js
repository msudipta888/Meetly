import prisma from "./prisma.js";

/**
 * Create a Room in the database
 */
export const createRoom = async ({ roomUuid, creatorId, title, type = "GROUP" }) => {
  return prisma.room.create({
    data: {
      roomUuid,
      creatorId,
      title,
      type,
      status: "WAITING",
    },
  });
};

/**
 * Find a Room by its UUID (the shareable ID)
 */
export const findRoomByUuid = async (roomUuid) => {
  return prisma.room.findUnique({
    where: { roomUuid },
    include: {
      creator: { select: { id: true, name: true, imageUrl: true } },
      participants: {
        where: { leftAt: null },
        include: { user: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
  });
};

/**
 * Set room status to ACTIVE and record start time
 */
export const activateRoom = async (roomUuid) => {
  return prisma.room.update({
    where: { roomUuid },
    data: { status: "ACTIVE", startedAt: new Date() },
  });
};

/**
 * End a room — set status to ENDED and record end time
 */
export const endRoom = async (roomUuid) => {
  return prisma.room.update({
    where: { roomUuid },
    data: { status: "ENDED", endedAt: new Date() },
  });
};

/**
 * Get recent rooms for a user (call history)
 */
export const getUserRoomHistory = async (userId, limit = 20) => {
  return prisma.room.findMany({
    where: {
      participants: { some: { userId } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      creator: { select: { id: true, name: true, imageUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, imageUrl: true } } },
      },
      callSessions: {
        include: { user: { select: { name: true } } },
      },
      _count: { select: { messages: true, participants: true } },
    },
  });
};

/**
 * Update the total participant count for a room
 */
export const updateRoomParticipantCount = async (roomId, count) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { totalParticipents: count },
  });
};
