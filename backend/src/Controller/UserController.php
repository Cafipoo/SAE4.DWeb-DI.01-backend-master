<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\PostRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
    #[Route('/users', name: 'users.index', methods: ['GET'])]
    public function index(Request $request, UserRepository $userRepository): JsonResponse
    {
        // Réduire le nombre de posts par page pour tester la pagination
        $usersPerPage = 5; // On met 2 au lieu de 50 pour tester avec peu de données
        $page = max(1, $request->query->getInt('page', 1));
        $offset = ($page - 1) * $usersPerPage;

        $paginator = $userRepository->paginateAllOrderedByLatest($offset, $usersPerPage);
        
        // Calculer le nombre total de pages
        $totalusers = count($paginator);
        $maxPages = ceil($totalusers / $usersPerPage);

        // Transformer les users en tableau
        $users = [];
        foreach ($paginator as $post) {
            $users[] = [
                'id' => $post->getId(),
                'username' => $post->getUsername(),
                'name' => $post->getName(),
                'email' => $post->getEmail(),
                'joined_date' => $post->getJoinedDate()->format('Y-m-d H:i:s'),
                'avatar' => $post->getAvatar(),
                'cover' => $post->getCover(),
                'bio' => $post->getBio(),
                // 'location' => $post->getLocation(),
                // 'website' => $post->getWebsite(),
                // 'stats' => [
                //     'followers' => $post->getFollowers(),
                //     'following' => $post->getFollowing(),
                //     'users' => $post->getusers()
                // ]
            ];
        }

        // Calculer les pages précédente et suivante
        $previousPage = ($page > 1) ? $page - 1 : null;
        $nextPage = ($page < $maxPages) ? $page + 1 : null;

        return $this->json([
            'users' => $users,
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
            'total_users' => $totalusers,
            'current_page' => $page,
            'max_pages' => $maxPages,
        ]);
    }

    #[Route('/user/{id}', name: 'user.show', methods: ['GET'])]
    public function show(Request $request, UserRepository $userRepository, PostRepository $postRepository, int $id): JsonResponse
    {

        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Récupérer les posts de l'utilisateur
        $posts = $postRepository->findBy(['user' => $user], ['created_at' => 'DESC']);

        $userData = [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'joined_date' => $user->getJoinedDate()->format('Y-m-d H:i:s'),
            'avatar' => $user->getAvatar(),
            'cover' => $user->getCover(),
            'bio' => $user->getBio(),
            'posts' => array_map(function($post) {
                return [
                    'id' => $post->getId(),
                    'content' => $post->getContent(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $posts)
        ];

        return $this->json($userData);
    }

    #[Route('/update/user/{id}', name: 'user.update', methods: ['POST'])]
    public function update(
        Request $request, 
        UserRepository $userRepository, 
        EntityManagerInterface $entityManager,
        int $id
    ): JsonResponse {
        // Récupérer le token du header Authorization
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader) {
            return $this->json(['error' => 'Token manquant'], Response::HTTP_UNAUTHORIZED);
        }

        // Extraire le token (retirer "Bearer " du début)
        $token = str_replace('Bearer ', '', $authHeader);
        
        // Trouver l'utilisateur par le token
        $authenticatedUser = $userRepository->findOneBy(['apiToken' => $token]);
        if (!$authenticatedUser) {
            return $this->json(['error' => 'Token invalide'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur a le rôle ROLE_ADMIN
        if (!in_array('ROLE_ADMIN', $authenticatedUser->getRoles())) {
            return $this->json([
                'error' => 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action'
            ], Response::HTTP_FORBIDDEN);
        }

        // Récupérer l'utilisateur à modifier
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);
            if ($data === null) {
                return $this->json(['error' => 'Données JSON invalides'], Response::HTTP_BAD_REQUEST);
            }

            // Vérification de la présence des champs requis
            if (!isset($data['username']) || !isset($data['name']) || !isset($data['bio'])) {
                return $this->json(['error' => 'Champs requis manquants'], Response::HTTP_BAD_REQUEST);
            }

            $user->setUsername($data['username']);
            $user->setName($data['name']);
            $user->setBio($data['bio']);
            
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'name' => $user->getName(),
                    'bio' => $user->getBio()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors de la mise à jour de l\'utilisateur',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/user/{id}/posts', name: 'user.posts', methods: ['GET'])]
    public function getUserPosts(Request $request, UserRepository $userRepository, PostRepository $postRepository, int $id): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $page = max(1, $request->query->getInt('page', 1));
        $limit = 1; // nombre de posts par page
        $offset = ($page - 1) * $limit;

        $posts = $postRepository->findBy(
            ['user' => $user],
            ['created_at' => 'DESC'],
            $limit,
            $offset
        );

        $postsData = array_map(function($post) {
            return [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }, $posts);

        return $this->json([
            'posts' => $postsData
        ]);
    }
        
}