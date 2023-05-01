import {
  useConnectionState,
  useLocalParticipant,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { useCallback, useState } from "react";
import { LocalVideoView } from "./LocalAvatarView/LocalVideoView";

export function MeetView() {
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const [twitchEnabled, setTwitchEnabled] = useState(false);
  const [twitchStreamKey, setTwitchStreamKey] = useState("");

  const broadcast = useCallback(async () => {
    const response = await fetch("/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        streamKey: twitchStreamKey,
      }),
    });

    if (response.status === 200) {
      return response.json();
    }

    const { error } = await response.json();
    throw error;
  }, [twitchStreamKey]);

  if (connectionState !== ConnectionState.Connected) {
    return null;
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-4/5">
        <LocalVideoView
          onCanvasStreamChanged={(ms) => {
            console.log("NEIL ms", ms);
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
        <button className="btn m-2">Start Broadcast</button>
      </div>
    </div>
  );
}
