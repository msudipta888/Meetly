import { useEffect, useRef } from "react";

 export const VideoPlayer = ({ stream }) => {
    const videoRef = useRef(null);
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch((err) => {
        console.error("error playing video", err);
      });
    }, [stream]);
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-64 h-48 bg-black rounded"
      />
    );
  };