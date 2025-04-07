import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataRequests } from '../data/data-requests';

interface Notification {
    id: number;
    content: string;
    is_read: boolean;
    sender: {
        id: number;
        name: string;
        username: string;
        avatar: string;
    };
}

interface NotificationResponse {
    notifications: Notification[];
}

export const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;
    const id = userData?.id;
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            if (!user) {
                navigate('/login');
                return;
            }
            const response = await DataRequests.getNotification(id);
            // S'assurer que nous avons bien un tableau de notifications
            const notificationsArray = Array.isArray(response) ? response : response.notifications || [];
            setNotifications(notificationsArray);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            setNotifications([]); // En cas d'erreur, on initialise avec un tableau vide
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Rafraîchir les notifications toutes les 30 secondes
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, [user, navigate]);

    const markAllAsRead = async () => {
        try {
            if (!user) return;
            await DataRequests.markAllNotificationsAsRead(id);
            setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await DataRequests.markNotificationAsRead(notificationId);
            setNotifications(notifications.map(notif => 
                notif.id === notificationId ? { ...notif, is_read: true } : notif
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const handleUserClick = (e: React.MouseEvent, username: string) => {
        e.stopPropagation(); // Empêche le déclenchement du onClick de la notification
        navigate(`/profile/${username}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {notifications.length > 0 && notifications.some(notif => !notif.is_read) && (
                    <button 
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Tout marquer comme lu
                    </button>
                )}
            </div>
            
            {notifications.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                    Aucune notification pour le moment
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border cursor-pointer ${
                                !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="flex items-start space-x-3">
                                <img
                                    src={`http://localhost:8080/uploads/avatar/${notification.sender.avatar}`}
                                    alt={notification.sender.name}
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={(e) => handleUserClick(e, notification.sender.username)}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span 
                                            className="font-semibold hover:underline cursor-pointer"
                                            onClick={(e) => handleUserClick(e, notification.sender.username)}
                                        >
                                            {notification.sender.name}
                                        </span>
                                        <span 
                                            className="text-gray-500 hover:underline cursor-pointer"
                                            onClick={(e) => handleUserClick(e, notification.sender.username)}
                                        >
                                            @{notification.sender.username}
                                        </span>
                                    </div>
                                    <p className="mt-1">{notification.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 