<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserInteraction;
use App\Entity\Notification;
use App\Entity\Pending;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserInteractionController extends AbstractController
{
    #[Route('/users/{id}/follow', name: 'user_follow', methods: ['POST'])]
    public function toggleFollow(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            $followerId = $data['userId'] ?? null;
            $isFollowing = $data['isFollowed'] ?? false;

            if (!$followerId) {
                return new JsonResponse(['error' => 'ID utilisateur manquant'], 400);
            }

            // Récupérer les utilisateurs
            $userToFollow = $entityManager->getRepository(User::class)->find($id);
            $follower = $entityManager->getRepository(User::class)->find($followerId);

            if (!$userToFollow || !$follower) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Vérifier si l'utilisateur est banni
            if ($follower->isBanned()) {
                return new JsonResponse(['error' => 'Vous ne pouvez pas suivre car vous êtes banni'], 403);
            }

            // Si l'utilisateur est en mode privé et qu'on veut le suivre
            if ($userToFollow->isPrivate() && !$isFollowing) {
                // Vérifier si une demande en attente existe déjà
                $existingPending = $entityManager->getRepository(Pending::class)->findOneBy([
                    'userSending' => $follower,
                    'userReceive' => $userToFollow
                ]);

                if (!$existingPending) {
                    // Créer une nouvelle demande en attente
                    $pending = new Pending();
                    $pending->setUserSending($follower);
                    $pending->setUserReceive($userToFollow);
                    $entityManager->persist($pending);
                    $entityManager->flush();

                    // // Créer une notification pour la demande de suivi
                    // $notification = new Notification();
                    // $notification->setIdReceiver($userToFollow);
                    // $notification->setIdSend($follower->getId());
                    // $notification->setContent("@{$follower->getUsername()} veut vous suivre");
                    // $notification->setIsRead(false);
                    // $entityManager->persist($notification);
                    // $entityManager->flush();
                }

                return new JsonResponse([
                    'success' => true,
                    'isFollowing' => false,
                    'pending' => true
                ]);
            }

            // Si on veut arrêter de suivre ou si le compte n'est pas privé
            if ($isFollowing) {
                // Rechercher une interaction existante
                $interaction = $entityManager->getRepository(UserInteraction::class)->findOneBy([
                    'user' => $follower,
                    'secondUser' => $userToFollow
                ]);

                if ($interaction) {
                    $entityManager->remove($interaction);
                    $entityManager->flush();
                }

                // Vérifier et supprimer une demande en attente si elle existe
                $pending = $entityManager->getRepository(Pending::class)->findOneBy([
                    'userSending' => $follower,
                    'userReceive' => $userToFollow
                ]);

                if ($pending) {
                    $entityManager->remove($pending);
                    $entityManager->flush();
                }
            } else {
                // Créer une nouvelle interaction de suivi
                $interaction = new UserInteraction();
                $interaction->setUser($follower);
                $interaction->setSecondUser($userToFollow);
                $interaction->setFollowed(true);

                $entityManager->persist($interaction);
                $entityManager->flush();

                // Créer une notification pour le follow
                $notification = new Notification();
                $notification->setIdReceiver($userToFollow);
                $notification->setIdSend($follower->getId());
                $notification->setContent("@{$follower->getUsername()} vous suit maintenant");
                $notification->setIsRead(false);
                $entityManager->persist($notification);
                $entityManager->flush();
            }

            return new JsonResponse([
                'success' => true,
                'isFollowing' => !$isFollowing,
                'pending' => false
            ]);
        } catch (\Exception $e) {
            error_log('Erreur dans toggleFollow: ' . $e->getMessage());
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la modification du suivi',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/users/{id}/follow-status/{followerId}', name: 'user_follow_status', methods: ['GET'])]
    public function getFollowStatus(
        User $followedUser,
        int $followerId,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Rechercher l'interaction existante
        $interaction = $entityManager->getRepository(UserInteraction::class)->findOneBy([
            'user' => $followerId,
            'secondUser' => $followedUser
        ]);

        return new JsonResponse([
            'is_followed' => $interaction ? $interaction->isFollowed() : false
        ]);
    }

    #[Route('/users/{id}/ban', name: 'user_ban', methods: ['POST'])]
    public function toggleBan(
        User $bannedUser,  // L'utilisateur à bannir (via l'URL)
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        $bannerId = $data['userId'] ?? null;  // ID de l'utilisateur qui veut bannir
        $isBanned = $data['isBanned'] ?? false;

        // Vérifier si l'utilisateur qui veut bannir existe
        $banner = $entityManager->getRepository(User::class)->find($bannerId);
        if (!$banner) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est banni
        if ($banner->isBanned()) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas bannir un utilisateur car vous êtes banni'], 403);
        }

        // Rechercher une interaction existante
        $interaction = $entityManager->getRepository(UserInteraction::class)->findOneBy([
            'user' => $banner,
            'secondUser' => $bannedUser
        ]);

        if (!$interaction) {
            // Créer une nouvelle interaction si elle n'existe pas
            $interaction = new UserInteraction();
            $interaction->setUser($banner);
            $interaction->setSecondUser($bannedUser);
        }

        // Mettre à jour le statut du bannissement (inverse de l'état actuel)
        $interaction->setIsBanned(!$isBanned);

        // Si l'utilisateur est banni, on arrête de le suivre
        if (!$isBanned) {
            $interaction->setFollowed(false);
        }

        $entityManager->persist($interaction);
        $entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'is_banned' => !$isBanned
        ]);
    }
} 
?>