// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  EgressClient,
  RoomServiceClient,
  StreamOutput,
  StreamProtocol,
  TrackCompositeOptions,
  TrackInfo,
  TrackType,
} from "livekit-server-sdk";

export type BroadcastDetails = {
  room_name: string;
  twitch_stream_key?: string;
  youtube_stream_key?: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<void | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Invalid method" });
  }

  const broadcastDetails = req.body as BroadcastDetails;

  console.log("NEIL broadcastDetails", broadcastDetails);

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const livekitHost = wsUrl?.replace("wss://", "https://");

  const roomClient = new RoomServiceClient(livekitHost, apiKey, apiSecret);
  const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);

  const rtmpUrls: string[] = [];

  if (broadcastDetails.twitch_stream_key) {
    rtmpUrls.push(
      `rtmp://live.twitch.tv/app/${broadcastDetails.twitch_stream_key}`
    );
  }

  if (broadcastDetails.youtube_stream_key) {
    rtmpUrls.push(
      `rtmp://a.rtmp.youtube.com/live2/${broadcastDetails.youtube_stream_key}`
    );
  }

  const streamOutput: StreamOutput = {
    protocol: StreamProtocol.RTMP,
    urls: rtmpUrls,
  };

  await egressClient.startRoomCompositeEgress(
    broadcastDetails.room_name,
    streamOutput,
    {}
  );

  res.status(200).send();
}
