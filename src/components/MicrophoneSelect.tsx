import {
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";
import { useEffect } from "react";

export function MicrophoneSelect() {
  // TODO remove roomContext, this is only needed because of a bug in `useMediaDeviceSelect`
  const roomContext = useRoomContext();
  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind: "audioinput" });

  useEffect(() => {
    console.log("NEIL active device id", activeDeviceId);
  }, [activeDeviceId]);

  return (
    <div className="px-2">
      <div className="flex items-center">
        <select
          onChange={(e) => {
            console.log("NEIL on chagne", e.currentTarget.value);
            setActiveMediaDevice(e.currentTarget.value);
          }}
          value={activeDeviceId}
          className="select select-sm w-full sm:max-w-[200px] max-w-[100px] m-2 select-none"
        >
          <option value={-1} disabled>
            Choose your microphone
          </option>
          {devices.map((m) => (
            <option value={m.deviceId} key={m.deviceId}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
