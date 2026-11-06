"use client";

import React, { useState } from "react";
import Button from "../../elements/button";
import SecureVideoPlayer from "../player/SecureVideoPlayer";

type Props = {
  media: any;
  isMediaSelected: boolean;
};

export default function WatchButton({ media, isMediaSelected }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleWatchClick = () => {
    if (!media || media.id === "placeholder") {
      alert("No video title uploaded yet. Please ingest a video from the Admin Command Center (Port 3001) to begin streaming.");
      return;
    }
    setIsPlaying(true);
  };

  return (
    <>
      <Button
        variant={{
          name: "primary",
          type: "watch",
          isInverted: isMediaSelected,
        }}
        onClick={handleWatchClick}
        isFull
      >
        Watch Now
      </Button>

      {isPlaying && (
        <SecureVideoPlayer
          media={{
            id: media.id,
            title: media.title,
            overview: media.overview,
            thumbnailUrl: media.image?.poster || media.image?.backdrop,
            durationSeconds: media.durationSeconds || 7200,
            driveFileIds: media.driveFileIds,
            audioTracks: media.audioTracks,
            subtitles: media.subtitles,
            isPremiumOnly: media.isPremiumOnly,
            qualityTiers: media.qualityTiers,
            streamUrl: media.streamUrl,
          }}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </>
  );
}
