import Image from "next/image";
import api from "../../../library/api";
import type { Media } from "../../../types";
import Button from "../../elements/button";
import WatchButton from "./WatchButton";
import convertLanguage from "../../../helpers/convert-language";
import humanizeRuntime from "../../../helpers/humanize-runtime";

type Props = {
  media: Media;
  isMediaSelected: boolean;
};

const Showcase = async ({ media, isMediaSelected }: Props) => {
  const type = media.type || "movies";
  const id = media.id;
  const logo = await api.get.media.logo({ type, id });
  const measure = await api.get.media.measure({ type, id });
  const language = convertLanguage(media.language?.original || "en");

  return (
    <section className="space-y-6 tablet:max-w-xl relative z-10">
      {/* Title / Logo Area */}
      <div className="relative min-h-[90px] tablet:min-h-[140px] flex items-end">
        {logo ? (
          <div
            style={{
              aspectRatio: logo.aspectRatio || "1.84 / 1",
            }}
            className="relative bottom-0 max-h-48 w-full max-w-sm"
          >
            <Image
              src={`https://image.tmdb.org/t/p/w500${logo.image}`}
              alt={media.title || "StreamVault Title"}
              fill
              sizes="500px"
              priority
              className="object-contain object-left"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {media.title || "StreamVault Cinema"}
            </h1>
          </div>
        )}
      </div>

      {/* Details & Badges */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
          <span className="font-semibold text-white">
            {media.releasedAt?.slice(0, 4) || "2026"}
          </span>
          <span>•</span>
          <span>
            {type === "movies" ? humanizeRuntime(measure) : `${measure || 1} Seasons`}
          </span>
          <span>•</span>
          <span className="capitalize">{language?.en.name || "English"}</span>
          <span>•</span>
          <span className="rounded bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 font-semibold text-[11px] text-slate-200">
            {media.isForAdult ? "18+" : "PG-13"}
          </span>
          <span className="rounded bg-blue-950/60 border border-blue-500/40 px-2 py-0.5 font-semibold text-[11px] text-blue-300">
            4K UHD
          </span>
          <span className="rounded bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 font-medium text-[11px] text-slate-300">
            Dolby 5.1
          </span>
        </div>

        {/* Overview */}
        <div className="max-w-lg">
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-3">
            {media.overview || "High definition multi-language streaming with adaptive bitrate and in-app offline download vault."}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-2">
        <WatchButton media={media} isMediaSelected={isMediaSelected} />
        <Button
          variant={{
            name: "primary",
            type: "save",
            isInverted: false,
          }}
        />
      </div>
    </section>
  );
};

export default Showcase;
