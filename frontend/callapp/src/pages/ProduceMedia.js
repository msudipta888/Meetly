export const ProduceMedia = async (sendTransport, stream) => {
  if (!sendTransport) throw new Error("sendTransport not provided");
  if (!stream) throw new Error("Media stream not provided");

  if (sendTransport.closed) throw new Error("sendTransport is closed");
  if (!sendTransport.produce || typeof sendTransport.produce !== "function") {
    throw new Error("sendTransport does not support produce()");
  }
  let produceVideoTrack;
  const produceTrack = async (track, options = {}) => {
    if (!track) return null;
    try {
      const producer = await sendTransport.produce({ track, ...options });
      return producer;
    } catch (err) {
      console.error(`Failed to produce ${track.kind}:`, err);
      return null;
    }
  };
 //video

  const videoTrack = stream.getVideoTracks && stream.getVideoTracks()[0];
  if (videoTrack) {
  produceVideoTrack=await produceTrack(videoTrack,
     {
      encodings: [
      {
        rid: 'r0',
        maxBitrate: 100000,
        scaleResolutionDownBy: 4,
        scalabilityMode: 'L1T3', 
      },
      {
        rid: 'r1',
        maxBitrate: 500000,
        scaleResolutionDownBy: 2,
        scalabilityMode: 'L1T3', 
      },
      {
        rid: 'r2',
        maxBitrate: 1500000, 
        scalabilityMode: 'L1T3', 
      },
    ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
      appData: { source: "camera", kind: "video" },
    });
  } else {
    console.log("No video track found on stream");
  }

  // Audio
  const audioTrack = stream.getAudioTracks && stream.getAudioTracks()[0];
  if (audioTrack) {
   await produceTrack(audioTrack, {
      appData: { source: "mic", kind: "audio" },
    });
  } else {
    console.log("No audio track found on stream");
  }
  return {produceVideoTrack}
};
