// ProduceMedia.js
export const ProduceMedia = async (sendTransport, stream) => {
  if (!sendTransport) throw new Error("sendTransport not provided");
  if (!stream) throw new Error("Media stream not provided");

  // transport basic sanity checks
  if (sendTransport.closed) throw new Error("sendTransport is closed");
  if (!sendTransport.produce || typeof sendTransport.produce !== "function") {
    throw new Error("sendTransport does not support produce()");
  }

  const result = { video: null, audio: null };

  // Helper to produce a track and return the producer
  const produceTrack = async (track, options = {}) => {
    if (!track) return null;
    try {
      const producer = await sendTransport.produce({ track, ...options });
      // Dump entire producer for debugging — contains id and other useful props
      console.log(`${track.kind} producer created:`, producer);
      return producer;
    } catch (err) {
      console.error(`Failed to produce ${track.kind}:`, err);
      // Return null — caller can decide what to do
      return null;
    }
  };

  // Video (simulcast/encodings only when a video track exists)
  const videoTrack = stream.getVideoTracks && stream.getVideoTracks()[0];
  if (videoTrack) {
    result.video = await produceTrack(videoTrack, {
      encodings: [
        { maxBitrate: 100000 }, // low
        { maxBitrate: 300000 }, // med
        { maxBitrate: 900000 }, // high
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
      // optional: put appData so server can identify the track/source
      appData: { source: "camera", kind: "video" },
    });
  } else {
    console.log("No video track found on stream");
  }

  // Audio
  const audioTrack = stream.getAudioTracks && stream.getAudioTracks()[0];
  if (audioTrack) {
    result.audio = await produceTrack(audioTrack, {
      appData: { source: "mic", kind: "audio" },
    });
  } else {
    console.log("No audio track found on stream");
  }
};
