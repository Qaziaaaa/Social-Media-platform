import { useEffect, useState, useCallback, useRef } from "react";
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
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goNextRef = useRef<() => void>(() => {});
  const goPrevRef = useRef<() => void>(() => {});

  const group = groups[groupIdx];
  const stories = group?.stories ?? [];
  const currentStory = stories[storyIdx];

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
      onClose();
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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" onClick={onClose}>
      <div
        className="relative flex h-full w-full max-w-lg items-center justify-center bg-black md:h-[90vh] md:w-[400px] md:rounded-xl md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
          {stories.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-75"
                style={{
                  width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <img
            src={group.user.avatar ?? "/default-avatar.png"}
            alt={group.user.fullName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white/50"
          />
          <span className="text-sm font-semibold text-white drop-shadow-md">
            {group.user.fullName}
          </span>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/40 p-1 text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/60">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        ) : imgLoaded ? (
          <img
            src={currentStory.mediaUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        <div
          className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); goPrevRef.current(); }}
        />
        <div
          className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); goNextRef.current(); }}
        />
      </div>
    </div>
  );
}
