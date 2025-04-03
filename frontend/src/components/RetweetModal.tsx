import { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface RetweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetweet: (comment?: string) => void;
  postContent: string;
  authorName: string;
  authorUsername: string;
}

const RetweetModal = ({ 
  isOpen, 
  onClose, 
  onRetweet, 
  postContent,
  authorName,
  authorUsername
}: RetweetModalProps) => {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Retweeter</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-bold">{authorName}</span>
            <span className="text-gray-400">@{authorUsername}</span>
          </div>
          <p className="text-white">{postContent}</p>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full p-3 bg-gray-800 text-white rounded-lg resize-none mb-4"
          rows={3}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={() => onRetweet(comment)}
          >
            Retweeter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RetweetModal; 