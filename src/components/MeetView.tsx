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
  const [isLive, setIsLive] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // StreamKeys
  const [twitchEnabled, setTwitchEnabled] = useState(false);
  const [twitchStreamKey, setTwitchStreamKey] = useState("");
  const [youtubeEnabled, setYouTubeEnabled] = useState(false);
  const [youtubeStreamKey, setYouTubeStreamKey] = useState("");

  const stopBroadcast = useCallback(async () => {
    setBroadcastLoading(true);
    try {
      const publishedTracks = localParticipant.getTracks();
      const tracks = publishedTracks
        .map((t) => t.track)
        .filter((t) => t)
        .map((t) => t?.mediaStreamTrack!);
      await localParticipant.unpublishTracks(tracks);
      setIsLive(false);
      setIsDirty(false);
    } catch (e) {
      console.log(e);
    } finally {
      setBroadcastLoading(false);
    }
  }, [localParticipant]);

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
      setIsLive(true);
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

  const viewerLink = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/view/${name}`;
  }, [name]);

  const broadcastButtonText = useMemo(() => {
    if (broadcastLoading) {
      return "";
    }
    return isLive ? "Stop Stream" : "Go Live";
  }, [broadcastLoading, isLive]);

  const setEnabled = useCallback(
    (type: "twitch" | "youtube") => (enabled: boolean) => {
      if (isLive) {
        setIsDirty(true);
      }
      if (type === "twitch") {
        setTwitchEnabled(enabled);
      } else if (type === "youtube") {
        setYouTubeEnabled(enabled);
      }
    },
    [isLive]
  );

  const setStreamKey = useCallback(
    (type: "twitch" | "youtube") => (key: string) => {
      if (isLive) {
        setIsDirty(true);
      }
      if (type === "twitch") {
        setTwitchStreamKey(key);
      } else if (type === "youtube") {
        setYouTubeStreamKey(key);
      }
    },
    [isLive]
  );

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
      <div className="flex flex-col w-1/5 h-full">
        {isDirty ? (
          <div className="bg-red-400">
            Changes have been rename. Re start broadcast for them to take effect
          </div>
        ) : null}
        <EgressDestination
          type="Twitch"
          setEnabled={setEnabled("twitch")}
          setStreamKey={setStreamKey("twitch")}
          enabled={twitchEnabled}
          streamKey={twitchStreamKey}
        />
        <EgressDestination
          type="YouTube"
          setEnabled={setEnabled("youtube")}
          setStreamKey={setStreamKey("youtube")}
          enabled={youtubeEnabled}
          streamKey={youtubeStreamKey}
        />
        <a
          className="link p-2"
          target="_blank"
          rel="noreferrer"
          href={viewerLink}
        >
          Preview Link
        </a>
        <div className="grow" />
        <button
          className={`btn m-2 ${broadcastLoading ? "loading" : ""}`}
          onClick={async () => {
            if (isLive) {
              await stopBroadcast();
            } else {
              await broadcast();
            }
          }}
        >
          {broadcastButtonText}
        </button>
      </div>
    </div>
  );
}
