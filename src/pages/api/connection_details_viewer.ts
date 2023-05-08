// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { v4 } from "uuid";

export type ConnectionDetailsViewerBody = {
  room: string;
};

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

  const at = new AccessToken(apiKey, apiSecret, { identity: "viewer-" + v4() });

  at.addGrant({
    room: req.body.room,
    roomJoin: true,
    canPublish: false,
    canSubscribe: true,
  });
  res.status(200).json({ token: at.toJwt(), ws_url: wsUrl });
}
