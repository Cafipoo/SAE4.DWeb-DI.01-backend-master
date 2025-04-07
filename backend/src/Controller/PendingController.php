<?php

namespace App\Controller;

use App\Entity\Pending;
use App\Entity\User;
use App\Entity\UserInteraction;
use App\Entity\Notification;
use App\Repository\PendingRepository;
use App\Repository\UserRepository;
use App\Repository\UserInteractionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class PendingController extends AbstractController
{
    #[Route('/pending/accept/{pendingId}/{senderId}', name: 'pending.accept', methods: ['POST'])]
    public function acceptFollowRequest(
        int $pendingId,
        int $senderId,
        PendingRepository $pendingRepository,
        UserRepository $userRepository,
        UserInteractionRepository $userInteractionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            // Récupérer la demande en attente
            $pending = $pendingRepository->find($pendingId);
            if (!$pending) {
                return new JsonResponse(['error' => 'Demande en attente non trouvée'], 404);
            }

            // Récupérer l'utilisateur qui a envoyé la demande
            $sender = $userRepository->find($senderId);
            if (!$sender) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Récupérer l'utilisateur qui reçoit la demande
            $receiver = $pending->getUserReceive();
            if (!$receiver) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Vérifier si une interaction existe déjà
            $existingInteraction = $userInteractionRepository->findOneBy([
                'user' => $sender,
                'secondUser' => $receiver
            ]);

            if ($existingInteraction) {
                // Si l'interaction existe, mettre à jour le statut de suivi
                $existingInteraction->setFollowed(true);
            } else {
                // Sinon, créer une nouvelle interaction
                $userInteraction = new UserInteraction();
                $userInteraction->setUser($sender);
                $userInteraction->setSecondUser($receiver);
                $userInteraction->setFollowed(true);
                $entityManager->persist($userInteraction);
            }

            // Supprimer la demande en attente
            $entityManager->remove($pending);
            $entityManager->flush();

            // Créer une notification pour l'acceptation
            $notification = new Notification();
            $notification->setIdReceiver($sender);
            $notification->setIdSend($receiver->getId());
            $notification->setContent("@{$receiver->getUsername()} a accepté votre demande d'abonnement");
            $notification->setIsRead(false);
            $entityManager->persist($notification);
            $entityManager->flush();

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de l\'acceptation de la demande',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/pending/reject/{pendingId}', name: 'pending.reject', methods: ['POST'])]
    public function rejectFollowRequest(
        int $pendingId,
        PendingRepository $pendingRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            // Récupérer la demande en attente
            $pending = $pendingRepository->find($pendingId);
            if (!$pending) {
                return new JsonResponse(['error' => 'Demande en attente non trouvée'], 404);
            }

            // Récupérer l'utilisateur qui a envoyé la demande
            $sender = $pending->getUserSending();
            if (!$sender) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Récupérer l'utilisateur qui reçoit la demande
            $receiver = $pending->getUserReceive();
            if (!$receiver) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Supprimer la demande en attente
            $entityManager->remove($pending);
            $entityManager->flush();

            // Créer une notification pour le refus
            $notification = new Notification();
            $notification->setIdReceiver($sender);
            $notification->setIdSend($receiver->getId());
            $notification->setContent("@{$receiver->getUsername()} a refusé votre demande d'abonnement");
            $notification->setIsRead(false);
            $entityManager->persist($notification);
            $entityManager->flush();

            return new JsonResponse(['success' => true]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors du rejet de la demande',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 