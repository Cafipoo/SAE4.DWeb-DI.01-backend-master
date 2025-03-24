<?php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\User;
use App\Entity\PostInteraction;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class PostInteractionController extends AbstractController
{
    #[Route('/posts/{id}/like', name: 'post_like', methods: ['POST'])]
    public function toggleLike(
        Post $post,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $isLiked = $data['isLiked'] ?? false;

        // Vérifier si l'utilisateur existe
        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est banni
        if ($user->isBanned()) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas liker car vous êtes banni'], 403);
        }

        // Rechercher une interaction existante
        $interaction = $entityManager->getRepository(PostInteraction::class)->findOneBy([
            'post' => $post,
            'user' => $user
        ]);

        if (!$interaction) {
            // Créer une nouvelle interaction si elle n'existe pas
            $interaction = new PostInteraction();
            $interaction->setIdPost($post);
            $interaction->setIdUser($user);
        }

        // Mettre à jour le statut du like (inverse de l'état actuel)
        $interaction->setLikes(!$isLiked);

        $entityManager->persist($interaction);
        $entityManager->flush();

        // Compter le nombre total de likes pour ce post
        $likesCount = $entityManager->getRepository(PostInteraction::class)->count([
            'post' => $post,
            'likes' => true
        ]);

        return new JsonResponse([
            'success' => true,
            'likes_count' => $likesCount
        ]);
    }
} 