import React, { useState, useRef } from "react";
import { VirtualBackgroundProcessor } from "@videosdk.live/videosdk-media-processor-web";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { ImageIcon, XCircle, Sparkles } from "lucide-react";

const BackgroundChange = ({
  localcameraStreamRef,
  localstreamRef,
  sendTransportRef,
}) => {
  const [open, setOpen] = useState(false);
  const videoProcessorRef = React.useRef(null);

  if (!videoProcessorRef.current) {
    videoProcessorRef.current = new VirtualBackgroundProcessor();
  }
  const videoProcessor = videoProcessorRef.current;
  const imageUrls = [
    "https://cdn.videosdk.live/virtual-background/paper-wall.jpeg",
    "https://cdn.videosdk.live/virtual-background/beach.jpeg",
    "https://cdn.videosdk.live/virtual-background/san-fran.jpeg",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
    "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1",
    "https://images.unsplash.com/photo-1473186505569-9c61870c11f9",
  ];

  const backgroundOptions = [
    { url: imageUrls[0], name: "Paper Wall", description: "Professional office backdrop" },
    { url: imageUrls[1], name: "Beach", description: "Tropical paradise setting" },
    { url: imageUrls[2], name: "San Francisco", description: "Iconic city skyline" },
    { url: imageUrls[3], name: "Mountain View", description: "Peaceful highland view for calm focus" },
    { url: imageUrls[4], name: "Sunrise Beach", description: "Bright, warm, and vibrant morning vibe" },
    { url: imageUrls[5], name: "Cozy Office", description: "Minimal workspace with natural lighting" },
    { url: imageUrls[6], name: "Forest Retreat", description: "Nature-inspired green background" },
    { url: imageUrls[7], name: "Modern Workspace", description: "Clean and stylish home office look" },
    { url: imageUrls[8], name: "Minimalist Room", description: "Neutral background for a neat appearance" },
    { url: imageUrls[9], name: "City Lights", description: "Urban night skyline for a modern touch" },
  ];


  const handleStartVirtualBackground = async (config) => {
    try {
      if (!videoProcessor.ready) {
        await videoProcessor.init({
          processor: "mediapipe",
        });
      }

      const processedStream = await videoProcessor.start(
        localcameraStreamRef.current,
        config
      );
      if (localstreamRef.current && localstreamRef.current.srcObject) {
        localstreamRef.current.srcObject = processedStream;
      }
      const videoTrack = processedStream.getVideoTracks()[0];
      if (!videoTrack) console.log("no track");
      if (videoTrack && sendTransportRef.current) {
        await sendTransportRef.current.produce({
          track: videoTrack,
          appData: { source: "camera", kind: "video" },
          encodings: [
            {
              rid: "r0",
              maxBitrate: 100000,
              scaleResolutionDownBy: 4,
              scalabilityMode: "L1T3",
            },
            {
              rid: "r1",
              maxBitrate: 500000,
              scaleResolutionDownBy: 2,
              scalabilityMode: "L1T3",
            },
            { rid: "r2", maxBitrate: 1500000, scalabilityMode: "L1T3" },
          ],
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStopVirtualBackground = async () => {
    videoProcessor.stop();
    const stream = localcameraStreamRef.current;
    if (localstreamRef.current && localstreamRef.current.srcObject) {
      localstreamRef.current.srcObject = localcameraStreamRef.current;
    }
    const videoTrack = stream.getVideoTracks()[0];
    await sendTransportRef.current.produce({
      track: videoTrack,
      appData: { source: "camera", kind: "video" },
      encodings: [
        {
          rid: "r0",
          maxBitrate: 100000,
          scaleResolutionDownBy: 4,
          scalabilityMode: "L1T3",
        },
        {
          rid: "r1",
          maxBitrate: 500000,
          scaleResolutionDownBy: 2,
          scalabilityMode: "L1T3",
        },
        { rid: "r2", maxBitrate: 1500000, scalabilityMode: "L1T3" },
      ],
    });
  };

  const handleChangeConfig = async (url) => {
    const config = {
      type: "image",
      imageUrl: url,
      smoothness: 0.9,
      blurStrength: 0.2,
    };
    await handleStartVirtualBackground(config);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-3 rounded-full transition-transform transform hover:-translate-y-0.5 cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-200"
          title="Virtual Background"
        >
          <Sparkles size={30} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <Card className="border-none shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>Virtual Backgrounds</CardTitle>
            </div>
            <CardDescription>
              Choose a background or disable the virtual background effect
            </CardDescription>
          </CardHeader>

          <ScrollArea className="h-[calc(90vh-200px)] px-6">
            <CardContent className="space-y-6 p-0">
              {/* Background Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                {backgroundOptions.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleChangeConfig(option.url)}
                    className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img
                        src={option.url}
                        alt={option.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 text-white">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm">Apply Background</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 text-left">
                      <p className="text-sm mb-1">{option.name}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </ScrollArea>

          {/* Disable Button */}
          <div className="px-6 py-4 border-t">
            <Button
              onClick={() => {
                handleStopVirtualBackground();
                setOpen(false);
              }}
              variant="outline"
              className="w-full sm:w-auto gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Disable Virtual Background
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundChange;
