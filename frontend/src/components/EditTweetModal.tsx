import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { DataRequests, Post } from '../data/data-requests';

interface EditTweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onEditSuccess?: (editedPost: Post) => void;
}

export default function EditTweetModal({ isOpen, onClose, post, onEditSuccess }: EditTweetModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingMediaToKeep, setExistingMediaToKeep] = useState<number[]>([]);
  const charLimit = 280;
  const maxImages = 4; // Limite maximale d'images

  // Initialiser les états avec les données du post existant
  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content);
      
      // Initialiser les médias existants
      if (post.media && post.media.length > 0) {
        // Créer des URLs de prévisualisation pour les médias existants
        const mediaUrls = post.media.map(media => 
          `http://localhost:8080/uploads/posts/${media}`
        );
        setImagePreviewUrls(mediaUrls);
        
        // Par défaut, garder tous les médias existants
        const indices = Array.from({ length: post.media.length }, (_, i) => i);
        setExistingMediaToKeep(indices);
      }
    }
  }, [isOpen, post]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Réinitialiser les états quand le modal se ferme
      setContent('');
      setError(null);
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setExistingMediaToKeep([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Vérifier si le nombre total d'images ne dépasse pas la limite
    if (existingMediaToKeep.length + selectedImages.length + files.length > maxImages) {
      setError(`Vous ne pouvez pas sélectionner plus de ${maxImages} médias en tout`);
      return;
    }

    // Ajouter les nouvelles images
    setSelectedImages(prev => [...prev, ...files]);
    
    // Créer les URLs de prévisualisation
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Pour les médias existants, on les retire de la liste à conserver
      setExistingMediaToKeep(prev => prev.filter(i => i !== index));
      
      // On retire aussi l'URL de prévisualisation
      setImagePreviewUrls(prev => {
        const newUrls = [...prev];
        newUrls.splice(index, 1);
        return newUrls;
      });
    } else {
      // Pour les nouvelles images
      const adjustedIndex = index - (post.media?.length || 0) + existingMediaToKeep.length;
      setSelectedImages(prev => prev.filter((_, i) => i !== adjustedIndex));
      
      // On retire aussi l'URL de prévisualisation
      setImagePreviewUrls(prev => {
        const newUrls = [...prev];
        newUrls.splice(index, 1);
        URL.revokeObjectURL(prev[index]); // Libérer la mémoire
        return newUrls;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > charLimit) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const editedPost = await DataRequests.updatePost(
        post.id,
        content,
        existingMediaToKeep,
        selectedImages
      );
      
      // Réinitialiser le formulaire
      setContent('');
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setExistingMediaToKeep([]);
      
      // Fermer le modal
      onClose();
      
      // Notifier le parent que le post a été modifié
      if (onEditSuccess) {
        onEditSuccess(editedPost);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const remainingChars = charLimit - content.length;
  const isOverLimit = remainingChars < 0;
  const isSubmitDisabled = isOverLimit || content.length === 0 || isSubmitting;
  
  // Calculer le nombre total de médias
  const totalMediaCount = existingMediaToKeep.length + selectedImages.length;

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
            <h2 className="text-xl font-bold text-white mb-4">Modifier votre tweet</h2>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="w-full bg-transparent border-none focus:ring-0 text-white text-xl min-h-[100px] resize-none"
              maxLength={charLimit}
              rows={4}
              disabled={isSubmitting}
            />
            
            {/* Zone de prévisualisation des médias */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {imagePreviewUrls.map((url, index) => {
                  const isExistingMedia = index < (post.media?.length || 0);
                  const isKeeping = isExistingMedia ? existingMediaToKeep.includes(index) : true;
                  
                  if (!isKeeping) return null;
                  
                  return (
                    <div key={index} className="relative group">
                      {url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') ? (
                        <video
                          src={url}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                          muted
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index, isExistingMedia)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Input pour les médias */}
            <div className="mt-4">
              <input
                type="file"
                name="images"
                accept="image/*,video/*"
                multiple
                onChange={handleImageChange}
                className="w-full h-20 rounded-lg border border-gray-700 text-white"
                disabled={totalMediaCount >= maxImages}
              />
              <p className="text-sm text-gray-400 mt-1">
                {totalMediaCount}/{maxImages} médias sélectionnés
              </p>
            </div>

            {error && (
              <div className="mt-2 text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex items-center justify-between mt-4 border-t border-gray-800 pt-4">
              <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                {remainingChars} caractères restants
              </div>
              <Button 
                variant="default" 
                rounded="full" 
                size="lg" 
                type="submit"
                disabled={isSubmitDisabled}
              >
                Modifier
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 