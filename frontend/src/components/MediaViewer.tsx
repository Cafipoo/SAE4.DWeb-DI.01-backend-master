import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: string[];
  initialIndex?: number;
}

export default function MediaViewer({ isOpen, onClose, media, initialIndex = 0 }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Réinitialiser l'index lorsque le composant s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  if (!isOpen || media.length === 0) return null;

  const mediaUrl = `http://localhost:8080/uploads/posts/${media[currentIndex]}`;
  const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov');

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    } else if (e.key === 'ArrowLeft') {
      setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-center items-center" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header avec bouton de fermeture */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <div className="text-white flex items-center">
          <span className="text-sm">{currentIndex + 1} / {media.length}</span>
        </div>
        <Button
          variant="default"
          size="sm"
          rounded="full"
          onClick={onClose}
          className="bg-gray-800/50 hover:bg-gray-700"
        >
          <Icon name="close" className="w-5 h-5" />
        </Button>
      </div>

      {/* Contenu media */}
      <div 
        className="relative max-w-5xl w-full h-full flex justify-center items-center p-12"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video 
            src={mediaUrl} 
            className="max-h-full max-w-full object-contain" 
            controls 
            autoPlay
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="Media content" 
            className="max-h-full max-w-full object-contain" 
          />
        )}
      </div>

      {/* Navigation buttons */}
      {media.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700"
            onClick={handlePrev}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700"
            onClick={handleNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Media thumbnails for navigation */}
      {media.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
          {media.map((item, index) => {
            const thumbUrl = `http://localhost:8080/uploads/posts/${item}`;
            const isThumbVideo = thumbUrl.endsWith('.mp4') || thumbUrl.endsWith('.webm') || thumbUrl.endsWith('.mov');
            
            return (
              <button
                key={index}
                className={`w-16 h-16 flex-shrink-0 border-2 ${
                  index === currentIndex ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              >
                {isThumbVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      src={thumbUrl}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Icon name="play" className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 