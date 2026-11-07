import Image from "next/image";
import Link from "next/link";
import type { Media } from "../../../../types";

type Props = {
  media: Media;
};

const Card = ({ media }: Props) => {
  const poster = media.image?.poster;
  const imageSrc = !poster
    ? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80"
    : poster.startsWith("http")
    ? poster
    : `https://image.tmdb.org/t/p/w500${poster}`;

  return (
    <Link
      href={`/${media.type || "movies"}/${media.id}`}
      className="group relative block aspect-[2/3] w-32 sm:w-36 md:w-44 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900 shadow-md transition-all duration-300 ease-out hover:scale-[1.04] hover:border-slate-500/80 hover:shadow-2xl hover:shadow-black/70 cursor-pointer"
    >
      <div className="absolute inset-0 bg-slate-800/30 animate-pulse" />
      <Image
        src={imageSrc}
        fill
        sizes="350px"
        alt={media.title || "Movie poster"}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Subtle bottom gradient scrim with title on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-2.5">
        <p className="text-[11px] font-semibold text-white line-clamp-2 drop-shadow-md">
          {media.title}
        </p>
      </div>
    </Link>
  );
};

export default Card;
