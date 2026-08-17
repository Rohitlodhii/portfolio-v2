"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconVolumeOff,
  IconMaximize,
  IconMinimize,
  IconLoader2,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

// Utility to extract YouTube video ID
export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface CustomVideoPlayerProps {
  url: string;
  title: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function CustomVideoPlayer({ url, title }: CustomVideoPlayerProps) {
  const videoId = getYouTubeId(url);
  const isYouTube = videoId !== null;

  const playerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // For YouTube iframe replacement
  const videoRef = useRef<HTMLVideoElement>(null); // For HTML5 native video
  const wasPlayingRef = useRef(false);

  const [player, setPlayer] = useState<any>(null); // YouTube Player Instance
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mode 1: Initialize YouTube Player (only if it is a YouTube link)
  useEffect(() => {
    if (!isYouTube || !videoId) return;

    let playerInstance: any = null;

    const initPlayer = () => {
      if (!containerRef.current || !window.YT) return;

      playerInstance = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            const p = event.target;
            setPlayer(p);
            setDuration(p.getDuration());
            setVolume(p.getVolume());
            setIsMuted(p.isMuted());
            setIsReady(true);
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            setIsPlaying(state === 1);
            setIsBuffering(state === 3);

            if (state === 0) {
              setIsPlaying(false);
              setCurrentTime(0);
            }

            if (state === 1 || state === 2) {
              setDuration(event.target.getDuration());
            }
          },
        },
      });
    };

    const handleAPIReady = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("youtube-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        handleAPIReady();
      };

      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          handleAPIReady();
        }
      }, 100);

      return () => {
        clearInterval(interval);
        if (playerInstance) {
          playerInstance.destroy();
        }
      };
    }

    return () => {
      if (playerInstance) {
        playerInstance.destroy();
      }
    };
  }, [isYouTube, videoId]);

  // Mode 1: Poll current time for YouTube playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isYouTube && isPlaying && player && !isSeeking) {
      interval = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isYouTube, isPlaying, player, isSeeking]);

  // Mode 2: Handle Native Video volume sync & load initialization
  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      // Direct load metadata might have already fired, check manually
      if (videoRef.current.readyState >= 1) {
        setDuration(videoRef.current.duration);
        setIsReady(true);
      }
    }
  }, [isYouTube]);

  // Handle document fullscreen state updates
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Controls Visibility Timeout
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Unified Playback Controls
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isReady) return;

    if (isYouTube) {
      if (!player) return;
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } else {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Native playback failed:", err);
        });
      }
    }
  };

  // Unified Volume Mute Controls
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isYouTube) {
      if (!player) return;
      if (isMuted) {
        player.unmute();
        setIsMuted(false);
        if (volume === 0) {
          player.setVolume(50);
          setVolume(50);
        }
      } else {
        player.mute();
        setIsMuted(true);
      }
    } else {
      if (!videoRef.current) return;
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && volume === 0) {
        videoRef.current.volume = 0.5;
        setVolume(50);
      }
    }
  };

  // Unified Volume Range Controls
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    if (isYouTube) {
      if (!player) return;
      player.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        player.unmute();
        setIsMuted(false);
      } else if (newVolume === 0 && !isMuted) {
        player.mute();
        setIsMuted(true);
      }
    } else {
      if (!videoRef.current) return;
      videoRef.current.volume = newVolume / 100;
      if (newVolume > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (newVolume === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  // Unified Seek Controls
  const handleSeekStart = () => {
    setIsSeeking(true);
    wasPlayingRef.current = isPlaying;

    if (isYouTube) {
      if (isPlaying && player) {
        player.pauseVideo();
      }
    } else {
      if (isPlaying && videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);

    if (isYouTube) {
      if (player) {
        player.seekTo(time, true);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);

    if (isYouTube) {
      if (player && wasPlayingRef.current) {
        player.playVideo();
      }
    } else {
      if (videoRef.current && wasPlayingRef.current) {
        videoRef.current.play().catch((err) => {
          console.error("Native video resume failed:", err);
        });
      }
    }
  };

  // Fullscreen Toggler
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Native HTML5 Video Specific Events
  const handleTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsReady(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Time formatter
  function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const formattedSeconds = s < 10 ? `0${s}` : s;
    if (h > 0) {
      const formattedMinutes = m < 10 ? `0${m}` : m;
      return `${h}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${m}:${formattedSeconds}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={playerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 group transition-all duration-300 ${
        isFullscreen ? "rounded-none w-screen h-screen" : ""
      }`}
    >
      {/* Video Content Layer */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {isYouTube ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:pointer-events-none">
            <div ref={containerRef} className="w-full h-full" />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={url}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            className="w-full h-full object-cover cursor-pointer"
          />
        )}
      </div>

      {/* Click Overlay (Play/Pause trigger and Double-Click Fullscreen) */}
      <div
        onClick={() => togglePlay()}
        onDoubleClick={toggleFullscreen}
        className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
      >
        {/* Buffering/Loading State */}
        <AnimatePresence>
          {isBuffering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-black/60 backdrop-blur-md p-4 rounded-full text-white"
            >
              <IconLoader2 className="size-8 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Large Play Button Overlay */}
        <AnimatePresence>
          {!isPlaying && !isBuffering && isReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-center text-white backdrop-blur-xl"
            >
              <p className="text-2xl font-medium tracking-tight">{title}</p>
              <p className="text-sm text-muted-foreground">Click to play</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 p-4 pt-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex flex-col gap-3 select-none pointer-events-auto ${
          showControls ? "opacity-100" : "opacity-0 cursor-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Timeline Slider */}
        <div className="relative group/timeline w-full h-3 flex items-center cursor-pointer">
          {/* Background Track */}
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/20 group-hover/timeline:h-2 transition-all duration-150" />
          {/* Progress Track */}
          <div
            className="absolute left-0 h-1.5 rounded-full bg-white group-hover/timeline:h-2 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          {/* Invisible range input for interactive seeking */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Control Bar Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <IconPlayerPause className="size-5 fill-white" />
              ) : (
                <IconPlayerPlay className="size-5 fill-white" />
              )}
            </button>

            {/* Time display */}
            <div className="text-xs sm:text-sm font-medium text-white/90 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/50">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-1 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <IconVolumeOff className="size-5" />
                ) : volume < 30 ? (
                  <IconVolume3 className="size-5" />
                ) : volume < 70 ? (
                  <IconVolume2 className="size-5" />
                ) : (
                  <IconVolume className="size-5" />
                )}
              </button>
              <div className="w-0 opacity-0 overflow-hidden group-hover/volume:w-16 group-hover/volume:opacity-100 group-hover/volume:ml-1 transition-all duration-300 ease-out flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 rounded-full appearance-none bg-white/20 cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white cursor-pointer"
            >
              {isFullscreen ? (
                <IconMinimize className="size-5" />
              ) : (
                <IconMaximize className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
