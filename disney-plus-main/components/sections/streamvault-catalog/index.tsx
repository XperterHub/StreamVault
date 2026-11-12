"use client";

import { useEffect, useState } from "react";
import Name from "../collection/name";
import Card from "../collection/portrait/card";
import { getStoredVideos, STORAGE_KEY } from "../../../helpers/streamvault-storage";
import type { Media } from "../../../types";

const StreamVaultCatalog = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      setMedias(getStoredVideos());
      setLoaded(true);
    };

    load();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        load();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("streamvault-sync", load);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("streamvault-sync", load);
    };
  }, []);

  if (!loaded || medias.length === 0) return null;

  return (
    <div className="space-y-3 tablet:space-y-4">
      <Name>StreamVault — Live Catalog</Name>
      {/* Desktop grid */}
      <div className="relative group">
        <ul className="hidden grid-flow-col gap-2 tablet:grid tablet:grid-cols-[repeat(4,1fr)] tala:grid-cols-[repeat(5,1fr)] laptop:grid-cols-[repeat(6,1fr)] desktop:grid-cols-[repeat(8,1fr)]">
          {medias.map((media, index) => (
            <li
              key={media.id}
              className={`
                ${index < 3 ? "" : "hidden"}
                ${index < 4 ? "tablet:block" : "hidden"} 
                ${index < 5 ? "tala:block" : "hidden"} 
                ${index < 6 ? "laptop:block" : "hidden"}  
                ${index < 8 ? "desktop:block" : "hidden"} 
                relative`}
            >
              <Card media={media} />
            </li>
          ))}
        </ul>
      </div>
      {/* Mobile scroll */}
      <ul className="flex gap-1 overflow-x-scroll scrollbar-hide tablet:hidden">
        {medias.map((media) => (
          <li key={media.id}>
            <Card media={media} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StreamVaultCatalog;
