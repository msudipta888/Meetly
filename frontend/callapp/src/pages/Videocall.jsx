import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/useSocket";
import * as mediasoupClient from "mediasoup-client";
import { ProduceMedia } from "./ProduceMedia";
import { useCallback } from "react";
import { VideoPlayer } from "./VideoPlayer";

const Videocall = () => {
  const socket = useSocket();
  const deviceRef = useRef();
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const localstreamRef = useRef(null);
  const [remoteStream,setRemoteStreams] = useState(new Map());
  const [producers, setProducers] = useState([]);
  const remoteMediaStreamRef = useRef(null);
  const receivedTracksRef = useRef({ video: false, audio: false });
  useEffect(() => {
    socket.emit("getRouterRTPCapebilities");
  }, []);
  const getStream = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (localstreamRef.current) {
        localstreamRef.current.srcObject = media;
      }
      return media;
    } catch (error) {
      console.log("Error in getting user media:", error);
    }
  };
  const initRoom = async (routerRtpCapabilities) => {
    try {
      if (deviceRef.current) {
        console.log("Device is already present");
        return;
      }
      const deveice = new mediasoupClient.Device();
      await deveice.load({ routerRtpCapabilities });
      deviceRef.current = deveice;
           await createRecvTransport(deveice);

      const stream = await getStream();

      await createSendTransport(deveice, stream);
      await getExistingProducer();
    } catch (error) {
      console.log("Device is not loaded:", error);
    }
  };

  const createSendTransport = async (device, stream) => {
    try {
      if (!device) {
        throw new Error("pls check your device, There ios no device");
      }
      socket.emit(
        "createWebRtcTransport",
        { direction: "send" },
        async (tpsOption) => {
          console.log("transport:", tpsOption);
          const sendTransport = await device.createSendTransport(tpsOption);
          sendTransportRef.current = sendTransport;
          sendTransport.on(
            "connect",
            ({ dtlsParameters }, callback, errorCallback) => {
              console.log("connect with transport");
              socket.emit(
                "connectTransport",
                {
                  transportId: sendTransport.id,
                  dtlsParameters,
                },
                (res) => {
                  if (!res || res.error) {
                    console.error("connectTransport error", res?.error);
                    errorCallback(
                      new Error(res?.error || "connect transport failed")
                    );
                    return;
                  } else console.log("connectTransport success", res);
                  callback();
                }
              );
            }
          );
          sendTransport.on(
            "produce",
            async ({ kind, rtpParameters }, callback, errorCallback) => {
              try {
                console.log(`Producing ${kind}...`);

                socket.emit(
                  "produce",
                  {
                    transportId: sendTransport.id,
                    kind,
                    rtpParameters,
                  },
                  (res) => {
                    if (res.error) {
                      errorCallback(new Error(res.error));
                    } else {
                      console.log("Producer ID from server:", res.id);
                      const producerId = res.id;
                      setProducers((p) => [...p, producerId]);

                      callback({ id: res.id });
                    }
                    console.log("producer length:", producers);
                  }
                );
                sendTransport.on("connectionstatechange", (state) => {
                  console.log("Send transport state:", state);

                  if (state === "failed" || state === "closed") {
                    console.error("Send transport failed/closed");
                  }
                });
              } catch (error) {
                console.log("Error in produce send transport:", error);
                errorCallback(error);
              }
            }
          );
          if (stream.getVideoTracks().length > 0) {
            await ProduceMedia(sendTransport, stream);
          }
        }
      );
    } catch (error) {
      console.error("Error in send transport:", error);
    }
  };
  const createRecvTransport = async (device) => {
    try {
      if (!device) {
        throw new Error("pls check your device, There ios no device");
      }
      socket.emit(
        "createWebRtcTransport",
        { direction: "recv" },
        async (tpsOption) => {
          const recvTransport = await device.createRecvTransport(tpsOption);
          recvTransportRef.current = recvTransport;
          recvTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errorCallback) => {
              try {
                socket.emit("connectTransport", {
                  transportId: recvTransport.id,
                  dtlsParameters: dtlsParameters,
                });
                callback();
              } catch (error) {
                errorCallback(error);
              }
            }
          );
        }
      );
    } catch (error) {
      console.error("Error in send transport:", error);
    }
  };
  const consumeClient = async (producerId) => {
    if (!producerId) throw new Error("ProducerId or Kind is not present");
    try {
      if (!recvTransportRef.current) {
        throw new Error("Receive transport not created");
      }
      const res = await new Promise((resolve, reject) => {
        socket.emit(
          "consume",
          {
            producerId,
            rtpCapabilities: deviceRef.current.rtpCapabilities,
            transportId: recvTransportRef.current.id,
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      console.log(res);
      const consumer = await recvTransportRef.current.consume({
        id: res.id,
        producerId: res.producerId,
        kind: res.kind,
        rtpParameters: res.rtpParameters,
      });
      console.log("created consumer:", consumer);
      consumer.on("transportclose", () => {
        console.log("Consumer transport closed");
      });
      consumer.on("producerclose", () => {
        if (remoteMediaStreamRef.current) {
          const track = consumer.track;
          remoteMediaStreamRef.current.removeTrack(track);
        }
      });

      await new Promise((resolve, reject) => {
        socket.emit(
          "resumeConsumer",
          { consumerId: consumer.id },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      console.log(`consumer created:`, consumer.id);
      return consumer;
    } catch (error) {
      console.error("Error in consume:", error);
      return;
    }
  };
  const getExistingProducer = async () => {
    try {
      const res = await new Promise((resolve, reject) => {
        socket.emit("getProducers",  (response) => {
          if (response.error) reject(new Error(response.error));
          else {
            resolve(response);
          }
        });
      });
  console.log('received all producers:',res)
      for (let producer of res) {
    const consumer=  await consumeClient(producer.id);
    const track = consumer.track;
    console.log('track:',track)
    // initialize one time for audio and video
    if(!remoteMediaStreamRef.current){
      remoteMediaStreamRef.current = new MediaStream();
      if(remoteStream){
        setRemoteStreams((r)=>{
          const newRemote = new Map(r);
          newRemote.set(producer.id,remoteMediaStreamRef.current);
          return newRemote
        })
      }
     
    }
  // store track in same remote media stream
    remoteMediaStreamRef.current.addTrack(track);
      }
    
    } catch (error) {
      console.log(error);
    }
  };

  const newProducerNotify = useCallback(async ({ producerId, kind }) => {
    try {
      const consumer = await consumeClient(producerId);
      const track = consumer.track;
      console.log(
        `✅ Received ${kind} track:`,
        track.id,
        "readyState:",
        track.readyState
      );

      if (!remoteMediaStreamRef.current) {
        console.log("🎬 Creating new MediaStream for remote peer");
        remoteMediaStreamRef.current = new MediaStream();
        if(remoteStream){
        setRemoteStreams((r)=>{
          const newRemote = new Map(r);
          newRemote.set(producerId,remoteMediaStreamRef.current);
          return newRemote
        })
      }
       
      }

      // Add track to the stream
      remoteMediaStreamRef.current.addTrack(track);
      receivedTracksRef.current[kind] = true;
    } catch (error) {
      console.error("Error in consume:", error);
    }
  }, []);
     
  

  useEffect(() => {
    socket.on("routerRtpCapabilities", initRoom);
    socket.on("newProducer", newProducerNotify);

    return () => {
      socket.off("routerRtpCapabilities", initRoom);
      socket.off("newProducer", newProducerNotify);
    };
  }, []);
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Local Video (You)</h2>
        <video
          ref={localstreamRef}
          autoPlay
          playsInline
          muted
          className="w-96 h-72 bg-black border-2 border-blue-500 rounded"
        />
      </div>

      <div>
        
       {
        Array.from(remoteStream).map(([pid,stream])=>(
          <div>
          <p> pid:{pid}</p>
         <VideoPlayer stream={stream} key={pid} />
         </div>
        ))
       }
       
          
        
        
       
       
      </div>
    </div>
  );
};

export default Videocall;
