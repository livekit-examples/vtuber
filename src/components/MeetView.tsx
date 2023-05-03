import { BroadcastDetails } from "@/pages/api/broadcast";
import {
  useConnectionState,
  useLiveKitRoom,
  useLocalParticipant,
  useRoomInfo,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { useCallback, useMemo, useState } from "react";
import { LocalVideoView } from "./LocalAvatarView/LocalVideoView";

export function MeetView() {
  const connectionState = useConnectionState();
  const { name } = useRoomInfo();
  const { localParticipant } = useLocalParticipant();
  const [twitchEnabled, setTwitchEnabled] = useState(false);
  const [twitchStreamKey, setTwitchStreamKey] = useState("");
  const [canvasStream, setCavasStream] = useState<MediaStream | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const broadcast = useCallback(async () => {
    setBroadcastLoading(true);
    const body: BroadcastDetails = {
      room_name: name,
      twitch_stream_key: twitchEnabled ? twitchStreamKey : undefined,
    };

    try {
      const track = canvasStream!.getTracks()[0];
      await localParticipant.publishTrack(track);
      await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw e;
    } finally {
      setBroadcastLoading(false);
    }
  }, [canvasStream, localParticipant, name, twitchEnabled, twitchStreamKey]);

  const isLive = useMemo(() => {
    return localParticipant.publishedTracksInfo.length > 0;
  }, [localParticipant.publishedTracksInfo.length]);

  const broadcastButtonText = useMemo(() => {
    if (broadcastLoading) {
      return "";
    }
    return isLive ? "Stop Stream" : "Go Live";
  }, [broadcastLoading, isLive]);

  if (connectionState !== ConnectionState.Connected) {
    return null;
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-4/5">
        <LocalVideoView
          onCanvasStreamChanged={(ms) => {
            setCavasStream(ms);
          }}
        />
      </div>
      <div className="flex flex-col grow h-full">
        <div className="flex flex-col border rounded-sm m-1">
          <div className="font-italics ml-1">Twitch</div>
          <div className="flex items-center m-2">
            <input
              type="checkbox"
              checked={twitchEnabled}
              className="toggle toggle-sm mr-2"
              onChange={(e) => {
                setTwitchEnabled(e.target.checked);
              }}
            />
            <input
              onChange={(e) => {
                setTwitchStreamKey(e.target.value);
              }}
              value={twitchStreamKey}
              type="text"
              className="input input-sm"
              placeholder="Stream Key"
            />
          </div>
        </div>
        <div className="grow" />
        <button
          className={`btn m-2 ${broadcastLoading ? "loading" : ""}`}
          onClick={async () => {
            await broadcast();
          }}
        >
          {broadcastButtonText}
        </button>
      </div>
    </div>
  );
}
