import { ShareIcon } from "lucide-react";
import { useRef } from "react";

const ScreenShare = ({
  producersRef,
  sendTransportRef,
  localcameraStreamRef,
  localstreamRef,
  localPeerId
}) => {
  const screenStreamRef = useRef(null);

  const getClientProducer = (peerId) => {
    
    const key = `${peerId}-video`;
    const client = producersRef.current.get(key);
     
    return client ?? null;
  };

  const shareScreen = async () => {
    if (
      !sendTransportRef ||
      !sendTransportRef.current ||
      !localstreamRef ||
      !localstreamRef.current ||
      !producersRef ||
      !localPeerId
    ) {
      return;
    }

    try {
      const media = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      if (!media) {
        console.log("No display media obtained");
        return;
      }

      screenStreamRef.current = media;
      if (localstreamRef.current && localstreamRef.current.srcObject) {
        localstreamRef.current.srcObject = media;
      }

      const videoTrack = media.getVideoTracks()[0];
      if (!videoTrack) {
        console.log("No video track in display media");
        return;
      }

      
      await recreateProducerWithTrack(videoTrack, { source: "screen", kind: "video" });  
      videoTrack.onended = async () => {
        try {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }

          // Get fresh camera stream
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

          localcameraStreamRef.current = media;
          if (localstreamRef.current && localstreamRef.current.srcObject) {
            localstreamRef.current.srcObject = media;
          }

          const cameraVideoTrack = media.getVideoTracks()[0];
          if (!cameraVideoTrack) {
            console.error("No camera video track obtained");
            return;
          }

          const videoProducer = getClientProducer(localPeerId);
          console.log("Switching back to camera:", {
            currentSource: videoProducer?.appData?.source,
            producerId: videoProducer?.id
          });

          if (videoProducer && videoProducer.appData?.source === "screen") {
            await recreateProducerWithTrack(cameraVideoTrack, { source: "camera", kind: "video" });
          } else if (videoProducer && typeof videoProducer.replaceTrack === "function") {
            await videoProducer.replaceTrack(cameraVideoTrack);
          } else {
            await recreateProducerWithTrack(cameraVideoTrack, { source: "camera", kind: "video" });
          }

          console.log("✅ Successfully switched back to camera");
        } catch (error) {
          console.error("❌ stopScreenShare error:", error);
        }
      };
    } catch (error) {
      console.log("❌ Error in screen share:", error);
    }
  };

  const recreateProducerWithTrack = async (track, appData = { source: "screen", kind: "video" }) => {
    if (!sendTransportRef || !sendTransportRef.current) {
      throw new Error("sendTransportRef.current not available");
    }

    try {
      const key = `${localPeerId}-video`;
      
      const old = producersRef.current.get(key);
      if (old && typeof old.close === "function") {
        try {
          
          old.close();
        } catch (e) {
          console.warn("Old producer close failed:", e);
        }
      }

      console.log("Creating new producer with appData:", appData);
      const newProducer = await sendTransportRef.current.produce({
        track,
        appData,
        encodings: [
          { rid: "r0", maxBitrate: 100000, scaleResolutionDownBy: 4, scalabilityMode: "L1T3" },
          { rid: "r1", maxBitrate: 500000, scaleResolutionDownBy: 2, scalabilityMode: "L1T3" },
          { rid: "r2", maxBitrate: 1500000, scalabilityMode: "L1T3" },
        ],
      });

      producersRef.current.set(key, newProducer);

    
      return newProducer;
    } catch (err) {
      console.error("❌ Failed creating new producer:", err);
      throw err;
    }
  };

  return (
    <button
      onClick={shareScreen}
      className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-transform transform hover:-translate-y-0.5"
      title="Share Screen"
    >
      <ShareIcon size={30} />
    </button>
  );
};

export default ScreenShare;