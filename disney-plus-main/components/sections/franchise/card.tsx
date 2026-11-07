import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  image: string;
  video: string;
};

const Card = ({ image, video, name }: Props) => {
  return (
    <li>
      <Link
        href={`/originals/${name}`}
        className="group relative grid aspect-video cursor-pointer items-center overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-lg shadow-black/50 transition-all duration-300 ease-out hover:scale-[1.04] hover:border-slate-500/80 hover:shadow-xl hover:shadow-black/70"
      >
        <div className="pointer-events-none relative z-20 mx-auto h-3/5 w-3/5 transition-transform duration-300 group-hover:scale-105">
          <Image
            src={`/assets/images/${image}.png`}
            fill
            sizes="500px"
            alt={name}
            className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
            priority
          />
        </div>
        {/* Subtle dark overlay that reveals video on hover */}
        <div className="absolute inset-0 z-10 bg-slate-900/60 transition-opacity duration-300 group-hover:opacity-0" />
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={`/assets/videos/${video}.mp4`} type="video/mp4" />
        </video>
      </Link>
    </li>
  );
};

export default Card;
