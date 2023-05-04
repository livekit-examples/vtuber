import { useMobile } from "@/util/useMobile";
import { MediaDeviceSelect } from "@livekit/components-react";
import { GithubLink } from "./GithubLink";
import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelect } from "./MicrophoneSelect";
import { PoweredByLiveKit } from "./PoweredByLiveKit";

export function BottomBar() {
  const mobile = useMobile();
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex h-full">
        <MicrophoneMuteButton />
        <MicrophoneSelect />
      </div>
      <div className="pr-2 flex">
        {!mobile && (
          <div className="pr-2">
            <GithubLink />
          </div>
        )}
        <PoweredByLiveKit />
      </div>
    </div>
  );
}
