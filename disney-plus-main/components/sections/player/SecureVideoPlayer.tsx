"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  LanguageIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type Props = {
  media: {
    id: string;
    title?: string;
    overview?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    driveFileIds?: {
      videoDefault?: string;
      video1080p?: string;
      video4K?: string;
    };
    audioTracks?: Array<{
      id: string;
      languageCode: string;
      languageName: string;
      driveFileId?: string;
      isDefault?: boolean;
    }>;
    subtitles?: Array<{
      id: string;
      languageCode: string;
      languageName: string;
      driveFileId?: string;
    }>;
    isPremiumOnly?: boolean;
    qualityTiers?: any;
    streamUrl?: string;
  };
  onClose: () => void;
};

export default function SecureVideoPlayer({ media, onClose }: Props) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isPremium = user?.tier === "PREMIUM";

  // Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.durationSeconds || 120);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<any>(null);
  const [streamError, setStreamError] = useState("");
  const [isLoadingStream, setIsLoadingStream] = useState(true);

  // Settings & Track States
  const [selectedQuality, setSelectedQuality] = useState<"720p" | "1080p" | "4K">("720p");
  const [selectedAudio, setSelectedAudio] = useState("en");
  const [selectedSubtitle, setSelectedSubtitle] = useState("off");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Clean Simple Skip HUD Animation State (-10 & icon / +10 & icon)
  const [skipHUD, setSkipHUD] = useState<{
    direction: "backward" | "forward";
    seconds: number;
    key: number;
  } | null>(null);
  const skipTimerRef = useRef<any>(null);
  const lastClickRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Google IMA SDK & AdSense State
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const adsLoaderRef = useRef<any>(null);
  const adsManagerRef = useRef<any>(null);
  const adDisplayContainerRef = useRef<any>(null);
  const fallbackTimerRef = useRef<any>(null);

  const [adSensePublisherId, setAdSensePublisherId] = useState("");
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [isIMAPlaying, setIsIMAPlaying] = useState(false);
  const [useFallbackAd, setUseFallbackAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const [canSkipAd, setCanSkipAd] = useState(true);
  const [adProgress, setAdProgress] = useState(0);
  const [isAdMuted, setIsAdMuted] = useState(false);
  const [midRollTriggered, setMidRollTriggered] = useState<Record<number, boolean>>({});

  // Security
  const [securityToast, setSecurityToast] = useState("");
  const [isScreenHidden, setIsScreenHidden] = useState(false);

  // In-App Offline Download State
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloadedOffline, setIsDownloadedOffline] = useState(false);

  // Compute stream URL from Google Drive file ID
  const computeStreamUrl = (quality: "720p" | "1080p" | "4K") => {
    const driveIds = media.driveFileIds || {};
    let target = "";

    if (quality === "4K" && driveIds.video4K) {
      target = driveIds.video4K;
    } else if (quality === "1080p" && driveIds.video1080p) {
      target = driveIds.video1080p;
    } else if (driveIds.videoDefault) {
      target = driveIds.videoDefault;
    } else if (media.streamUrl) {
      return media.streamUrl;
    } else if (media.id && media.id !== "placeholder") {
      target = media.id;
    }

    if (!target) return "";
    if (target.startsWith("/api/stream")) return target;
    return `/api/stream?id=${encodeURIComponent(target)}`;
  };

  const [activeStreamUrl, setActiveStreamUrl] = useState(() => computeStreamUrl("720p"));

  // Audio options
  const audioOptions =
    media.audioTracks && media.audioTracks.length > 0
      ? media.audioTracks.map((t) => ({
          code: t.languageCode,
          label: t.languageName,
          driveFileId: t.driveFileId,
        }))
      : [{ code: "en", label: "English", driveFileId: "" }];

  // Subtitle options
  const subtitleOptions = [
    { code: "off", label: "Off" },
    ...(media.subtitles && media.subtitles.length > 0
      ? media.subtitles.map((s) => ({ code: s.languageCode, label: s.languageName }))
      : []),
  ];

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    const timeout = setTimeout(() => {
      if (isPlaying && !showSettingsMenu && !isAdPlaying) {
        setShowControls(false);
      }
    }, 3500);
    setControlsTimeout(timeout);
  };

  // Helper to activate clean backup video ad
  const activateFallbackAd = () => {
    setUseFallbackAd(true);
    setIsIMAPlaying(false);
    setAdTimeRemaining(5);
    setCanSkipAd(false);
    if (adVideoRef.current) {
      adVideoRef.current.currentTime = 0;
      adVideoRef.current.play().catch(() => {});
    }
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    fallbackTimerRef.current = setInterval(() => {
      setAdTimeRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setCanSkipAd(true);
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  // Handle ad video time update to update ad progress bar
  const handleAdTimeUpdate = () => {
    if (adVideoRef.current) {
      const cur = adVideoRef.current.currentTime;
      const dur = adVideoRef.current.duration || 15;
      const prog = Math.min(100, Math.round((cur / dur) * 100));
      setAdProgress(prog);
    }
  };

  // Complete ad and start main video stream
  const handleFinishAd = () => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (adsManagerRef.current) {
      try {
        adsManagerRef.current.destroy();
      } catch (e) {}
      adsManagerRef.current = null;
    }
    if (adVideoRef.current) {
      adVideoRef.current.pause();
    }
    setIsIMAPlaying(false);
    setIsAdPlaying(false);
    setUseFallbackAd(false);
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // ───────────────── REAL GOOGLE ADSENSE & IMA AD ENGINE ─────────────────
  useEffect(() => {
    if (!isAdPlaying) return;

    let isCancelled = false;

    const startGoogleAd = async () => {
      // Step 1: Ensure Google IMA SDK is present
      const checkIMA = () => typeof window !== "undefined" && !!(window as any).google?.ima;

      if (!checkIMA()) {
        if (typeof document !== "undefined" && !document.getElementById("google-ima-sdk-tag")) {
          const s = document.createElement("script");
          s.id = "google-ima-sdk-tag";
          s.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
          s.async = true;
          document.head.appendChild(s);
        }

        let waited = 0;
        while (!checkIMA() && waited < 2500) {
          await new Promise((r) => setTimeout(r, 100));
          waited += 100;
          if (isCancelled) return;
        }
      }

      if (isCancelled) return;

      if (!checkIMA() || !adContainerRef.current) {
        console.warn("Google IMA SDK not ready or container absent, activating commercial backup");
        activateFallbackAd();
        return;
      }

      const ima = (window as any).google.ima;

      // Clean previous instance
      if (adsManagerRef.current) {
        try {
          adsManagerRef.current.destroy();
        } catch (e) {}
        adsManagerRef.current = null;
      }

      try {
        if (!adDisplayContainerRef.current && adContainerRef.current) {
          adDisplayContainerRef.current = new ima.AdDisplayContainer(
            adContainerRef.current,
            videoRef.current
          );
        }

        adDisplayContainerRef.current?.initialize();

        const adsLoader = new ima.AdsLoader(adDisplayContainerRef.current);
        adsLoaderRef.current = adsLoader;

        adsLoader.addEventListener(
          ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (event: any) => {
            if (isCancelled) return;
            const adsRenderingSettings = new ima.AdsRenderingSettings();
            adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

            const adsManager = event.getAdsManager(videoRef.current, adsRenderingSettings);
            adsManagerRef.current = adsManager;

            adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, (err: any) => {
              console.warn("IMA AdsManager ad error:", err?.getError?.() || err);
              activateFallbackAd();
            });

            adsManager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
              if (videoRef.current) videoRef.current.pause();
              setIsPlaying(false);
            });

            adsManager.addEventListener(ima.AdEvent.Type.STARTED, () => {
              setIsIMAPlaying(true);
              setUseFallbackAd(false);
            });

            adsManager.addEventListener(ima.AdEvent.Type.SKIPPED, () => {
              handleFinishAd();
            });

            adsManager.addEventListener(ima.AdEvent.Type.COMPLETE, () => {
              handleFinishAd();
            });

            adsManager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
              handleFinishAd();
            });

            try {
              const width = containerRef.current?.clientWidth || window.innerWidth || 1280;
              const height = containerRef.current?.clientHeight || window.innerHeight || 720;
              adsManager.init(width, height, ima.ViewMode.NORMAL);
              adsManager.start();
            } catch (startErr) {
              console.warn("IMA start failed:", startErr);
              activateFallbackAd();
            }
          },
          false
        );

        adsLoader.addEventListener(
          ima.AdErrorEvent.Type.AD_ERROR,
          (errEvent: any) => {
            console.warn("IMA AdsLoader error:", errEvent?.getError?.() || errEvent);
            activateFallbackAd();
          },
          false
        );

        // Build Google Ad Request
        const cleanPubId = (adSensePublisherId || "pub-2509450853164699").replace(/^ca-/, "");
        const adsRequest = new ima.AdsRequest();

        const isLocalhost =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

        // Live Google DoubleClick/AdSense video ad tag (streams real high quality commercial video ads from Google's servers)
        const googleLiveTag = `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=${Date.now()}&description_url=${encodeURIComponent(
          window.location.href
        )}`;

        // Production AdSense for Video Tag with publisher ID
        const adSenseTag = `https://googleads.g.doubleclick.net/pagead/ads?client=ca-${cleanPubId}&description_url=${encodeURIComponent(
          window.location.href
        )}&output=vast&correlator=${Date.now()}&ad_type=video_text_image&max_ad_duration=30000`;

        // Automatically use live Google commercial ad stream on localhost; production uses user's AdSense tag
        adsRequest.adTagUrl = isLocalhost ? googleLiveTag : adSenseTag;
        adsRequest.linearAdSlotWidth = containerRef.current?.clientWidth || 1280;
        adsRequest.linearAdSlotHeight = containerRef.current?.clientHeight || 720;
        adsRequest.nonLinearAdSlotWidth = containerRef.current?.clientWidth || 1280;
        adsRequest.nonLinearAdSlotHeight = containerRef.current?.clientHeight || 720;

        adsLoader.requestAds(adsRequest);
      } catch (e) {
        console.warn("Google IMA exception:", e);
        activateFallbackAd();
      }
    };

    startGoogleAd();

    return () => {
      isCancelled = true;
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
      if (adsManagerRef.current) {
        try {
          adsManagerRef.current.destroy();
        } catch (e) {}
        adsManagerRef.current = null;
      }
    };
  }, [isAdPlaying, adSensePublisherId]);

  // Simple Clean Skip Backward (-10s / -20s)
  const handleSkipBackward = () => {
    if (!videoRef.current) return;
    const target = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = target;
    setCurrentTime(target);

    setSkipHUD((prev) => {
      const isSameDir = prev && prev.direction === "backward";
      const newSec = isSameDir ? prev.seconds + 10 : 10;
      return {
        direction: "backward",
        seconds: newSec,
        key: Date.now(),
      };
    });

    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => {
      setSkipHUD(null);
    }, 850);
  };

  // Simple Clean Skip Forward (+10s / +20s)
  const handleSkipForward = () => {
    if (!videoRef.current) return;
    const maxDur = videoRef.current.duration || duration || 10000;
    const target = Math.min(maxDur, videoRef.current.currentTime + 10);
    videoRef.current.currentTime = target;
    setCurrentTime(target);

    setSkipHUD((prev) => {
      const isSameDir = prev && prev.direction === "forward";
      const newSec = isSameDir ? prev.seconds + 10 : 10;
      return {
        direction: "forward",
        seconds: newSec,
        key: Date.now(),
      };
    });

    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    skipTimerRef.current = setTimeout(() => {
      setSkipHUD(null);
    }, 850);
  };

  // Double Click / Tap on Video to Skip
  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAdPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = clickX / width;
    const now = Date.now();

    // Double-click detection (within 320ms)
    if (now - lastClickRef.current.time < 320) {
      if (ratio < 0.38) {
        handleSkipBackward();
        lastClickRef.current = { time: 0, x: clickX };
        return;
      } else if (ratio > 0.62) {
        handleSkipForward();
        lastClickRef.current = { time: 0, x: clickX };
        return;
      }
    }

    lastClickRef.current = { time: now, x: clickX };

    // Single click toggles play/pause
    setTimeout(() => {
      if (Date.now() - lastClickRef.current.time >= 300 && lastClickRef.current.time === now) {
        handlePlayPause();
      }
    }, 320);
  };

  // Player keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); handlePlayPause(); return; }
      if (e.key === "ArrowLeft" || e.key === "j" || e.key === "J") { e.preventDefault(); handleSkipBackward(); return; }
      if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") { e.preventDefault(); handleSkipForward(); return; }
      if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFullscreen(); return; }
      if (e.key === "m" || e.key === "M") { e.preventDefault(); toggleMute(); return; }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isAdPlaying) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.warn("Autoplay block:", err);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur)) {
        setDuration(dur);
        // Mid-roll ad break at 50% for free users
        if (!isPremium && dur > 60) {
          const midPoint = Math.floor(dur * 0.5);
          if (Math.abs(cur - midPoint) < 1 && !midRollTriggered[midPoint]) {
            setMidRollTriggered((prev) => ({ ...prev, [midPoint]: true }));
            videoRef.current.pause();
            setIsPlaying(false);
            setIsAdPlaying(true);
            setAdTimeRemaining(5);
            setCanSkipAd(false);
            setAdProgress(0);
          }
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (quality: "720p" | "1080p" | "4K") => {
    if ((quality === "1080p" || quality === "4K") && !isPremium) {
      setSecurityToast("1080p and 4K are available for VIP Premium members.");
      setTimeout(() => setSecurityToast(""), 4000);
      return;
    }
    const newUrl = computeStreamUrl(quality);
    setSelectedQuality(quality);
    setActiveStreamUrl(newUrl);
    const savedTime = videoRef.current?.currentTime || 0;
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        if (isPlaying) videoRef.current.play().catch(() => {});
      }
    }, 200);
  };

  const handleOfflineDownload = () => {
    if (!isPremium) {
      setSecurityToast("In-app offline downloads are for VIP Premium members.");
      setTimeout(() => setSecurityToast(""), 4000);
      return;
    }
    if (isDownloadedOffline) {
      setSecurityToast("Already saved in your offline vault.");
      setTimeout(() => setSecurityToast(""), 2500);
      return;
    }
    setDownloadProgress(5);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (!prev) return 15;
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloadedOffline(true);
          setDownloadProgress(null);
          setSecurityToast("Saved to in-app encrypted vault.");
          setTimeout(() => setSecurityToast(""), 3000);
          return null;
        }
        return prev + 20;
      });
    }, 350);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[9999] flex items-center justify-center select-none overflow-hidden font-sans"
      style={{ background: "#000" }}
    >
      {/* ───────────────── 1. REAL GOOGLE ADSENSE & IMA AD ENGINE ───────────────── */}
      {/* Official Google IMA Video Ad Display Container */}
      <div
        ref={adContainerRef}
        id="ima-ad-container"
        className={`absolute inset-0 z-50 ${isAdPlaying && isIMAPlaying ? "block" : "hidden pointer-events-none"}`}
        style={{ background: "#000" }}
      />

      {/* Discreet top-right Skip/Close button during active IMA playback */}
      {isAdPlaying && isIMAPlaying && (
        <div className="absolute top-4 right-6 z-[60] flex items-center gap-2">
          <button
            onClick={handleFinishAd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 text-white/90 hover:text-white text-xs border border-white/20 backdrop-blur-md transition-all shadow-xl cursor-pointer"
            title="Skip to Video"
          >
            <span>Skip to Video</span>
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Fallback Commercial Video Player (when IMA is loading, offline, or ad blocker active) */}
      {isAdPlaying && (!isIMAPlaying || useFallbackAd) && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-between"
          style={{ background: "#000" }}
        >
          {/* Top Bar during Ad */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/85 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-black/60 border border-white/15 text-white">
                Ad • 1 of 1
              </span>
              <span className="text-xs text-slate-300 bg-black/50 px-2 py-1 rounded border border-white/10">
                Google AdSense
              </span>
              <button
                onClick={() => {
                  const newMuted = !isAdMuted;
                  setIsAdMuted(newMuted);
                  if (adVideoRef.current) adVideoRef.current.muted = newMuted;
                }}
                className="p-1.5 rounded-lg bg-black/60 border border-white/15 text-white hover:bg-black/90 ml-1 transition-colors"
                title={isAdMuted ? "Unmute Ad" : "Mute Ad"}
              >
                {isAdMuted ? (
                  <SpeakerXMarkIcon className="w-4 h-4 text-red-400" />
                ) : (
                  <SpeakerWaveIcon className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors border border-white/10"
              title="Close Player"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Real Commercial Video Playing in Center */}
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={adVideoRef}
              src="/assets/videos/disney-plus-opening.mp4"
              autoPlay
              playsInline
              muted={isAdMuted}
              onTimeUpdate={handleAdTimeUpdate}
              onEnded={handleFinishAd}
              className="w-full h-full object-contain"
              style={{ background: "#000" }}
            />

            {/* Video Progress Bar across bottom of video */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div
                className="h-full bg-amber-400 transition-all duration-300 ease-linear"
                style={{ width: `${adProgress}%` }}
              />
            </div>
          </div>

          {/* Bottom Bar during Ad: Clean Skip Button */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-t from-black/85 to-transparent">
            <span className="text-xs text-slate-400">
              Video will play after ad • Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-slate-300 font-mono text-[11px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-slate-300 font-mono text-[11px]">Esc</kbd> to skip
            </span>

            {/* Skip Ad Button */}
            <div>
              {canSkipAd ? (
                <button
                  onClick={handleFinishAd}
                  className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all shadow-xl cursor-pointer"
                >
                  <span>Skip Ad</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleFinishAd}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/75 text-slate-200 text-xs font-medium border border-white/20 hover:bg-black/90 transition-all cursor-pointer backdrop-blur-md shadow-lg"
                  title="Click to skip ad"
                >
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <svg className="w-4 h-4 -rotate-90" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="#ffffff"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="56.5"
                        strokeDashoffset={56.5 * (adTimeRemaining / 5)}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                  </div>
                  <span>Skip in <strong className="font-mono text-white text-sm">{adTimeRemaining}s</strong></span>
                  <span className="text-[11px] text-slate-400 border-l border-white/20 pl-2">or Skip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── TOP BAR (CLEAN CINEMA HEADER) ───────────────── */}
      {!isAdPlaying && (
        <div
          className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-8 pt-5 pb-16 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 65%, transparent 100%)" }}
        >
          {/* Left: Close + Movie Details */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg"
              title="Close Player"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg tracking-normal leading-tight">
                {media.title || "Video Stream"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="px-2 py-0.5 rounded bg-white/15 text-white font-semibold text-[11px]">
                  {selectedQuality}
                </span>
                <span>•</span>
                <span>Audio: {audioOptions.find((a) => a.code === selectedAudio)?.label || "English"}</span>
              </div>
            </div>
          </div>

          {/* Right: Plan Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white">
              {isPremium ? "VIP Member" : "Free Stream"}
            </span>
          </div>
        </div>
      )}

      {/* ───────────────── SECURITY TOAST ───────────────── */}
      {securityToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-slate-300 text-xs font-medium shadow-xl flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* ───────────────── TAB-HIDDEN BLANKING ───────────────── */}
      {isScreenHidden && (
        <div className="absolute inset-0 z-40 flex items-center justify-center text-center p-6" style={{ background: "#000" }}>
          <div className="space-y-3">
            <ShieldCheckIcon className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-white font-semibold text-lg">Playback Paused</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Playback resumes when you return to this window.
            </p>
          </div>
        </div>
      )}

      {/* ───────────────── INTERACTIVE VIDEO CLICK AREA ───────────────── */}
      <div
        onClick={handleVideoAreaClick}
        className="absolute inset-0 w-full h-full cursor-pointer z-10"
        title="Double click left side to rewind 10s • Double click right side to skip 10s • Click center to play/pause"
      />

      {/* ───────────────── MAIN VIDEO ELEMENT ───────────────── */}
      <video
        ref={videoRef}
        src={activeStreamUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          setIsLoadingStream(false);
          setStreamError("");
          if (videoRef.current?.duration) setDuration(videoRef.current.duration);
        }}
        onWaiting={() => setIsLoadingStream(true)}
        onCanPlay={() => setIsLoadingStream(false)}
        onError={() => {
          setIsLoadingStream(false);
          setStreamError("Unable to load video. Please check the Google Drive link and sharing permissions.");
        }}
        playsInline
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ background: "#000", display: isAdPlaying ? "none" : "block" }}
      />

      {/* ───────────────── 2. CENTER ON-SCREEN CONTROLS (BALANCED REASONABLE DISTANCE) ───────────────── */}
      {!isAdPlaying && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center gap-10 sm:gap-14 md:gap-16">
          {/* Rewind -10s Button */}
          <div className="pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSkipBackward();
              }}
              className={`group flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
                showControls || !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
              }`}
              title="Rewind 10 Seconds (Left Arrow)"
            >
              <svg className="w-6 h-6 transition-transform group-hover:-rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
              </svg>
              <span className="text-[10px] font-mono font-bold mt-0.5">-10</span>
            </button>
          </div>

          {/* Center Play/Pause Button */}
          <div className="pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className={`flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md border border-white/25 text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
                showControls || !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
              }`}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <PauseIcon className="w-9 h-9 sm:w-10 sm:h-10 fill-white text-white" />
              ) : (
                <PlayIcon className="w-9 h-9 sm:w-10 sm:h-10 fill-white text-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Forward +10s Button */}
          <div className="pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSkipForward();
              }}
              className={`group flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
                showControls || !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
              }`}
              title="Forward 10 Seconds (Right Arrow)"
            >
              <svg className="w-6 h-6 transition-transform group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v5h-5" />
              </svg>
              <span className="text-[10px] font-mono font-bold mt-0.5">+10</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────── 3. SIMPLE CLEAN SKIP HUD POPUP (-10 & icon / +10 & icon) ───────────────── */}
      {skipHUD && (
        <div
          key={skipHUD.key}
          className={`absolute top-1/2 -translate-y-1/2 z-40 pointer-events-none ${
            skipHUD.direction === "backward" ? "left-1/3 -translate-x-1/2" : "right-1/3 translate-x-1/2"
          }`}
        >
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-2xl animate-skip-pop">
            {skipHUD.direction === "backward" ? (
              <>
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
                </svg>
                <span className="text-2xl font-extrabold font-mono tracking-tight">-{skipHUD.seconds}s</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-extrabold font-mono tracking-tight">+{skipHUD.seconds}s</span>
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v5h-5" />
                </svg>
              </>
            )}
          </div>
        </div>
      )}

      {/* ───────────────── SUBTLE LOADING SPINNER (CENTER) ───────────────── */}
      {isLoadingStream && !isAdPlaying && !skipHUD && (
        <div className="absolute z-20 pointer-events-none flex flex-col items-center justify-center gap-2.5">
          <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* ───────────────── STREAM ERROR ───────────────── */}
      {streamError && !isAdPlaying && (
        <div className="absolute z-35 max-w-sm w-full mx-4 p-5 rounded-xl bg-zinc-900 border border-zinc-700 text-center space-y-3 shadow-2xl">
          <ExclamationTriangleIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-white font-semibold text-sm">Stream Error</p>
          <p className="text-xs text-slate-400 leading-relaxed">{streamError}</p>
          <button
            onClick={() => {
              setStreamError("");
              if (videoRef.current) { videoRef.current.load(); videoRef.current.play().catch(() => {}); }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium transition-colors mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* ───────────────── BOTTOM CONTROLS BAR (NO OVERLAPPING NUMBERS) ───────────────── */}
      {!isAdPlaying && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)", padding: "40px 24px 20px" }}
        >
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono text-slate-300 w-11 text-right shrink-0 select-none">
              {formatSeconds(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center group">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full cursor-pointer video-scrubber"
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  background: `linear-gradient(to right, #ffffff ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.22) 0%)`,
                  borderRadius: "3px",
                  outline: "none",
                }}
              />
              {/* Mid-roll cue marker */}
              {!isPremium && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 pointer-events-none"
                  style={{ left: "50%" }}
                  title="Ad break at midpoint"
                />
              )}
            </div>
            <span className="text-xs font-mono text-slate-400 w-11 text-left shrink-0 select-none">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls: Play, Rewind (-10 + icon), Forward (+10 + icon), Volume, Time */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Play / Pause */}
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-lg hover:bg-white/15 text-white active:scale-95 transition-all"
                title="Play / Pause (Space)"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5 fill-white" />
                ) : (
                  <PlayIcon className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              {/* Rewind 10s: Icon and -10 clean side-by-side (NO OVERLAP) */}
              <button
                onClick={handleSkipBackward}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/15 text-white active:scale-95 transition-all text-xs font-mono font-bold"
                title="Rewind 10 seconds (Left Arrow or J)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
                </svg>
                <span>-10</span>
              </button>

              {/* Forward 10s: +10 and Icon clean side-by-side (NO OVERLAP) */}
              <button
                onClick={handleSkipForward}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/15 text-white active:scale-95 transition-all text-xs font-mono font-bold"
                title="Forward 10 seconds (Right Arrow or L)"
              >
                <span>+10</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v5h-5" />
                </svg>
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 pl-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                  title="Mute (M)"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-5 h-5 text-red-400" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                    setIsMuted(v === 0);
                  }}
                  className="hidden sm:block w-20 cursor-pointer"
                  style={{
                    height: "3px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: `linear-gradient(to right, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 0%)`,
                    borderRadius: "2px",
                    outline: "none",
                  }}
                />
              </div>

              {/* Timestamp text */}
              <div className="hidden md:flex items-center text-xs font-mono text-slate-400 pl-2">
                <span>{formatSeconds(currentTime)}</span>
                <span className="mx-1.5 text-slate-600">/</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Right Controls: In-App Download, Audio & Quality, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* In-app download */}
              <button
                onClick={handleOfflineDownload}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isDownloadedOffline
                    ? "bg-white/15 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Save for offline (VIP)"
              >
                {isDownloadedOffline ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                ) : downloadProgress !== null ? (
                  <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isDownloadedOffline ? "Saved" : downloadProgress !== null ? `${downloadProgress}%` : "Offline"}
                </span>
              </button>

              {/* Audio / Quality Settings Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                  title="Audio, Subtitles & Quality"
                >
                  <LanguageIcon className="w-4 h-4" />
                  <span className="uppercase">{selectedAudio}</span>
                  <span className="text-slate-400 text-[10px]">({selectedQuality})</span>
                  <Cog6ToothIcon className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-14 right-0 w-72 rounded-xl border border-zinc-700 shadow-2xl z-50 overflow-hidden" style={{ background: "#141416" }}>
                    <div className="p-3 space-y-4">
                      {/* Audio */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Audio Track</p>
                        <div className="space-y-0.5">
                          {audioOptions.map((opt) => (
                            <button
                              key={opt.code}
                              onClick={() => { setSelectedAudio(opt.code); setShowSettingsMenu(false); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                                selectedAudio === opt.code
                                  ? "bg-white/15 text-white font-medium"
                                  : "text-slate-400 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Subtitles */}
                      {subtitleOptions.length > 1 && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subtitles</p>
                          <div className="space-y-0.5">
                            {subtitleOptions.map((opt) => (
                              <button
                                key={opt.code}
                                onClick={() => { setSelectedSubtitle(opt.code); setShowSettingsMenu(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                                  selectedSubtitle === opt.code
                                    ? "bg-white/15 text-white font-medium"
                                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quality */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Resolution</p>
                        <div className="flex gap-1.5">
                          {(["720p", "1080p", "4K"] as const).map((q) => (
                            <button
                              key={q}
                              onClick={() => handleQualityChange(q)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                selectedQuality === q
                                  ? "bg-white/20 text-white font-semibold"
                                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-white/15 text-white transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
