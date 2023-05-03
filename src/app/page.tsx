"use client";

import { BottomBar } from "@/components/BottomBar";
import { LiveKitRoom } from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";
import { useMobile } from "@/util/useMobile";
import { MeetView } from "@/components/MeetView";
import { ConnectionDetails } from "@/pages/api/connection_details";

export default function Page() {
  const isMobile = useMobile();
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);

  const requestConnectionDetails = useCallback(async () => {
    const response = await fetch("/api/connection_details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      return response.json();
    }

    const { error } = await response.json();
    throw error;
  }, []);

  useEffect(() => {
    requestConnectionDetails().then(setConnectionDetails);
  }, [requestConnectionDetails]);

  if (!connectionDetails) {
    return null;
  }

  // Show the room UI
  return (
    <div>
      <LiveKitRoom
        token={connectionDetails.token}
        serverUrl={connectionDetails.ws_url}
        connect={true}
      >
        <div className="flex h-screen w-screen">
          <div
            className={`flex ${
              isMobile ? "flex-col-reverse" : "flex-col"
            } w-full h-full`}
          >
            <div className="grow flex">
              <div className="grow">
                <MeetView />
              </div>
            </div>
            <div className="bg-neutral">
              <BottomBar />
            </div>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
}
