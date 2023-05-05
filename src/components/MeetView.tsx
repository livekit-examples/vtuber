import { BroadcastDetails } from "@/pages/api/broadcast";
import {
  useConnectionState,
  useLiveKitRoom,
  useLocalParticipant,
  useMediaTrack,
  useRoomInfo,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { useCallback, useMemo, useState } from "react";
import { EgressDestination } from "./EgressDestination";
import { LocalVideoView } from "./LocalAvatarView/LocalVideoView";

export function MeetView() {
  const connectionState = useConnectionState();
  const { name } = useRoomInfo();
  const { localParticipant } = useLocalParticipant();
  const [canvasStream, setCavasStream] = useState<MediaStream | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const { track: micTrack } = useMediaTrack(
    Track.Source.Microphone,
    localParticipant
  );

  // StreamKeys
  const [twitchEnabled, setTwitchEnabled] = useState(false);
  const [twitchStreamKey, setTwitchStreamKey] = useState("");
  const [youtubeEnabled, setYouTubeEnabled] = useState(false);
  const [youtubeStreamKey, setYouTubeStreamKey] = useState("");

  const broadcast = useCallback(async () => {
    setBroadcastLoading(true);
    const body: BroadcastDetails = {
      room_name: name,
      twitch_stream_key: twitchEnabled ? twitchStreamKey : undefined,
    };

    try {
      const track = canvasStream!.getTracks()[0];
      await localParticipant.publishTrack(track, {
        source: Track.Source.Camera,
      });
      const mic = micTrack?.mediaStream?.getTracks()[0];
      if (mic) {
        await localParticipant.publishTrack(mic);
      }
      await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      const publishedTracks = localParticipant.getTracks();
      const tracks = publishedTracks
        .map((t) => t.track)
        .filter((t) => t)
        .map((t) => t?.mediaStreamTrack!);
      await localParticipant.unpublishTracks(tracks);
      throw e;
    } finally {
      setBroadcastLoading(false);
    }
  }, [
    canvasStream,
    localParticipant,
    micTrack,
    name,
    twitchEnabled,
    twitchStreamKey,
  ]);

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
        <EgressDestination
          type="Twitch"
          setEnabled={setTwitchEnabled}
          setStreamKey={setTwitchStreamKey}
          enabled={twitchEnabled}
          streamKey={twitchStreamKey}
        />
        <EgressDestination
          type="YouTube"
          setEnabled={setYouTubeEnabled}
          setStreamKey={setYouTubeStreamKey}
          enabled={youtubeEnabled}
          streamKey={youtubeStreamKey}
        />
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
