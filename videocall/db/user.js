import prisma from "./prisma.js";

/**
 * Find a User by their Clerk ID
 */
export const findUserByClerkId = async (clerkId) => {
  return prisma.user.findUnique({ where: { clerkId } });
};

/**
 * Upsert a User (create or update on Clerk sync)
 */
export const upsertUser = async ({ clerkId, email, name, imageUrl }) => {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email, name, imageUrl },
    create: { clerkId, email, name, imageUrl },
  });
};

/**
 * Get user with their recent call history
 */
export const getUserWithHistory = async (clerkId, limit = 10) => {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      callSessions: {
        orderBy: { joinedAt: "desc" },
        take: limit,
        include: { room: true },
      },
    },
  });
};
