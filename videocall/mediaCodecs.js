 export const mediaCodecs = [
   {
    kind: 'video',
    mimeType: 'video/H264',
    clockRate: 90000,
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000,
      'x-google-max-bitrate': 3000,
    },
  },
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
    preferredPayloadType: 96,
    parameters: {
      minptime: 10,
      useinbandfec: 1,
      stereo: 1,
      maxaveragebitrate: 128000,
    },
  },
];
