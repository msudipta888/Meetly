const express = require("express");
const mediasoup = require("mediasoup");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const io = new Server(5000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let worker;
const producerArray =[];
const routers = new Map(); // roomId => router
const transports = new Map(); // transpostId=>{transport,peerId,roomId,direction}
const producers = new Map(); //producerId=>producer
const consumers = new Map(); //consumerId=>consumer
const getAllProducers = new Map() // all producerId => producer
const mediaCodecs = [
  {
    mimeType: "audio/opus",
    kind: "audio",
    clockRate: 48000,
    preferredPayloadType: 100,
    channels: 2,
  },
  {
    mimeType: "video/H264",
    kind: "video",
    clockRate: 90000,
    preferredPayloadType: 101,
    rtcpFeedback: [
      { type: "nack" },
      { type: "nack", parameter: "pli" },
      { type: "ccm", parameter: "fir" },
      { type: "goog-remb" },
    ],
    parameters: {
      "level-asymmetry-allowed": 1,
      "packetization-mode": 1,
      "profile-level-id": "4d0032",
    },
  },
];
//1. create worker
const createWorker = async () => {
  try {
    worker = await mediasoup.createWorker({
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: "warn",
    });
    worker.on("died", () => {
      console.error("mediasoup Worker died, restart process");
      process.exit(1);
    });
    console.log("mediasoup worker created");
  } catch (error) {
    console.log("Error in creating worker:", error);
  }
};
createWorker();

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
  socket.on("createRoom", async (data) => {
    const { roomId, email } = data;
    console.log(`User ${email} is trying to create or join room: ${roomId}`);
    if (!routers.has(roomId)) {
      //2. create router
      const router = await worker.createRouter({ mediaCodecs });
      routers.set(roomId, router);
    }
    // join user in room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.emit("roomCreated", { status: "success", roomId });
  });

  //3.requerst for routerRTPCapabilities
  socket.on("getRouterRTPCapebilities", () => {
    const router = routers.get(socket.roomId);
    socket.emit("routerRtpCapabilities", router?.rtpCapabilities);
  });
  //4.create transport
  socket.on("createWebRtcTransport", async ({direction}, callback) => {
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
            announcedIp: "127.0.0.1",
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
      transport.on("dtlsstatechange",(dtlsState)=>{
        if(dtlsState==="closed"){
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
      console.error('Transport creation error:', error);
 if (typeof callback === 'function') {
      callback({ error: error.message || 'Transport not created' });
    }    }
  });
  //5.connect transport
  socket.on("connectTransport", async ({ transportId, dtlsParameters },callback) => {
    console.log("connectTransport request received");
    const transportData = transports.get(transportId);
    if (!transportData || !dtlsParameters) {
      return callback({error:" Invalid transport or DTLS parameters" });
    }
    try {
      await transportData.transport.connect({ dtlsParameters });
      if(typeof callback==='function')
         callback({id:transportData.id})
    } catch (error) {
       console.error('Transport connection error:', error);
        if (typeof callback === 'function') {
      callback({ error: error.message || 'Transport not connected' });
    }
    }
  });
 
  //6.produce
  socket.on(
    "produce",
    async ({ transportId, kind, rtpParameters }, callback) => {
      const transportData = transports.get(transportId);
      if (!transportData) {
        socket.emit("error", { error: "transport not found" });
        return;
      }
      console.log("direction:", transportData.direction);
      if (transportData.direction !== "send") {
        console.warn(
          "produce called on non-send transport",
          transportId,
          "direction=",
          transportData.direction
        );
        return callback({ error: "transport not configured for send" });
      }
      const producer = await transportData.transport.produce({
        kind,
        rtpParameters,
      });
      producers.set(producer.id, {
        producer,
        peerId: socket.id,
        roomId: transportData.roomId,
        kind
      });
    
      producer.on("transportclose", () => {
        console.log("Producer transport closed");
        producer.close();
        producers.delete(producer.id)
      });
      //notify others in room that a new producer has joined in room
      socket
        .to(transportData.roomId)
        .emit("newProducer", { producerId: producer.id,peerId:socket.id, kind });
      if(typeof callback ==='function')callback({ id: producer.id });
    }
  );
 
  //7. consume
  socket.on("consume", async ({ producerId,rtpCapabilities, transportId }, callback) => {
    try {
      if (typeof callback !== 'function') {
      console.error('consume called without callback');
      return;
    }

      const transportData = transports.get(transportId);
      const router = routers.get(transportData.roomId);
      const producer = producers.get(producerId);
      if (!producer) {
        return callback({ error: "Producer not found" });
      }
      console.log('dir:',transportData.direction)
      if (transportData.direction !== "recv") {
        console.warn(
          "consume called on non-recv transport",
          transportId,
          "direction=",
          transportData.direction
        );
        return callback({ error: "transport not configured for recv" });
      }
      //check if router can consume given producer
      if (
        !router.canConsume({
          producerId: producer.producer.id,
          rtpCapabilities: rtpCapabilities
        })
      ) {
        return callback({ error: "cannot consume" });
      }
      const consumer = await transportData.transport.consume({
        producerId: producer.producer.id,
        rtpCapabilities:rtpCapabilities,
        paused: true,
      });
      consumers.set(consumer.id, {
        consumer,
        peerId: socket.id,
        roomId: transportData.roomId,
      });
      
      callback({
        id: consumer.id, 
        producerId:producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (error) {
      console.error("Error in consuming:", error);
      if (typeof callback === 'function') {
      callback({ error: error.message || 'Consume failed' });
    }

    }
  });
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
   if(typeof callback==='function') callback({ error: error.message });
  }
});
socket.on('getProducers',(callback)=>{
 try {
  console.log("Getting all producers for peer:", socket.id);
  console.log('user join room:',socket.roomId)
  const roomId = socket.roomId;
  if(!roomId) return callback({ error: "Not in a room" });

  for(const [producerId,produceData] of producers.entries()){
   if(produceData.roomId === roomId && produceData.peerId !==socket.id){
    producerArray.push({
            id: producerId,
            peerId: produceData.peerId,
            kind: produceData.kind,
          });
   } 
  }
  console.log('answer:', producerArray);
  if (typeof callback === 'function') {
    return callback(producerArray);
  }
 } catch (error) {
  console.error(error);
  if(typeof callback === 'function'){
    return callback(error)
  }
 }
})
  socket.on("disconnect", async () => {
    //cleanup
    for (const [producerId, pdc] of producers.entries()) {
      if (pdc.peerId === socket.id) {
        try {
          console.log("producer peerId:", pdc.peerId);
          await pdc.producer.close();
            producers.delete(producerId);
        console.log("closed producer", producerId, "from", socket.id);
        } catch (error) {
          console.log(error);
        }
      
      }
    }
      for(const [consumerId,cd] of consumers.entries()){
      if(cd.peerId===socket.id){
       try {
        await cd.consumer.close();
        consumers.delete(consumerId);
     console.log('closed consumer', consumerId, 'from', socket.id);
       } catch (error) {
        console.log(error)
       }
        
      }
     }
     for (const [transportId, transportData] of transports.entries()) {
      if (transportData.peerId === socket.id) {
        try {
          await transportData.transport.close();
          transports.delete(transportId);
          console.log("Closed transport", transportId, "from", socket.id);
        } catch (error) {
          console.log("Error closing transport:", error);
        }
      }
    }
  });
});



