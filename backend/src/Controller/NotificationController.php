<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use App\Repository\UserRepository;
use App\Repository\PendingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class NotificationController extends AbstractController
{
    #[Route('/notifications/{id}', name: 'notifications.get', methods: ['GET'])]
    public function getNotifications(
        int $id,
        NotificationRepository $notificationRepository,
        UserRepository $userRepository,
        PendingRepository $pendingRepository
    ): JsonResponse {
        try {
            // Vérifier si l'utilisateur existe
            $user = $userRepository->find($id);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Récupérer toutes les notifications de l'utilisateur
            $notifications = $notificationRepository->findBy(
                ['id_receiver' => $user],
                ['id' => 'ASC']
            );

            // Récupérer les demandes de suivi en attente
            $pendingRequests = $pendingRepository->findBy(
                ['userReceive' => $user]
            );

            // Convertir les demandes en attente en notifications
            $pendingNotifications = array_map(function ($pending) {
                $sender = $pending->getUserSending();
                return [
                    'id' => 'pending_' . $pending->getId(),
                    'content' => "@{$sender->getUsername()} ({$sender->getName()}) souhaite vous suivre",
                    'is_read' => false,
                    'is_pending' => true,
                    'pending_id' => $pending->getId(),
                    'sender' => [
                        'id' => $sender->getId(),
                        'name' => $sender->getName(),
                        'username' => $sender->getUsername(),
                        'avatar' => $sender->getAvatar()
                    ]
                ];
            }, $pendingRequests);

            // Trier les notifications par isRead (false en premier)
            usort($notifications, function ($a, $b) {
                return $a->isRead() ? 1 : -1;
            });

            // Formater les notifications avec les informations de l'expéditeur
            $formattedNotifications = array_map(function ($notification) use ($userRepository) {
                $sender = $userRepository->find($notification->getIdSend());
                
                return [
                    'id' => $notification->getId(),
                    'content' => $notification->getContent(),
                    'is_read' => $notification->isRead(),
                    'is_pending' => false,
                    'sender' => [
                        'id' => $sender->getId(),
                        'name' => $sender->getName(),
                        'username' => $sender->getUsername(),
                        'avatar' => $sender->getAvatar()
                    ]
                ];
            }, $notifications);

            // Combiner les notifications normales et les demandes en attente
            $allNotifications = array_merge($formattedNotifications, $pendingNotifications);

            // Trier les notifications : pending d'abord, puis non lues, puis lues
            usort($allNotifications, function ($a, $b) {
                // Si l'une est pending et l'autre non, la pending passe en premier
                if ($a['is_pending'] !== $b['is_pending']) {
                    return $a['is_pending'] ? -1 : 1;
                }
                // Si les deux sont pending ou non pending, trier par is_read
                return $a['is_read'] ? 1 : -1;
            });

            return new JsonResponse([
                'notifications' => $allNotifications
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la récupération des notifications',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/notifications/{id}/read', name: 'notifications.mark_read', methods: ['POST'])]
    public function markAsRead(
        int $id,
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $notification = $notificationRepository->find($id);
            if (!$notification) {
                return new JsonResponse(['error' => 'Notification non trouvée'], 404);
            }

            $notification->setIsRead(true);
            $entityManager->persist($notification);
            $entityManager->flush();

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la mise à jour de la notification',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/notifications/{id}/read-all', name: 'notifications.mark_all_read', methods: ['POST'])]
    public function markAllAsRead(
        int $id,
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        try {
            // Récupérer l'utilisateur
            $user = $userRepository->find($id);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Récupérer toutes les notifications non lues de l'utilisateur
            $notifications = $notificationRepository->findBy([
                'id_receiver' => $user,
                'isRead' => false
            ]);

            // Marquer toutes les notifications comme lues
            foreach ($notifications as $notification) {
                $notification->setIsRead(true);
                $entityManager->persist($notification);
            }

            $entityManager->flush();

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la mise à jour des notifications',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    #[Route('/notifications/{id}/unread-count', name: 'notifications.unread_count', methods: ['GET'])]
    public function getUnreadCount(
        int $id,
        NotificationRepository $notificationRepository,
        UserRepository $userRepository
    ): JsonResponse {
        try {
            // Vérifier si l'utilisateur existe
            $user = $userRepository->find($id);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Compter les notifications non lues
            $unreadCount = $notificationRepository->count([
                'id_receiver' => $user,
                'isRead' => false
            ]);

            return new JsonResponse([
                'unread_count' => $unreadCount
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors du comptage des notifications non lues',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 