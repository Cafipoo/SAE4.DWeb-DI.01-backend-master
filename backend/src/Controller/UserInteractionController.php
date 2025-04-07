<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserInteraction;
use App\Entity\Notification;
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
            $isFollowing = $data['isFollowing'] ?? false;

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

            // Rechercher une interaction existante
            $interaction = $entityManager->getRepository(UserInteraction::class)->findOneBy([
                'user' => $userToFollow,
                'secondUser' => $follower
            ]);

            if (!$interaction) {
                $interaction = new UserInteraction();
                $interaction->setUser($userToFollow);
                $interaction->setSecondUser($follower);
            }

            // Mettre à jour le statut du follow
            $interaction->setFollowed(!$isFollowing);

            $entityManager->persist($interaction);
            $entityManager->flush();

            // Créer une notification pour le follow
            if (!$isFollowing) { // Si c'est un nouveau follow
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
                'isFollowing' => !$isFollowing
            ]);
        } catch (\Exception $e) {
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