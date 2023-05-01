// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { v4 } from "uuid";

export type ConnectionDetails = {
  token: string;
  ws_url: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConnectionDetails | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Invalid method" });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: "streamer" });

  at.addGrant({
    room: v4(),
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });
  res.status(200).json({ token: at.toJwt(), ws_url: wsUrl });
}
