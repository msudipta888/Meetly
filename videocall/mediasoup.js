import { mediaCodecs } from "./mediaCodecs.js";
import mediasoup from "mediasoup";
import os from "os";
import { findUserByClerkId } from "./db/user.js";
import { createRoom, findRoomByUuid, activateRoom, endRoom, updateRoomParticipantCount } from "./db/room.js";
import { addParticipant, removeParticipant, countActiveParticipants } from "./db/participant.js";
import { saveMessage } from "./db/chat.js";
import { startCallSession, endCallSession, findActiveSession } from "./db/callSession.js";

const workers = [];
let nextWorkerIdx = 0;
const routers = new Map(); // roomId => router
const transports = new Map(); // transportId => {transport, peerId, roomId, direction}
const producers = new Map(); // producerId => producer
const consumers = new Map(); // consumerId => consumer

// Maps socket.id => DB context for cleanup on disconnect
const socketDbContext = new Map(); // socketId => { dbUserId, dbRoomId, participantId, callSessionId, networkScores }

export const MediaSoup = (io) => {
  // 1. Create worker pool
  const createWorkers = async () => {
    const numWorkers = os.cpus().length;
    console.log(`Creating ${numWorkers} Mediasoup workers...`);

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        rtcMinPort: 10000 + i * 101,
        rtcMaxPort: 10100 + i * 101,
        logLevel: "warn",
      });

      worker.on("died", () => {
        console.error(`Mediasoup Worker ${i} died, restart process`);
        process.exit(1);
      });

      workers.push(worker);
    }
  };
  createWorkers();

  const getNextWorker = () => {
    const worker = workers[nextWorkerIdx];
    nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
    return worker;
  };

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.userId}`);
    socket.on("createRoom", async (data) => {
      const { roomId } = data;

      if (!routers.has(roomId)) {
        const worker = getNextWorker();
        console.log(`Worker ${worker.pid} selected for room ${roomId}`);
        const router = await worker.createRouter({ mediaCodecs });
        routers.set(roomId, router);
      }
      // join user in room
      socket.join(roomId);
      socket.roomId = roomId;

      // ── DB: Persist room & participant ──
      try {
        const clerkId = socket.userId; // set by auth middleware
        if (clerkId) {
          const dbUser = await findUserByClerkId(clerkId);
          if (dbUser) {
            // Create or find room
            let dbRoom = await findRoomByUuid(roomId);
            if (!dbRoom) {
              dbRoom = await createRoom({
                roomUuid: roomId,
                creatorId: dbUser.id,
                type: "GROUP",
              });
              console.log(`DB: Room created ${dbRoom.id}`);
            }

            // Activate room if first join
            if (dbRoom.status === "WAITING") {
              await activateRoom(roomId);
            }

            // Add participant (now idempotent)
            const participant = await addParticipant({
              userId: dbUser.id,
              roomId: dbRoom.id,
              role: dbRoom.creatorId === dbUser.id ? "HOST" : "PARTICIPANT",
            });

            // Update the room's global participant count (after adding)
            const currentCount = await countActiveParticipants(dbRoom.id);
            await updateRoomParticipantCount(dbRoom.id, currentCount);

            // Start call session only if no active session exists
            let callSession = await findActiveSession(dbUser.id, dbRoom.id);
            if (!callSession) {
              callSession = await startCallSession({
                userId: dbUser.id,
                roomId: dbRoom.id,
              });
            }

            // Store context for disconnect cleanup
            socketDbContext.set(socket.id, {
              dbUserId: dbUser.id,
              dbRoomId: dbRoom.id,
              participantId: participant.id,
              callSessionId: callSession.id,
              networkScores: [],
            });

            console.log(`DB: User ${dbUser.name || dbUser.email} joined room ${roomId}`);
          }
        }
      } catch (dbErr) {
        console.error("DB error on createRoom:", dbErr.message);
        // Don't fail the socket flow — DB persistence is best-effort
      }

      socket.emit("roomCreated", { status: "success", roomId });
    });

    // 3. Request for routerRTPCapabilities
    socket.on("getRouterRTPCapebilities", () => {
      const router = routers.get(socket.roomId);
      socket.emit("routerRtpCapabilities", router?.rtpCapabilities);
    });

    // 4. Create transport
    socket.on("createWebRtcTransport", async ({ direction }, callback) => {
      const roomId = socket.roomId;
      const router = routers.get(roomId);
      if (!router) {
        return callback({ error: "Room not found" });
      }
      try {
        const transport = await router.createWebRtcTransport({
          listenIps: [
            {
              ip: "0.0.0.0",
              announcedIp: process.env.ANNOUNCED_IP,
            },
          ],
          maxIncomeBitrate: 1500000,
          initialAvailableOutgoingBitrate: 1000000,
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        });
        transports.set(transport.id, {
          transport,
          peerId: socket.id,
          roomId,
          direction,
        });
        transport.on("dtlsstatechange", (dtlsState) => {
          if (dtlsState === "closed") {
            transports.delete(transport.id);
          }
        });
        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (error) {
        console.error("Transport creation error:", error);
        if (typeof callback === "function") {
          callback({ error: error.message || "Transport not created" });
        }
      }
    });

    // 5. Connect transport
    socket.on(
      "connectTransport",
      async ({ transportId, dtlsParameters }, callback) => {
        console.log("connectTransport request received");
        const transportData = transports.get(transportId);
        if (!transportData || !dtlsParameters) {
          return callback({ error: " Invalid transport or DTLS parameters" });
        }
        try {
          await transportData.transport.connect({ dtlsParameters });
          if (typeof callback === "function")
            callback({ id: transportData.id });
        } catch (error) {
          console.error("Transport connection error:", error);
          if (typeof callback === "function") {
            callback({ error: error.message || "Transport not connected" });
          }
        }
      }
    );

    // 6. Produce
    socket.on(
      "produce",
      async ({ transportId, kind, rtpParameters, appData }, callback) => {
        const transportData = transports.get(transportId);
        if (!transportData) {
          socket.emit("error", { error: "transport not found" });
          return;
        }
        console.log("appdata:", appData);
        if (transportData.direction !== "send") {
          return callback({ error: "transport not configured for send" });
        }
        const producer = await transportData.transport.produce({
          kind,
          rtpParameters,
          appData,
        });
        let lastScore = 0;
        producer.on("score", (score) => {
          lastScore = score;
          // Track scores for DB analytics
          const ctx = socketDbContext.get(socket.id);
          if (ctx && Array.isArray(score)) {
            const numericScore = Math.max(...score.map((s) => s.score ?? 0));
            ctx.networkScores.push(numericScore);
          }
        });

        const scoreInterval = setInterval(() => {
          socket.emit("producerScore", {
            producerId: producer.id,
            score: lastScore,
          });
        }, 30000);

        producers.set(producer.id, {
          producer,
          peerId: socket.id,
          appData: appData,
          roomId: transportData.roomId,
          kind,
          scoreInterval,
        });
        if (typeof callback === "function")
          callback({ peerId: socket.id, id: producer.id, producer });
        producer.on("transportclose", () => {
          const producerData = producers.get(producer.id);
          if (producerData?.scoreInterval) {
            clearInterval(producerData.scoreInterval);
          }
          producer.close();
          producers.delete(producer.id);
        });
        socket.to(transportData.roomId).emit("newProducer", {
          producerId: producer.id,
          peerId: socket.id,
          source: appData?.source || "camera",
        });
      }
    );

    // 7. Consume
    socket.on(
      "consume",
      async ({ producerId, rtpCapabilities, transportId }, callback) => {
        try {
          if (typeof callback !== "function") {
            console.error("consume called without callback");
            return;
          }

          const transportData = transports.get(transportId);
          const router = routers.get(transportData.roomId);
          const producer = producers.get(producerId);
          if (!producer) {
            return callback({ error: "Producer not found" });
          }
          if (transportData.direction !== "recv") {
            console.warn(
              "consume called on non-recv transport",
              transportId,
              "direction=",
              transportData.direction
            );
            return callback({ error: "transport not configured for recv" });
          }
          if (
            !router.canConsume({
              producerId: producer.producer.id,
              rtpCapabilities: rtpCapabilities,
            })
          ) {
            return callback({ error: "cannot consume" });
          }
          const consumer = await transportData.transport.consume({
            producerId: producer.producer.id,
            rtpCapabilities: rtpCapabilities,
            paused: true,
          });
          consumers.set(consumer.id, {
            consumer,
            producerId,
            peerId: socket.id,
            roomId: transportData.roomId,
          });

          callback({
            id: consumer.id,
            producerId: producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          });
        } catch (error) {
          console.error("Error in consuming:", error);
          if (typeof callback === "function") {
            callback({ error: error.message || "Consume failed" });
          }
        }
      }
    );

    socket.on("resumeConsumer", async ({ consumerId }, callback) => {
      try {
        const consumerData = consumers.get(consumerId);
        if (!consumerData) {
          return callback({ error: "Consumer not found" });
        }

        await consumerData.consumer.resume();
        callback({ success: true });
      } catch (error) {
        console.error("Error resuming consumer:", error);
        if (typeof callback === "function") callback({ error: error.message });
      }
    });

    // ── Chat (now persisted to DB) ──
    socket.on("user-mes", async ({ userId, chat, ts, image }) => {
      if (!userId || !chat || !ts) throw new Error("userId or chat or time is missing");

      // Broadcast to room (existing behavior)
      socket.to(socket.roomId).emit("read-chat", { userId, chat, ts, image });

      // Persist to DB
      try {
        const ctx = socketDbContext.get(socket.id);
        if (ctx?.dbUserId && ctx?.dbRoomId) {
          await saveMessage({
            senderId: ctx.dbUserId,
            roomId: ctx.dbRoomId,
            content: chat,
          });
        }
      } catch (dbErr) {
        console.error("DB error saving chat:", dbErr.message);
      }
    });

    socket.on("typing", ({ userId }) => {
      socket.to(socket.roomId).emit("user-typing", { userId });
    });

    socket.on("stop-typing", ({ userId }) => {
      socket.to(socket.roomId).emit("stopTyping", { userId });
    });

    socket.on("getProducers", (callback) => {
      try {
        const roomId = socket.roomId;
        if (!roomId) return callback({ error: "Not in a room" });
        let producerArray = [];
        const producerSet = new Set();
        for (const [producerId, produceData] of producers.entries()) {
          if (
            produceData.roomId === roomId &&
            produceData.peerId !== socket.id
          ) {
            const uniqueKey = `${produceData.peerId}-${produceData.kind}`;
            if (!producerSet.has(uniqueKey)) {
              producerSet.add(uniqueKey);
              producerArray.push({
                id: producerId,
                peerId: produceData.peerId,
                kind: produceData.kind,
                source: produceData.appData?.source || "camera",
              });
            }
          }
        }
        if (typeof callback === "function") {
          return callback(producerArray);
        }
      } catch (error) {
        console.error(error);
        if (typeof callback === "function") {
          return callback(error);
        }
      }
    });

    socket.on("cameraOpen", ({ userId }) => {
      if (!userId) throw new Error("No userId");
      try {
        const roomId = socket.roomId;
        socket.to(roomId).emit("notifyOpenCamera", { userId });
      } catch (error) {
        console.error("Problem with camera:", error);
      }
    });

    socket.on("cameraOff", ({ userId }) => {
      socket.to(socket.roomId).emit("OffCamera", { userId });
    });

    socket.on("disconnect", async () => {
      const roomId = socket.roomId;
      const room = io.sockets.adapter.rooms.get(roomId);
      const shouldCleanupRoom = !room || room.size <= 1;

      // ── DB: End participant & call session ──
      try {
        const ctx = socketDbContext.get(socket.id);
        if (ctx) {
          // Calculate avg network score
          let avgScore = null;
          if (ctx.networkScores.length > 0) {
            avgScore =
              ctx.networkScores.reduce((a, b) => a + b, 0) /
              ctx.networkScores.length;
          }

          // Get peak participants for this session
          let peakParticipants = null;
          if (ctx.dbRoomId) {
            peakParticipants = await countActiveParticipants(ctx.dbRoomId);
          }

          // End call session
          if (ctx.callSessionId) {
            await endCallSession(ctx.callSessionId, {
              avgNetworkScore: avgScore,
              peakParticipants,
            });
          }

          // Remove participant
          if (ctx.dbUserId && ctx.dbRoomId) {
            await removeParticipant(ctx.dbUserId, ctx.dbRoomId);
          }

          // If room is now empty, end it
          if (shouldCleanupRoom && ctx.dbRoomId && roomId) {
            await endRoom(roomId);
            console.log(`DB: Room ${roomId} ended`);
          }

          socketDbContext.delete(socket.id);
          console.log(`DB: Session cleaned up`);
        }
      } catch (dbErr) {
        console.error("DB error on disconnect:", dbErr.message);
      }

      // ── Mediasoup cleanup (existing logic) ──
      if (shouldCleanupRoom && roomId) {
        const router = routers.get(roomId);
        if (router) {
          try {
            await router.close();
            routers.delete(roomId);
            console.log(`Room ${roomId} cleaned up - router closed`);
          } catch (error) {
            console.error(`Error closing router for room ${roomId}:`, error);
          }
        }
      }
      for (const [producerId, pdc] of producers.entries()) {
        if (pdc.peerId === socket.id) {
          try {
            if (pdc.scoreInterval) {
              clearInterval(pdc.scoreInterval);
            }
            await pdc.producer.close();
            producers.delete(producerId);
          } catch (error) {
            console.log(error);
          }
        }
      }
      for (const [consumerId, cd] of consumers.entries()) {
        if (cd.peerId === socket.id) {
          try {
            await cd.consumer.close();
            consumers.delete(consumerId);
          } catch (error) {
            console.log(error);
          }
        }
      }
      for (const [transportId, transportData] of transports.entries()) {
        if (transportData.peerId === socket.id) {
          try {
            await transportData.transport.close();
            transports.delete(transportId);
          } catch (error) {
            console.log("Error closing transport:", error);
          }
        }
      }
      io.to(roomId).emit("disconnectPeer", { peerId: socket.id });
    });
  });
};

export { workers, routers };
