import { useState, useEffect } from 'react';
import Button from './Button';

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTweet: (content: string) => void;
}

export default function TweetModal({ isOpen, onClose, onTweet }: TweetModalProps) {
  const [content, setContent] = useState('');
  const charLimit = 280;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.length <= charLimit) {
      onTweet(content);
      setContent('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const remainingChars = charLimit - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <>
      {/* Overlay avec opacité */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-0 md:top-[15%] inset-x-0 md:left-1/2 md:-translate-x-1/2 z-50 w-full md:max-w-xl md:mx-4">
        <div className="bg-black/95 border-t md:border border-gray-700 md:rounded-xl p-4 relative shadow-xl h-full md:h-auto">
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 left-2 md:top-2 md:right-4 md:left-auto text-gray-400 hover:text-white rounded-full p-2 hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="mt-12 md:mt-8 h-full md:h-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="w-full bg-transparent border-none focus:ring-0 text-white text-xl min-h-[100px] resize-none"
              maxLength={charLimit}
              rows={4}
            />
            
            <div className="flex items-center justify-between mt-4 border-t border-gray-800 pt-4">
              <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                {remainingChars} caractères restants
              </div>
              <Button 
                text="Tweet" 
                type="submit"
                disabled={isOverLimit || content.length === 0}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 