import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "@/components/ui/Avatar";
import { AnonymousAvatar } from "@/components/ui/AnonymousAvatar";
import type { StoryGroup } from "@/types";

interface StoryViewerProps {
  groups: StoryGroup[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ groups, initialIndex, onClose }: StoryViewerProps) {
  const [groupIdx, setGroupIdx] = useState(initialIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goNextRef = useRef<() => void>(() => {});
  const goPrevRef = useRef<() => void>(() => {});

  const group = groups[groupIdx];
  const stories = group?.stories ?? [];
  const currentStory = stories[storyIdx];

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!imgLoaded) return;
    clearTimer();
    setProgress(0);
    progressRef.current = 0;
    intervalRef.current = setInterval(() => {
      progressRef.current += 1;
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        clearTimer();
        goNextRef.current();
      }
    }, 50);
    return clearTimer;
  }, [storyIdx, groupIdx, imgLoaded]);

  function goNext() {
    if (storyIdx < stories.length - 1) {
      setStoryIdx((i) => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      setStoryIdx(0);
    } else {
      handleClose();
    }
  }

  function goPrev() {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1);
    } else if (groupIdx > 0) {
      setGroupIdx((i) => i - 1);
      setStoryIdx(groups[groupIdx - 1].stories.length - 1);
    }
  }

  goNextRef.current = goNext;
  goPrevRef.current = goPrev;

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 180);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") goNextRef.current();
      if (e.key === "ArrowLeft") goPrevRef.current();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [storyIdx, groupIdx]);

  useEffect(() => {
    if (!currentStory?.mediaUrl) return;
    setImgLoaded(false);
    setImgError(false);
    const img = new Image();
    let cancelled = false;
    img.onload = () => { if (!cancelled) setImgLoaded(true); };
    img.onerror = () => { if (!cancelled) setImgError(true); };
    if (img.complete) {
      setImgLoaded(true);
    } else {
      img.src = currentStory.mediaUrl;
    }
    return () => { cancelled = true; };
  }, [currentStory?.mediaUrl]);

  if (!currentStory) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
        zIndex: 9999,
        transition: "opacity 220ms ease-out, transform 220ms ease-out",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.96)",
      }}
      onClick={handleClose}
    >
      <div
        className="flex items-center justify-center h-full w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative rounded-xl overflow-hidden bg-black"
          style={{
            width: "min(420px, 90vw)",
            aspectRatio: "9 / 16",
            maxHeight: "min(746px, 90vh)",
          }}
        >
          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 z-30 flex gap-1">
            {stories.map((_, i) => (
              <div key={i} className="h-[2px] flex-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-75"
                  style={{
                    width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {group.user.avatar ? (
                <Avatar
                  src={group.user.avatar}
                  alt={group.user.fullName}
                  size="sm"
                  className="h-8 w-8 ring-2 ring-white/50"
                />
              ) : (
                <AnonymousAvatar size={32} className="ring-2 ring-white/50" />
              )}
              <span className="text-sm font-semibold text-white drop-shadow-md">
                {group.user.fullName}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Media */}
          {imgError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/60 bg-gray-900">
              <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="text-sm">Could not load image</p>
            </div>
          ) : imgLoaded ? (
            <img
              src={currentStory.mediaUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-900">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}

          {/* Tap zones */}
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); goPrevRef.current(); }}
          />
          <div
            className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); goNextRef.current(); }}
          />
        </div>

        {/* Arrow buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrevRef.current(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all opacity-0 md:opacity-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNextRef.current(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all opacity-0 md:opacity-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
