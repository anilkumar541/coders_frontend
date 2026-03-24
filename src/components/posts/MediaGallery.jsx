import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";

function VideoPlayer({ src, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      autoPlay
      loop
      playsInline
      controls
      preload="auto"
    />
  );
}

function CarouselDots({ total, current, onDotClick }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={`rounded-full transition-all duration-300 cursor-pointer ${
            i === current
              ? "w-6 h-2 bg-white"
              : "w-2 h-2 bg-white/50 hover:bg-white/80"
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

function MediaCarousel({ media }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isSwipingHorizontalRef = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, media.length - 1));
    setCurrent(clamped);
    touchDeltaRef.current = 0;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)";
      trackRef.current.style.transform = `translateX(-${clamped * 100}%)`;
    }
  }, [media.length]);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    isSwipingHorizontalRef.current = null;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchDeltaRef.current = 0;
    if (trackRef.current) trackRef.current.style.transition = "none";
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    if (isSwipingHorizontalRef.current === null && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      isSwipingHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY);
    }
    if (!isSwipingHorizontalRef.current) return;
    e.preventDefault();
    touchDeltaRef.current = deltaX;
    if (trackRef.current) {
      const w = trackRef.current.parentElement.offsetWidth;
      trackRef.current.style.transform = `translateX(${-(current * w) + deltaX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (touchDeltaRef.current < -50) goNext();
    else if (touchDeltaRef.current > 50) goPrev();
    else goTo(current);
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    touchDeltaRef.current = 0;
    if (trackRef.current) trackRef.current.style.transition = "none";
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    touchDeltaRef.current = deltaX;
    if (trackRef.current) {
      const w = trackRef.current.parentElement.offsetWidth;
      trackRef.current.style.transform = `translateX(${-(current * w) + deltaX}px)`;
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (touchDeltaRef.current < -50) goNext();
    else if (touchDeltaRef.current > 50) goPrev();
    else goTo(current);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  return (
    <div className="mt-3 -mx-4">
      <div
        className="relative overflow-hidden bg-black rounded-xl select-none"
        onMouseDown={media.length > 1 ? handleMouseDown : undefined}
        onMouseMove={media.length > 1 ? handleMouseMove : undefined}
        onMouseUp={media.length > 1 ? handleMouseUp : undefined}
        onMouseLeave={media.length > 1 ? handleMouseUp : undefined}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="flex"
          style={{ transform: `translateX(-${current * 100}%)`, transition: "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
          onTouchStart={media.length > 1 ? handleTouchStart : undefined}
          onTouchMove={media.length > 1 ? handleTouchMove : undefined}
          onTouchEnd={media.length > 1 ? handleTouchEnd : undefined}
        >
          {media.map((item) => (
            <div
              key={item.id}
              className="w-full shrink-0 flex items-center justify-center bg-black"
              style={{ aspectRatio: "16/9" }}
            >
              {item.media_type === "video" ? (
                <VideoPlayer src={item.cdn_url} className="w-full h-full object-contain" />
              ) : (
                <img
                  src={item.cdn_url}
                  alt=""
                  className="w-full h-full object-contain"
                  loading="lazy"
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>

        {/* Arrow buttons */}
        {media.length > 1 && current > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all z-10 hover:scale-105"
            aria-label="Previous"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>
        )}
        {media.length > 1 && current < media.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all z-10 hover:scale-105"
            aria-label="Next"
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>
        )}

        {/* Counter badge */}
        {media.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {current + 1} / {media.length}
          </div>
        )}

        {/* Dots inside the media */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <CarouselDots total={media.length} current={current} onDotClick={goTo} />
        </div>
      </div>
    </div>
  );
}

function Lightbox({ media, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex);
  const touchStartRef = useRef({ x: 0 });

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, media.length - 1)), [media.length]);
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, goNext, goPrev]);

  const handleTouchStart = (e) => { touchStartRef.current.x = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientX - touchStartRef.current.x;
    if (delta < -60) goNext();
    else if (delta > 60) goPrev();
  };

  const item = media[current];

  return (
    <div
      className="fixed inset-0 bg-black/95 z-100 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={22} className="text-white" />
      </button>
      {current > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10"
          aria-label="Previous"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}
      {current < media.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10"
          aria-label="Next"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}
      <div onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
        {item.media_type === "video" ? (
          <video key={item.id} src={item.cdn_url} className="max-w-full max-h-[85vh] rounded-xl" controls autoPlay />
        ) : (
          <img key={item.id} src={item.cdn_url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        )}
      </div>
      {media.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                i === current ? "border-white w-12 h-12 opacity-100" : "border-transparent w-10 h-10 opacity-50 hover:opacity-80"
              }`}
            >
              {m.media_type === "video" ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play size={12} className="text-white" fill="white" />
                </div>
              ) : (
                <img src={m.cdn_url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
        {current + 1} / {media.length}
      </div>
    </div>
  );
}

export default function MediaGallery({ media }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!media || media.length === 0) return null;

  // Single media
  if (media.length === 1) {
    const item = media[0];
    return (
      <>
        <div className="mt-3 -mx-4 overflow-hidden bg-black rounded-xl">
          {item.media_type === "video" ? (
            <div style={{ aspectRatio: "16/9" }}>
              <VideoPlayer src={item.cdn_url} className="w-full h-full object-contain" />
            </div>
          ) : (
            <img
              src={item.cdn_url}
              alt=""
              className="w-full object-contain max-h-125"
              loading="lazy"
            />
          )}
        </div>

        {lightboxIndex !== null && (
          <Lightbox media={media} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <MediaCarousel media={media} />
      {lightboxIndex !== null && (
        <Lightbox media={media} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
