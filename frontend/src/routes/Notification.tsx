import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataRequests } from '../data/data-requests';
import Sidebar from '../components/Sidebar';

interface Notification {
    id: string | number;
    content: string;
    is_read: boolean;
    is_pending?: boolean;
    pending_id?: number;
    sender: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
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
            const notificationsArray = Array.isArray(response) ? response : (response as NotificationResponse).notifications || [];
            setNotifications(notificationsArray as Notification[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            setNotifications([]);
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

    const handleAcceptFollow = async (pendingId: number, senderId: number) => {
        try {
            await DataRequests.acceptFollowRequest(pendingId, senderId);
            fetchNotifications(); // Rafraîchir les notifications après l'acceptation
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const handleRejectFollow = async (pendingId: number) => {
        try {
            await DataRequests.rejectFollowRequest(pendingId);
            fetchNotifications(); // Rafraîchir les notifications après le rejet
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const markAllAsRead = async () => {
        try {
            if (!user) return;
            await DataRequests.markAllNotificationsAsRead(id);
            setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
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
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const handleUserClick = (e: React.MouseEvent, username: string) => {
        e.stopPropagation();
        navigate(`/profile/${username}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="flex justify-center md:gap-4 min-h-screen bg-black">
            <div className="flex">
                <Sidebar />
            </div>
            <div className="flex-1 md:ml-72 md:max-w-[600px]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    {notifications.length > 0 && notifications.some(notif => !notif.is_read) && (
                        <button 
                            onClick={markAllAsRead}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
                                    !notification.is_read ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800'
                                }`}
                                onClick={() => !notification.is_pending && markAsRead(Number(notification.id))}
                            >
                                <div className="flex items-start space-x-3">
                                    <img
                                        src={notification.sender.avatar ? `http://localhost:8080/uploads/avatar/${notification.sender.avatar}` : '/default-avatar.png'}
                                        alt={notification.sender.name}
                                        className="w-10 h-10 rounded-full cursor-pointer"
                                        onClick={(e) => handleUserClick(e, notification.sender.username)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span 
                                                className="font-semibold text-white hover:underline cursor-pointer"
                                                onClick={(e) => handleUserClick(e, notification.sender.username)}
                                            >
                                                {notification.sender.name}
                                            </span>
                                            <span 
                                                className="text-gray-400 hover:underline cursor-pointer"
                                                onClick={(e) => handleUserClick(e, notification.sender.username)}
                                            >
                                                @{notification.sender.username}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-gray-300">{notification.content}</p>
                                        {notification.is_pending && notification.pending_id && (
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => handleAcceptFollow(notification.pending_id!, notification.sender.id)}
                                                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleRejectFollow(notification.pending_id!)}
                                                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 