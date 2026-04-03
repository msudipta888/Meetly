import prisma from "./prisma.js";

/**
 * Send a contact request
 */
export const sendContactRequest = async (senderId, receiverId) => {
  return prisma.contact.create({
    data: { senderId, receiverId, status: "PENDING" },
  });
};

/**
 * Accept a contact request
 */
export const acceptContactRequest = async (contactId) => {
  return prisma.contact.update({
    where: { id: contactId },
    data: { status: "ACCEPTED" },
  });
};

/**
 * Block a contact
 */
export const blockContact = async (contactId) => {
  return prisma.contact.update({
    where: { id: contactId },
    data: { status: "BLOCKED" },
  });
};

/**
 * Get all accepted contacts for a user
 */
export const getUserContacts = async (userId) => {
  const contacts = await prisma.contact.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, clerkId: true, name: true, imageUrl: true, email: true } },
      receiver: { select: { id: true, clerkId: true, name: true, imageUrl: true, email: true } },
    },
  });

  // Return the "other" user in each contact pair
  return contacts.map((c) => ({
    contactId: c.id,
    user: String(c.senderId) === String(userId) ? c.receiver : c.sender,
    since: c.createdAt,
  }));
};

/**
 * Get pending contact requests received by a user
 */
export const getPendingRequests = async (userId) => {
  return prisma.contact.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: {
      sender: { select: { id: true, name: true, imageUrl: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Check if two users are already contacts
 */
export const areContacts = async (userId1, userId2) => {
  const contact = await prisma.contact.findFirst({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
  });
  return contact;
};
