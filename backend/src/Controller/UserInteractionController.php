<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserInteraction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserInteractionController extends AbstractController
{
    #[Route('/users/{id}/follow', name: 'user_follow', methods: ['POST'])]
    public function toggleFollow(
        User $followedUser,  // Ceci est l'utilisateur qu'on veut suivre (via l'URL)
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        $followerId = $data['userId'] ?? null;  // ID de l'utilisateur qui veut suivre
        $isFollowed = $data['isFollowed'] ?? false;

        // Vérifier si l'utilisateur qui veut suivre existe
        $follower = $entityManager->getRepository(User::class)->find($followerId);
        if (!$follower) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est banni
        if ($follower->isBanned()) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas suivre cet utilisateur car vous êtes banni'], 403);
        }

        // Rechercher une interaction existante
        $interaction = $entityManager->getRepository(UserInteraction::class)->findOneBy([
            'user' => $follower,
            'secondUser' => $followedUser
        ]);

        if (!$interaction) {
            // Créer une nouvelle interaction si elle n'existe pas
            $interaction = new UserInteraction();
            $interaction->setUser($follower);
            $interaction->setSecondUser($followedUser);
        }

        // Mettre à jour le statut du suivi (inverse de l'état actuel)
        $interaction->setFollowed(!$isFollowed);

        $entityManager->persist($interaction);
        $entityManager->flush();

        // Compter le nombre total de followers
        $followersCount = $entityManager->getRepository(UserInteraction::class)->count([
            'secondUser' => $followedUser,
            'followed' => true
        ]);

        return new JsonResponse([
            'success' => true,
            'followers_count' => $followersCount,
            'is_followed' => !$isFollowed
        ]);
    }
} 
?>