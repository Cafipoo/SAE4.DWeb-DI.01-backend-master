<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use App\Repository\UserRepository;
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
        UserRepository $userRepository
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
                ['id' => 'DESC'] // Trier par ID décroissant (les plus récentes en premier)
            );

            // Formater les notifications avec les informations de l'expéditeur
            $formattedNotifications = array_map(function ($notification) use ($userRepository) {
                $sender = $userRepository->find($notification->getIdSend());
                
                return [
                    'id' => $notification->getId(),
                    'content' => $notification->getContent(),
                    'is_read' => $notification->isRead(),
                    'sender' => [
                        'id' => $sender->getId(),
                        'name' => $sender->getName(),
                        'username' => $sender->getUsername(),
                        'avatar' => $sender->getAvatar()
                    ]
                ];
            }, $notifications);

            return new JsonResponse([
                'notifications' => $formattedNotifications
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
} 