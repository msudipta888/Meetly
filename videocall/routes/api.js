import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { upsertUser, findUserByClerkId } from "../db/user.js";
import { getUserRoomHistory, findRoomByUuid } from "../db/room.js";
import { getUserCallStats, getDailyCallStats } from "../db/callSession.js";
import { getRoomMessages } from "../db/chat.js";
import {
  getUserContacts,
  getPendingRequests,
  sendContactRequest,
  acceptContactRequest,
  blockContact,
  areContacts,
} from "../db/contact.js";

const router = Router();

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────

/**
 * POST /api/auth/sync
 * Sync Clerk user to our database
 */
router.post("/auth/sync", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth().userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - no userId" });
    }

    const { name, email, imageUrl } = req.body;
    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }

    const user = await upsertUser({ clerkId: userId, email, name, imageUrl });
    res.status(200).json({ message: "User synced successfully", user });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// ──────────────────────────────────────────────
// DASHBOARD / ANALYTICS
// ──────────────────────────────────────────────

/**
 * GET /api/dashboard/stats
 * Get call statistics for the logged-in user
 */
router.get("/dashboard/stats", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth().userId;
    const user = await findUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const stats = await getUserCallStats(user.id);
    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * GET /api/dashboard/chart?days=30
 * Get daily call chart data
 */
router.get("/dashboard/chart", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth().userId;
    const user = await findUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const days = parseInt(req.query.days) || 30;
    const chartData = await getDailyCallStats(user.id, days);
    res.json(chartData);
  } catch (error) {
    console.error("Chart error:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

/**
 * GET /api/dashboard/history?limit=20
 * Get call history for the logged-in user
 */
router.get("/dashboard/history", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth().userId;
    const user = await findUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const limit = parseInt(req.query.limit) || 20;
    const history = await getUserRoomHistory(user.id, limit);
    const historyWithUser = history.map(room => ({
      ...room,
      currentUserId: user.id
    }));
    res.json(historyWithUser);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ──────────────────────────────────────────────
// CHAT HISTORY
// ──────────────────────────────────────────────

/**
 * GET /api/rooms/:roomUuid/messages?cursor=xxx&limit=50
 * Get chat messages for a room (after call ends, or for review)
 */
router.get("/rooms/:roomUuid/messages", requireAuth(), async (req, res) => {
  try {
    const { roomUuid } = req.params;
    const cursor = req.query.cursor || undefined;
    const limit = parseInt(req.query.limit) || 50;

    const room = await findRoomByUuid(roomUuid);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const messages = await getRoomMessages(room.id, { cursor, limit });
    res.json(messages);
  } catch (error) {
    console.error("Messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ──────────────────────────────────────────────
// CONTACTS
// ──────────────────────────────────────────────

/**
 * GET /api/contacts
 * Get accepted contacts for the logged-in user
 */
router.get("/contacts", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth().userId;
    const user = await findUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const contacts = await getUserContacts(user.id);
    res.json(contacts);
  } catch (error) {
    console.error("Contacts error:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

/**
 * GET /api/contacts/pending
 * Get pending contact requests
 */
router.get("/contacts/pending", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth().userId;
    const user = await findUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const pending = await getPendingRequests(user.id);
    res.json(pending);
  } catch (error) {
    console.error("Pending contacts error:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

/**
 * POST /api/contacts/request
 * Send a contact request. Body: { receiverEmail }
 */
router.post("/contacts/request", requireAuth(), async (req, res) => {
  try {
    const clerkId = req.auth().userId;
    const sender = await findUserByClerkId(clerkId);
    if (!sender) return res.status(404).json({ error: "User not found" });

    const { receiverEmail } = req.body;
    if (!receiverEmail) {
      return res.status(400).json({ error: "receiverEmail is required" });
    }

    // Find receiver by email
    const prisma = (await import("../db/prisma.js")).default;
    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
    if (!receiver) {
      return res.status(404).json({ error: "User with that email not found" });
    }

    if (sender.id === receiver.id) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    // Check if already contacts
    const existing = await areContacts(sender.id, receiver.id);
    if (existing) {
      return res.status(409).json({ error: "Contact relationship already exists", status: existing.status });
    }

    const contact = await sendContactRequest(sender.id, receiver.id);
    res.status(201).json(contact);
  } catch (error) {
    console.error("Contact request error:", error);
    res.status(500).json({ error: "Failed to send contact request" });
  }
});

/**
 * PATCH /api/contacts/:contactId/accept
 */
router.patch("/contacts/:contactId/accept", requireAuth(), async (req, res) => {
  try {
    const contact = await acceptContactRequest(req.params.contactId);
    res.json(contact);
  } catch (error) {
    console.error("Accept contact error:", error);
    res.status(500).json({ error: "Failed to accept request" });
  }
});

/**
 * PATCH /api/contacts/:contactId/block
 */
router.patch("/contacts/:contactId/block", requireAuth(), async (req, res) => {
  try {
    const contact = await blockContact(req.params.contactId);
    res.json(contact);
  } catch (error) {
    console.error("Block contact error:", error);
    res.status(500).json({ error: "Failed to block contact" });
  }
});

export default router;
