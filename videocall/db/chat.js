import prisma from "./prisma.js";

/**
 * Save a chat message to the database
 */
export const saveMessage = async ({ senderId, roomId, content }) => {
  return prisma.chatMessage.create({
    data: { senderId, roomId, content },
    include: {
      sender: { select: { id: true, name: true, imageUrl: true } },
    },
  });
};

/**
 * Get chat messages for a room (paginated)
 */
export const getRoomMessages = async (roomId, { cursor, limit = 50 } = {}) => {
  const options = {
    where: { roomId },
    orderBy: { sentAt: "asc" },
    take: limit,
    include: {
      sender: { select: { id: true, name: true, imageUrl: true } },
    },
  };

  if (cursor) {
    options.cursor = { id: cursor };
    options.skip = 1; // skip the cursor itself
  }

  return prisma.chatMessage.findMany(options);
};
