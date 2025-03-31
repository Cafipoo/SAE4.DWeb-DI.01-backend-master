import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { DataRequests } from "../data/data-requests";

interface ProfileUpdateProps {
    username: string;
    initialData: {
        name: string;
        username: string;
        bio: string | null;
        location: string | null;
        siteWeb: string | null;
        cover: File | null;
        avatar: File | null;
    };
    onUpdate: () => void;
}

const ProfileUpdate = ({ username, initialData, onUpdate }: ProfileUpdateProps) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        username: initialData.username || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        siteWeb: initialData.siteWeb || '',
        cover: initialData.cover || null,
        avatar: initialData.avatar || null
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('username', formData.username);
            formDataToSend.append('bio', formData.bio || '');
            formDataToSend.append('location', formData.location || '');
            formDataToSend.append('siteWeb', formData.siteWeb || '');
            
            if (formData.avatar instanceof File) {
                formDataToSend.append('avatar', formData.avatar);
            }
            if (formData.cover instanceof File) {
                formDataToSend.append('cover', formData.cover);
            }

            await DataRequests.updateUserProfile(username, formDataToSend);
            onUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-4 mt-2">
            <div className="mb-4">
                <label className="block text-white text-lg mb-2">
                    Modifier le profil
                </label>
            </div>
            
            <div className="flex flex-col gap-4 justify-between text-gray-400 text-sm">
                <Input
                    type="text"
                    placeholder="Nom"
                    value={formData.name}
                    onChange={handleChange}
                    name="name"
                />
                <Input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={formData.username}
                    onChange={handleChange}
                    name="username"
                />
                <textarea
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                    name="bio"
                    className="bg-gray-800 text-white rounded-lg p-2 min-h-[100px]"
                />
                <Input
                    type="text"
                    placeholder="Localisation"
                    value={formData.location}
                    onChange={handleChange}
                    name="location"
                />
                <Input
                    type="url"
                    placeholder="Site web"
                    value={formData.siteWeb}
                    onChange={handleChange}
                    name="siteWeb"
                />
            </div>



            <div className="flex flex-col gap-4 justify-between text-gray-400 text-sm">
                <input
                    type="file"
                    accept="image/*"
                    placeholder="Avatar"
                    name="avatar"
                    onChange={handleFileChange}
                    className="bg-gray-800 text-white rounded-lg p-2"
                />
                {formData.avatar && (
                    <img 
                        src={typeof formData.avatar === 'string' 
                            ? `http://localhost:8080/uploads/avatar/${formData.avatar}` 
                            : URL.createObjectURL(formData.avatar)
                        } 
                        alt="Avatar" 
                        className="w-30 h-10 object-cover rounded-lg mt-2" 
                    />
                )}

                <input
                    type="file"
                    accept="image/*"
                    placeholder="Bannière"
                    name="cover"
                    onChange={handleFileChange}
                    className="bg-gray-800 text-white rounded-lg p-2"
                />
                {formData.cover && (
                    <img 
                        src={typeof formData.cover === 'string' 
                            ? `http://localhost:8080/uploads/covers/${formData.cover}` 
                            : URL.createObjectURL(formData.cover)
                        } 
                        alt="Bannière" 
                        className="w-30 h-10 object-cover rounded-lg mt-2" 
                    />
                )}
            {error && (
                <div className="text-red-500 text-sm mt-4">
                    {error}
                </div>
            )}
                <Button
                    type="submit"
                    variant="tertiary"
                    className="mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? 'Mise à jour...' : 'Modifier le profil'}
                </Button>
            </div>
        </form>
    );
};

export default ProfileUpdate;