// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AccessToken,
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

  const streamOutput: StreamOutput = {
    protocol: StreamProtocol.RTMP,
    urls: rtmpUrls,
  };

  // Wait for tracks to be published
  let videoTrack: TrackInfo | null = null;
  let audioTrack: TrackInfo | null = null;

  const lookForTracksStartTime = Date.now();
  while (!videoTrack && !audioTrack) {
    console.log("NEIL waiting for tracks");
    const streamer = await roomClient.getParticipant(
      broadcastDetails.room_name,
      "streamer"
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    videoTrack =
      streamer.tracks.filter((track) => track.type === TrackType.VIDEO)[0] ||
      null;

    audioTrack =
      streamer.tracks.filter((track) => track.type === TrackType.AUDIO)[0] ||
      null;

    if (Date.now() - lookForTracksStartTime > 10_000) {
      return res.status(500).json({ error: "Timed out waiting for tracks" });
    }
  }

  const opts: TrackCompositeOptions = {};

  if (videoTrack) {
    opts.videoTrackId = videoTrack.sid;
  }

  if (audioTrack) {
    opts.audioTrackId = audioTrack.sid;
  }

  await egressClient.startTrackCompositeEgress(
    broadcastDetails.room_name,
    streamOutput,
    opts
  );

  res.status(200).send();
}
