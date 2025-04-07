import { useState } from 'react';
import Button from '../ui/Button';
import { Post, DataRequests } from '../data/data-requests';

interface EditRetweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  retweet: Post;
  onEditSuccess: (editedRetweet: Post) => void;
}

const EditRetweetModal = ({ isOpen, onClose, retweet, onEditSuccess }: EditRetweetModalProps) => {
  const [comment, setComment] = useState(retweet.content || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const editedRetweet = await DataRequests.editRetweet(retweet.id, comment);
      
      // Préserver les informations du tweet original
      const updatedRetweet = {
        ...editedRetweet,
        retweet: retweet.retweet,
        original_post: retweet.original_post,
        retweetContent: retweet.retweetContent,
        retweetMedia: retweet.retweetMedia
      };
      
      onEditSuccess(updatedRetweet);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification du retweet:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la modification du retweet');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Modifier le retweet</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              rows={3}
            />
          </div>
          {error && (
            <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="default"
            >
              Modifier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRetweetModal; 