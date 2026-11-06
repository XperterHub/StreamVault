import Image from "next/image";
import useAuth from "../../../hooks/use-auth";
import SignOut from "./sign-out";
import Link from "next/link";

const User = async () => {
  const { session } = await useAuth();
  const user = session?.user as any;
  const isVip = user?.tier === "PREMIUM";

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 flex-none overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-200">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session?.user?.name || "Viewer"}
                fill
                priority
                sizes="100px"
                className="object-cover"
              />
            ) : (
              <span>{session?.user?.name?.slice(0, 2).toUpperCase() || "SV"}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-lg sm:text-xl text-white">{session?.user?.name || "Viewer"}</strong>
              {isVip ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  VIP Premium
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Free Member (With Ads)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{session?.user?.email}</p>
          </div>
        </div>
        <SignOut />
      </div>

      {/* Plan Details & Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Stream Quality</span>
          <span className="font-semibold text-slate-100 text-sm">
            {isVip ? "1080p & 4K Ultra-HD" : "720p HD"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Ad-Free Experience</span>
          <span className={`font-semibold text-sm ${isVip ? "text-emerald-400" : "text-slate-300"}`}>
            {isVip ? "Ad-Free Unlocked" : "Standard (With Ads)"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px]">In-App Offline Download</span>
          <span className={`font-semibold text-sm ${isVip ? "text-blue-400" : "text-slate-400"}`}>
            {isVip ? "AES-256 Storage Ready" : "VIP Feature Only"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default User;
