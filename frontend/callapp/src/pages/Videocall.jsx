import { useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/useSocket";
import * as mediasoupClient from "mediasoup-client";
import { ProduceMedia } from "./ProduceMedia";
import { VideoPlayer } from "./VideoPlayer";
import {
  Mic,
  MicOff,
  Phone,
  Share2,
  Clock,
  Settings,
  MessageCircle,
  MoreVertical,
  Camera,
  CameraOff,
} from "lucide-react";
import Draggable from "react-draggable";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ScreenShare from "./ScreenShare";
import Chat from "./Chat";
import BackgroundChange from "./BackgroundChange";

const Videocall = () => {
  const { roomId } = useParams();
  const { user } = useUser();
  const socket = useSocket();
  const deviceRef = useRef();
  const nodeRef = useRef(null);
  const parentRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const localstreamRef = useRef(null);
  const [remoteStream, setRemoteStreams] = useState(new Map());
  const producerRef = useRef(new Map()); //peerId => producerId,videoProducer
  const remoteMediaStreamRef = useRef(null);
  const localcameraStreamRef = useRef(null);
  const [mic, setMic] = useState(true);
  const [pin, setPin] = useState(null);
  const navigate = useNavigate();
  const [isRun, setIsRun] = useState(true);
  const [totalTime, setTotalTime] = useState()
  const [totalSec, setTotalSec] = useState(0)
  const [isCmeraOpen, setIsCameraOpen] = useState(true)
  const [mutedUsers, setMutedUsers] = useState({}); // { [peerId]: true|false }
  const [network, setNetwork] = useState({
    producerId: null,
    score: null,
  });


  const [showChat, setShowChat] = useState(false);



  const getStream = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate: { ideal: 30, max: 60 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
          autoGainControl: true,
          channelCount: 2,
        },
      });
      if (localstreamRef.current) {
        localstreamRef.current.srcObject = media;
        localcameraStreamRef.current = media;
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
              // Connected transport successfully
              socket.emit(
                "connectTransport",
                {
                  transportId: sendTransport.id,
                  dtlsParameters,
                },
                (res) => {
                  if (!res || res.error) {
                    errorCallback(new Error(res?.error || "connect transport failed"));
                  } else {
                    callback();
                  }
                }
              );
            }
          );
          sendTransport.on(
            "produce",
            async ({ kind, rtpParameters, appData }, callback, errorCallback) => {
              try {
                console.log(`Producing ${kind}...`);

                socket.emit(
                  "produce",
                  {
                    transportId: sendTransport.id,
                    kind,
                    rtpParameters,
                    appData
                  },
                  (res) => {
                    if (res.error) {
                      errorCallback(new Error(res.error));
                    } else {
                      callback({ id: res.id });
                    }
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
          if (
            stream.getVideoTracks().length > 0 ||
            stream.getAudioTracks().length > 0
          ) {
            const { produceVideoTrack } = await ProduceMedia(
              sendTransport,
              stream
            );
            const peerId = socket.id;
            const key = `${peerId}-video`;
            producerRef.current.set(key, produceVideoTrack);
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
    console.log("consumer call");
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
      const consumer = await recvTransportRef.current.consume({
        id: res.id,
        producerId: res.producerId,
        kind: res.kind,
        rtpParameters: res.rtpParameters,
      });
      consumer.on("transportclose", () => {});
      consumer.on("producerclose", () => {
        if (remoteMediaStreamRef.current) {
          const track = consumer.track;
          remoteMediaStreamRef.current.removeTrack(track);
        }
      });
      if (res.kind === "video") {
        try {
          await consumer.setPreferredLayers({
            spatialLayer: 2,
            temporalLayer: 2,
          });
          console.log("Set preferred layers to highest quality");
        } catch (err) {
          console.warn("Could not set preferred layers:", err);
        }
      }

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
      await consumer.resume();
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
        socket.emit("getProducers", (response) => {
          if (response.error) reject(new Error(response.error));
          else {
            resolve(response);
          }
        });
      });
      console.log("received all producers:", res);

      const peerUserById = new Map(); //peerId =>  {peerId,[{producerId,peerId,video},{producerId,peerId,audio}]}

      for (let val of res) {
        if (!peerUserById.has(val.peerId)) {
          peerUserById.set(val.peerId, []);
        }
        peerUserById.get(val.peerId).push(val);
        console.log("peer map:", peerUserById);
      }
      for (let [peerId, producers] of peerUserById) {
        const peerStream = new MediaStream();
        for (let producer of producers) {
          const consumer = await consumeClient(producer.id);
          const track = consumer.track;
          peerStream.addTrack(track);
        }
        setRemoteStreams((prev) => {
          const newStream = new Map(prev);
          newStream.set(peerId, peerStream);
          return newStream;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const newProducerNotify = async ({ producerId, peerId, source }) => {
    try {
      const consumer = await consumeClient(producerId);
      const track = consumer.track;
      await new Promise(resolve => setTimeout(resolve, 400));

      setRemoteStreams((prev) => {
        const newMap = new Map(prev);

        let peerStream = newMap.get(peerId);
        if (!peerStream) {
          peerStream = new MediaStream();
        }
        if (track.kind === "video") {
          const existingVideoTrack = peerStream.getVideoTracks();
          if (existingVideoTrack.length > 0) {
            existingVideoTrack.forEach((oldTrack) => {
              oldTrack.stop();
              peerStream.removeTrack(oldTrack);
            });

          }
        }
        peerStream.addTrack(track);

        newMap.set(peerId, new MediaStream(peerStream.getTracks()));

        return newMap;
      });
      console.log("remoteStream:", remoteStream);
    } catch (error) {
      console.error("Error in consume:", error);
    }
  };

  const disConnectUser = ({ peerId }) => {
    console.log("closed user");
    try {
      if (!peerId) throw new Error("Missing peerId");
      setRemoteStreams((prev) => {
        const stream = new Map(prev);
        stream.delete(peerId);
        return stream;
      });
    } catch (error) {
      console.log(error);
    }
  };
  const leaveCall = () => {
    if (localstreamRef.current && localstreamRef.current.srcObject) {
      const tracks = localstreamRef.current.srcObject.getTracks();
      console.log("track:", tracks);
      tracks.forEach((track) => track.stop());
      localstreamRef.current.srcObject = null;
    }
    if (sendTransportRef.current) {
      sendTransportRef.current.close();
    }
    if (recvTransportRef.current) {
      recvTransportRef.current.close();
    }
    const finalTime = formatTime(totalSec);
    setTotalTime(finalTime);
    setIsRun(false);
    setTotalSec(0);
    remoteStream.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    setRemoteStreams(new Map());
    if (deviceRef.current) {
      deviceRef.current = null;
    }
    producerRef.current = new Map();
    remoteMediaStreamRef.current = null;
    socket.disconnect();

    if (socket) {
      socket.once("connect", () => {
        console.log("Socket reconnected for next call");
        navigate("/");
      });
      socket.connect();
    } else {
      navigate("/");
    }
  };
  const checkNetworkQuality = ({ producerId, score }) => {
    console.log("score:", score);
    const scoreArray = Array.isArray(score) ? score : [];
    const numericScore = scoreArray.length > 0 
      ? Math.max(...scoreArray.map((s) => s.score ?? 0)) 
      : 0;
    console.log(numericScore);
    const level =
      numericScore > 7 ? "good" : numericScore > 4 ? "medium" : "poor";
    setNetwork({
      producerId: producerId,
      score: level,
    });
  };
  const togglePin = (pid) => {
    setPin(pin === pid ? null : pid);
  };
  const mutedUser = ({ userId, muted }) => {
    if (!userId || !muted) throw new Error("No user id found");
    setMutedUsers((prev) => ({ ...prev, [userId]: !!muted }))
  }


  const notifyOnCamera = async ({ userId }) => {
    if (!userId) return;
    try {
      setRemoteStreams((prev) => {
        const stream = prev.get(userId);
        console.log('notifyOnCamera stream:', stream);
        if (!stream) {
          console.log(`No stream for ${userId} - they may have just joined`);
          return prev;
        }

        // Clone the stream to force a re-render in VideoPlayer
        const newStream = new MediaStream(stream.getTracks());
        const videoTracks = newStream.getVideoTracks();
        videoTracks.forEach((t) => {
          t.enabled = true;
        });

        const newMap = new Map(prev);
        newMap.set(userId, newStream);
        return newMap;
      });
    } catch (err) {
      console.error(err);
    }
  };


  const NotifyOffCamera = async ({ userId }) => {
    if (!userId) {
      console.warn("No userId provided");
      return;
    }
    try {
      setRemoteStreams((prev) => {
        const stream = prev.get(userId);
        if (!stream) return prev;

        // Clone the stream to force a re-render in VideoPlayer
        const newStream = new MediaStream(stream.getTracks());
        const videoTracks = newStream.getVideoTracks();
        videoTracks.forEach((t) => {
          t.enabled = false;
        });

        const newMap = new Map(prev);
        newMap.set(userId, newStream);
        return newMap;
      });
    } catch (error) {
      console.error("Error disabling video:", error);
    }
  };
  useEffect(() => {
    if (!socket) return;

    socket.on("routerRtpCapabilities", initRoom);
    socket.on("producerScore", checkNetworkQuality);
    socket.on("newProducer", newProducerNotify);
    socket.on("mutedUser", mutedUser);
    socket.on("notifyOpenCamera", notifyOnCamera)
    socket.on("OffCamera", NotifyOffCamera)
    socket.on("disconnectPeer", disConnectUser);
    if (socket && roomId) {
      const onRoomCreated = ({ status }) => {
        if (status === "success") {
          socket.emit("getRouterRTPCapebilities");
        }
      };

      socket.on("roomCreated", onRoomCreated);

      const email = user?.emailAddresses[0]?.emailAddress;
      socket.emit("createRoom", { email, roomId });
    }

    return () => {
      if (socket) {
        socket.off("routerRtpCapabilities", initRoom);
        socket.off("newProducer", newProducerNotify);
        socket.off("disconnectPeer", disConnectUser);
        socket.off("mutedUser", mutedUser);
        socket.off("OffCamera", NotifyOffCamera);
        socket.off("notifyOpenCamera", notifyOnCamera);
        socket.off("producerScore", checkNetworkQuality);
        socket.off("roomCreated");
      }
    };
  }, [socket, roomId, user]);
  const cameraControl = async () => {
    setIsCameraOpen(!isCmeraOpen);

    const key = `${socket?.id}-video`;
    const videoProducer = producerRef.current.get(key);

    if (!isCmeraOpen) {
      // User is turning camera ON
      const stream = await getStream();
      localstreamRef.current.srcObject = stream;

      // We must tell Mediasoup to start sending this new track to everyone
      if (videoProducer) {
        try {
          const newVideoTrack = stream.getVideoTracks()[0];
          if (newVideoTrack) {
            await videoProducer.replaceTrack({ track: newVideoTrack });
            if (videoProducer.paused) {
              videoProducer.resume();
            }
            console.log("Successfully replaced video track on producer");
          }
        } catch (err) {
          console.error("Failed to replace video track", err);
        }
      }

      socket?.emit("cameraOpen", { userId: socket?.id })
    } else {
      // User is turning camera OFF
      if (videoProducer) {
        videoProducer.pause();
      }
      if (localstreamRef.current && localstreamRef.current.srcObject) {
        const tracks = localstreamRef.current.srcObject.getTracks();
        tracks.forEach((track) => {
          track.kind === "video" && track.stop();
        });
      }
      localstreamRef.current.srcObject = null;
      socket?.emit("cameraOff", { userId: socket?.id })
    }
  }

  useEffect(() => {
    if (!isRun) return;

    const interval = setInterval(() => {
      setTotalSec((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRun]);
  const formatTime = (sec) => {
    const hr = Math.floor(sec / 3600);
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return [hr, m, s].map((v) => String(v).padStart(2, "0"))
      .join(":");
  }

  const mutedMic = () => {
    const newMicState = !mic;
    setMic(newMicState);
    setMutedUsers((prev) => ({ ...prev, [socket?.id]: !newMicState }))
    socket?.emit("muted", { userId: socket?.id, muted: !newMicState ? true : false });
  };


  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
              VC
            </div>
            <div>
              <h1 className="text-sm">Video Room</h1>
              <p className="text-xs text-slate-400">
                Live • {remoteStream.size + 1} participants
              </p>
            </div>
          </div>

          <div className={`flex items-center ${showChat ? "pr-[400px]" : ""} gap-4`}>
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-300">
              <Clock size={16} />
              <span className="font-mono">{formatTime(totalSec)}</span>
            </div>
            <div>
              <button className="p-2 cursor-pointer rounded-lg hover:bg-slate-800 transition-colors" onClick={() => setShowChat(!showChat)}>
                <MessageCircle size={20} />
              </button>
              <Chat setShowChat={setShowChat} showChat={showChat} roomUuid={roomId} />
            </div>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
              onClick={leaveCall}
            >
              <Phone size={18} />
              <span className="hidden sm:inline">Leave</span>
            </button>

          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-hidden">
        <div className={`max-w-7xl mx-auto h-full px-6 py-6 relative ${showChat ? "pr-[400px]" : ""}`}>
          <section
            className="flex flex-col gap-6 h-full min-h-0"
            style={{ height: "calc(100vh - 96px)" }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth pb-32">
              <div
                ref={parentRef}
                className={`fixed inset-0 z-40 bg-black/30 ${pin === null ? "" : "backdrop-blur-sm"}  pointer-events-none transition-all duration-300`}
                style={{ paddingTop: "4.5rem" }}
              >
                {pin !== null && remoteStream.has(pin) && (
                  <Draggable
                    nodeRef={nodeRef}
                    bounds="parent"
                    handle=".drag-handle"
                  >
                    <div
                      ref={nodeRef}
                      className="drag-handle pointer-events-auto cursor-move transform transition-all ease-out"
                      style={{
                        width: "700px",
                        height: "450px",
                        maxHeight: "calc(100vh - 6.5rem)",
                        position: "absolute",
                        left: "50%",
                        top: "1rem",
                        transform: "translateX(-50%) , translateY(-50%)",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                        background:
                          "linear-gradient(135deg, rgba(30,41,59,0.95) 60%, rgba(59,130,246,0.4) 100%)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="relative w-full h-full">
                        <div
                          style={{ maxHeight: "calc(100vh - 6.5rem)" }}
                          className="w-full h-full"
                        >
                          <VideoPlayer
                            stream={remoteStream.get(pin)}
                            mic={mic}
                            className="w-full h-full object-contain "
                          />
                        </div>

                        <button
                          onClick={() => togglePin(pin)}
                          aria-pressed="true"
                          title="Unpin"
                          className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white z-50 cursor-pointer"
                        >
                          📌
                        </button>

                        <button
                          onClick={() => togglePin(pin)}
                          aria-label="Close pinned view"
                          className="absolute top-3 right-3 w-8 h-8 rounded-md flex items-center justify-center bg-black/50 hover:bg-black/60 text-white z-50 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </Draggable>
                )}
              </div>

              <div className={`grid grid-cols-1 ${showChat ? "right-[30rem]" : ""} sm:grid-cols-2 gap-4 items-stretch`}>
                {Array.from(remoteStream.entries()).map(([pid, stream]) => {
                  const isPinned = pin === pid;
                  const hasVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

                  return (
                    <div key={pid} className="relative rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 group">

                      <div
                        className={`w-full ${isPinned ? "aspect-[16/8]" : "aspect-[16/9]"
                          } max-h-[460px] sm:max-h-[380px] bg-slate-800`}
                      >
                        {hasVideo ? (
                          <VideoPlayer
                            stream={stream}
                            mic={mic}
                            className={`w-full h-full object-cover ${isPinned ? "opacity-80 scale-95" : ""
                              }`}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                              <CameraOff size={48} className="text-slate-400" />
                              <span className="text-sm text-slate-400">Camera Off</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-800/90 px-2 py-1 rounded-full text-xs z-30">
                        <span className={`w-2 h-2 rounded-full inline-block ${hasVideo ? "bg-green-500" : "bg-red-500"
                          }`} />
                        <span className={hasVideo ? "text-green-400" : "text-red-400"}>
                          {hasVideo ? "Live" : "Camera Off"}
                        </span>
                      </div>

                      {/* Pin Button */}
                      <button
                        onClick={() => togglePin(pid)}
                        aria-pressed={isPinned}
                        title={isPinned ? "Unpin" : "Pin"}
                        className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-30 ${isPinned
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                      >
                        📌
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 z-50">
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-slate-800/50">
                <button
                  onClick={mutedMic}
                  className={`p-3 rounded-full cursor-pointer transition-all transform hover:scale-105 ${mic
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                    : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  aria-pressed={mic}
                  title={mic ? "Mute" : "Unmute"}
                >
                  {mic ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                <button
                  onClick={cameraControl}
                  className={`p-3 rounded-full transition-all transform hover:scale-105 cursor-pointer
                    ${isCmeraOpen
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                      : "bg-red-600 hover:bg-red-700 text-white"
                    }
                  `}
                  title={isCmeraOpen ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {isCmeraOpen ? <Camera size={24} /> : <CameraOff size={24} />}
                </button>

                <ScreenShare
                  producersRef={producerRef}
                  sendTransportRef={sendTransportRef}
                  localcameraStreamRef={localcameraStreamRef}
                  localstreamRef={localstreamRef}
                  localPeerId={socket?.id}
                />

                <BackgroundChange
                  localstreamRef={localstreamRef}
                  localcameraStreamRef={localcameraStreamRef}
                  sendTransportRef={sendTransportRef}
                  producerRef={producerRef}
                  socket={socket}
                />

                <button
                  className="p-3 rounded-full transition-all transform hover:scale-105 cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                  onClick={leaveCall}
                  title="Leave Call"
                >
                  <Phone size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="pointer-events-none overflow-hidden">
            <div className={`pointer-events-auto absolute bottom-6 ${showChat ? "left-[4px]" : "right-6"} w-52 h-40 rounded-xl overflow-hidden bg-slate-800/90 backdrop-blur-md border-2 border-slate-700/50 hidden sm:block shadow-2xl`}>
              <video
                ref={localstreamRef}
                muted={!mic}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                You
              </div>
            </div>

            <div className={`text-xs ${showChat ? "left-[12rem]" : ""} text-slate-400 absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-800`}>
              Network:{" "}
              <span className="text-green-500">
                {network.score}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Videocall;
