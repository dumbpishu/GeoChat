import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

type MediaItem = {
  url: string;
  type: "image" | "video" | "audio" | "file";
};

type MediaModalProps = {
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
};

export const MediaModal = ({ media, initialIndex = 0, onClose }: MediaModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  const goNext = () => setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));

  const currentMedia = media[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      {media.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {media.length}
        </div>
      )}

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Media content */}
      <div onClick={(e) => e.stopPropagation()}>
        {currentMedia.type === "image" && (
          <img 
            src={currentMedia.url} 
            alt="attachment" 
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        )}
        
        {currentMedia.type === "video" && (
          <video 
            src={currentMedia.url} 
            controls 
            autoPlay={isPlaying}
            className="max-h-[90vh] max-w-[90vw]"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
        
        {currentMedia.type === "audio" && (
          <div className="p-8 rounded-2xl bg-white/10">
            <audio 
              src={currentMedia.url} 
              controls 
              className="w-[80vw]"
            />
          </div>
        )}
        
        {currentMedia.type === "file" && (
          <a 
            href={currentMedia.url} 
            download 
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            Download File
          </a>
        )}
      </div>
    </div>
  );
};