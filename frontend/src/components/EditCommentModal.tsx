import { useState } from 'react';
import Button from '../ui/Button';
import { PostInteraction } from '../data/data-requests';

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: PostInteraction;
  onEditSuccess: (editedComment: PostInteraction) => void;
}

const EditCommentModal = ({ isOpen, onClose, comment, onEditSuccess }: EditCommentModalProps) => {
  const [editedContent, setEditedContent] = useState<string>(comment.comments || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const updatedComment = { ...comment, comments: editedContent };
      onEditSuccess(updatedComment);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'édition du commentaire:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'édition du commentaire');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold text-white mb-4">Modifier le commentaire</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg resize-none"
              rows={4}
              placeholder="Modifier votre commentaire..."
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
              disabled={!editedContent.trim()}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommentModal; 