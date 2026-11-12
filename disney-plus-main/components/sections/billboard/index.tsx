"use client";

import { useEffect, useState } from "react";
import type { Media } from "../../../types";
import Backdrop from "./backdrop";
import { getStoredLatestVideo, STORAGE_KEY } from "../../../helpers/streamvault-storage";

type Props = {
  media: Media;
};

const Billboard = ({ media: initialMedia }: Props) => {
  const [media, setMedia] = useState<Media>(initialMedia);

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = getStoredLatestVideo();
      if (stored) {
        setMedia(stored);
      } else if (initialMedia) {
        setMedia(initialMedia);
      }
    };

    syncFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        syncFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("streamvault-sync", syncFromStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("streamvault-sync", syncFromStorage);
    };
  }, [initialMedia]);

  return (
    <section className="sticky -z-10 aspect-video max-h-screen w-full overflow-hidden tablet:top-0">
      <div className="relative h-full w-full">
        <Backdrop
          src={media?.image?.backdrop || media?.image?.poster || ""}
          isAlwaysDisplayed={true}
        />
        <div className="absolute inset-0 z-10 hidden bg-gradient-to-r from-background-dark to-transparent tablet:block" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
      </div>
    </section>
  );
};

export default Billboard;
