import { useEffect, useRef } from "react";

export const VideoPlayer = ({ stream, mic, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;

    if (el.srcObject !== stream) { 
      el.srcObject = stream;
      el.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      muted={!mic}
      autoPlay
      playsInline
      className={`w-full h-full ${className || ""}`}
      style={{ backgroundColor: "#000" }}
    />
  );
};

