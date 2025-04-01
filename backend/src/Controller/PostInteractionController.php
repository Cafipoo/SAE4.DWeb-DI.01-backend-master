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

    #[Route('/posts/{id}/comments', name: 'get_post_comments', methods: ['GET'])]
    public function getComments(
        Post $post,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $interactions = $entityManager->getRepository(PostInteraction::class)
            ->findBy(['post' => $post], ['created_at' => 'ASC']);

        $comments = array_map(function ($interaction) {
            if ($interaction->getComments() === null) {
                return null;
            }
            return [
                'id' => $interaction->getId(),
                'comments' => $interaction->getComments(),
                'created_at' => $interaction->getCreatedAt() ? $interaction->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'user' => [
                    'id' => $interaction->getIdUser()->getId(),
                    'name' => $interaction->getIdUser()->getName(),
                    'username' => $interaction->getIdUser()->getUsername(),
                    'avatar' => $interaction->getIdUser()->getAvatar()
                ]
            ];
        }, $interactions);

        // Filtrer les commentaires nuls
        $comments = array_filter($comments, function($comment) {
            return $comment !== null;
        });

        return new JsonResponse(['comments' => array_values($comments)]);
    }

    #[Route('/posts/{id}/comment', name: 'add_comment', methods: ['POST'])]
    public function addComment(
        Post $post,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $comment = $data['comment'] ?? null;

        if (!$userId || !$comment) {
            return new JsonResponse(['error' => 'Données manquantes'], 400);
        }

        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->isBanned()) {
            return new JsonResponse(['error' => 'Vous ne pouvez pas commenter car vous êtes banni'], 403);
        }

        // Rechercher une interaction existante entre l'utilisateur et le post
        $interaction = $entityManager->getRepository(PostInteraction::class)->findOneBy([
            'post' => $post,
            'user' => $user
        ]);

        if ($interaction) {
            // Si une interaction existe, mettre à jour le commentaire
            $interaction->setComments($comment);
            $interaction->setCreatedAt(new \DateTime());
        } else {
            // Sinon, créer une nouvelle interaction
            $interaction = new PostInteraction();
            $interaction->setIdPost($post);
            $interaction->setIdUser($user);
            $interaction->setComments($comment);
            $interaction->setCreatedAt(new \DateTime());
            $entityManager->persist($interaction);
        }

        $entityManager->flush();

        return new JsonResponse([
            'id' => $interaction->getId(),
            'comments' => $interaction->getComments(),
            'created_at' => $interaction->getCreatedAt()->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'username' => $user->getUsername(),
                'avatar' => $user->getAvatar()
            ]
        ]);
    }
} 