-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('INSTANT', 'GROUP', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'CO_HOST', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "roomUuid" TEXT NOT NULL,
    "title" TEXT,
    "type" "RoomType" NOT NULL DEFAULT 'GROUP',
    "status" "RoomStatus" NOT NULL DEFAULT 'WAITING',
    "isRecording" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" TEXT NOT NULL,
    "totalParticipents" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "wasAudioMuted" BOOLEAN NOT NULL DEFAULT false,
    "wasVideoOff" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "avgNetworkScore" DOUBLE PRECISION,
    "peakParticipants" INTEGER,
    "durationSec" INTEGER,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomUuid_key" ON "Room"("roomUuid");

-- CreateIndex
CREATE INDEX "Room_roomUuid_idx" ON "Room"("roomUuid");

-- CreateIndex
CREATE INDEX "Room_creatorId_idx" ON "Room"("creatorId");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "Room_scheduledAt_idx" ON "Room"("scheduledAt");

-- CreateIndex
CREATE INDEX "RoomParticipant_userId_idx" ON "RoomParticipant"("userId");

-- CreateIndex
CREATE INDEX "RoomParticipant_roomId_idx" ON "RoomParticipant"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomParticipant_userId_roomId_joinedAt_key" ON "RoomParticipant"("userId", "roomId", "joinedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_sentAt_idx" ON "ChatMessage"("roomId", "sentAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "CallSession_userId_idx" ON "CallSession"("userId");

-- CreateIndex
CREATE INDEX "CallSession_roomId_idx" ON "CallSession"("roomId");

-- CreateIndex
CREATE INDEX "CallSession_joinedAt_idx" ON "CallSession"("joinedAt");

-- CreateIndex
CREATE INDEX "Contact_senderId_idx" ON "Contact"("senderId");

-- CreateIndex
CREATE INDEX "Contact_receiverId_idx" ON "Contact"("receiverId");

-- CreateIndex
CREATE INDEX "Contact_status_idx" ON "Contact"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_senderId_receiverId_key" ON "Contact"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
