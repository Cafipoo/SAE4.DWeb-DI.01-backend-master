import Button from '../ui/Button';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal = ({ isOpen, onClose, onConfirm }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-black/90 border border-gray-700 rounded-xl p-4 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Supprimer le tweet ?</h2>
        <p className="text-gray-400 mb-6">
          Cette action est irréversible et le tweet sera supprimé de votre profil, êtes vous sur de vouloir le supprimer ?
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="default"
            size="lg"
            rounded="full"
            onClick={onConfirm}
            className="w-full"
          >
            Supprimer
          </Button>
          <Button
            variant="secondary"
            size="lg"
            rounded="full"
            onClick={onClose}
            className="w-full"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
