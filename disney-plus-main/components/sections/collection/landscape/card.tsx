import Image from "next/image";
import Link from "next/link";
import humanizeRuntime from "../../../../helpers/humanize-runtime";
import api from "../../../../library/api";
import type { Media } from "../../../../types";

type Props = {
  media: Media;
  isOnlyGrid: boolean;
};

const Card = async ({ media, isOnlyGrid }: Props) => {
  const type = media.type || "movies";
  const id = media.id;
  const measure = await api.get.media.measure({ type, id });

  const backdrop = media.image?.backdrop || media.image?.poster;
  const imageSrc = !backdrop
    ? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80"
    : backdrop.startsWith("http")
    ? backdrop
    : `https://image.tmdb.org/t/p/w500${backdrop}`;

  return (
    <>
      <li className={`${isOnlyGrid ? "hidden" : "tablet:hidden"} `}>
        <Link
          href={`/${media.type || "movies"}/${media.id}`}
          className="group flex items-center gap-3 p-1 rounded-xl hover:bg-slate-900/60 transition-colors"
        >
          <div className="relative aspect-video w-32 flex-none overflow-hidden rounded-lg border border-slate-800">
            <div className="absolute inset-0 animate-pulse bg-slate-800/40" />
            <Image
              src={imageSrc}
              alt={media.title || "Backdrop"}
              fill
              sizes="500px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-100 truncate">{media.title}</p>
            <p className="text-[11px] font-medium text-slate-400">
              {media.releasedAt?.slice(0, 4) || "New"} • {type === "movies" ? humanizeRuntime(measure) : `${measure || 1} Seasons`}
            </p>
          </div>
        </Link>
      </li>
      <li className={`${isOnlyGrid ? "" : "hidden"} tablet:block`}>
        <Link
          href={`/${media.type || "movies"}/${media.id}`}
          className="group block space-y-2.5 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900 shadow-md transition-all duration-300 group-hover:border-slate-500/80 group-hover:shadow-xl group-hover:shadow-black/70">
            <div className="absolute inset-0 animate-pulse bg-slate-800/40" />
            <Image
              src={imageSrc}
              alt={media.title || "Backdrop"}
              fill
              sizes="500px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="relative z-10 pr-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
              {media.title}
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              {media.releasedAt?.slice(0, 4) || "New"} • {type === "movies" ? humanizeRuntime(measure) : `${measure || 1} Seasons`}
            </p>
          </div>
        </Link>
      </li>
    </>
  );
};

export default Card;
