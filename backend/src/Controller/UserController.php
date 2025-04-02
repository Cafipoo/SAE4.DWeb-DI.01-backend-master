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
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Repository\UserInteractionRepository;
use App\Entity\UserInteraction;

class UserController extends AbstractController
{
    private UserRepository $userRepository;
    private UserInteractionRepository $userInteractionRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        UserRepository $userRepository,
        UserInteractionRepository $userInteractionRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->userRepository = $userRepository;
        $this->userInteractionRepository = $userInteractionRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/users', name: 'users.index', methods: ['GET'])]
    public function index(Request $request, UserRepository $userRepository): JsonResponse
    {
        $usersPerPage = 5;
        $page = max(1, $request->query->getInt('page', 1));
        $offset = ($page - 1) * $usersPerPage;

        $paginator = $userRepository->paginateAllOrderedByLatest($offset, $usersPerPage);
        
        $totalUsers = count($paginator);
        $maxPages = ceil($totalUsers / $usersPerPage);

        $users = [];
        foreach ($paginator as $user) {
            $avatar = $user->getAvatar();
            $cover = $user->getCover();

            if ($avatar) {
                $avatar = preg_replace('/[^A-Za-z0-9\/+=]/', '', $avatar);
            }
            if ($cover) {
                $cover = preg_replace('/[^A-Za-z0-9\/+=]/', '', $cover);
            }

            $users[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'joined_date' => $user->getJoinedDate()->format('Y-m-d H:i:s'),
                'avatar' => $avatar,
                'cover' => $cover,
                'bio' => $user->getBio(),
                'banned' => $user->isBanned()
            ];
        }

        $previousPage = ($page > 1) ? $page - 1 : null;
        $nextPage = ($page < $maxPages) ? $page + 1 : null;

        return $this->json([
            'users' => $users,
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
            'total_users' => $totalUsers,
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
    #[Route('/profile/{username}', name: 'user.find', methods: ['GET'])]
    public function find(
        Request $request, 
        UserRepository $userRepository, 
        PostRepository $postRepository, 
        UserInteractionRepository $userInteractionRepository,
        string $username
    ): JsonResponse {
        $user = $userRepository->findOneBy(['username' => $username]);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Récupérer l'utilisateur connecté
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur connecté a banni l'utilisateur du profil
        $interaction = $userInteractionRepository->findOneBy([
            'user' => $currentUser,
            'secondUser' => $user
        ]);
        $isBanned = $interaction ? $interaction->isBanned() : false;

        // Récupérer les posts de l'utilisateur
        $posts = $postRepository->findBy(['user' => $user], ['created_at' => 'DESC']);

        // Compter les followers et following
        $followersCount = $userInteractionRepository->count(['secondUser' => $user, 'followed' => true]);
        $followingCount = $userInteractionRepository->count(['user' => $user, 'followed' => true]);

        return new JsonResponse([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'joined_date' => $user->getJoinedDate()->format('Y-m-d H:i:s'),
            'avatar' => $user->getAvatar(),
            'cover' => $user->getCover(),
            'bio' => $user->getBio(),
            'location' => $user->getLocation(),
            'siteWeb' => $user->getSiteWeb(),
            'banned' => $user->isBanned(),
            'is_banned_by_current_user' => $isBanned,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'posts' => array_map(function($post) {
                return [
                    'id' => $post->getId(),
                    'content' => $post->getContent(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $posts)
        ]);
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
            if (!isset($data['username']) || !isset($data['name']) || !isset($data['banned'])) {
                return $this->json(['error' => 'Champs requis manquants'], Response::HTTP_BAD_REQUEST);
            }

            $user->setUsername($data['username']);
            $user->setName($data['name']);
            $user->setBio($data['bio']);
            $user->setBanned($data['banned']);
            
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'name' => $user->getName(),
                    'bio' => $user->getBio(),
                    'banned' => $user->isBanned()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors de la mise à jour de l\'utilisateur',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/update/settings/{id}', name: 'user.settings', methods: ['POST'])]
    public function settings(
        Request $request, 
        UserRepository $userRepository, 
        EntityManagerInterface $entityManager,
        int $id
    ): JsonResponse {
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
            if (!isset($data['reloading'])) {
                return $this->json(['error' => 'Champs requis manquants'], Response::HTTP_BAD_REQUEST);
            }
            if (!isset($data['lecture'])) {
                return $this->json(['error' => 'Champs requis manquants'], Response::HTTP_BAD_REQUEST);
            }

            $user->setReloading($data['reloading']);
            $user->setLecture($data['lecture']);
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'reloading' => $user->getReloading(),
                    'lecture' => $user->isLecture()
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
                'media' => $post->getMedia() ? json_decode($post->getMedia()) : [],
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }, $posts);

        // Récupérer le post épinglé par l'utilisateur
        $pinnedPost = $user->getPin();
        $pinnedPostData = null;
        
        if ($pinnedPost) {
            $pinnedPostData = [
                'id' => $pinnedPost->getId(),
                'content' => $pinnedPost->getContent(),
                'media' => $pinnedPost->getMedia() ? json_decode($pinnedPost->getMedia()) : [],
                'created_at' => $pinnedPost->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json([
            'posts' => $postsData,
            'pinned_post' => $pinnedPostData
        ]);
    }

    #[Route('/profile/{username}/update', name: 'user.profile.update', methods: ['POST'])]
    public function updateProfile(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager, string $username): JsonResponse {
        try {
            // // Trouver l'utilisateur à modifier
            $user = $userRepository->findOneBy(['username' => $username]);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }

            $uploadDir = $this->getParameter('uploads_directory');
            $avatarRepo = $uploadDir . '/avatar';
            $coverRepo = $uploadDir . '/covers';

            // Récupérer les données depuis form-data
            $username = $request->request->get('username', $user->getUsername());
            $name = $request->request->get('name', $user->getName());
            $bio = $request->request->get('bio', $user->getBio());
            $location = $request->request->get('location', $user->getLocation());
            $siteWeb = $request->request->get('siteWeb', $user->getSiteWeb());

            $user->setUsername($username);
            $user->setName($name);
            $user->setBio($bio);
            $user->setLocation($location);
            $user->setSiteWeb($siteWeb);


            // Handle avatar upload
            $avatar = $request->files->get('avatar');
            if ($avatar && $avatar instanceof UploadedFile) {
                if (!is_dir($avatarRepo)) {
                    return new JsonResponse(['message' => 'Upload directory does not exist'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
                }

                // Supprimer l'ancien avatar s'il existe
                if ($user->getAvatar()) {
                    $oldAvatarPath = $avatarRepo . '/' . $user->getAvatar();
                    if (file_exists($oldAvatarPath)) {
                        unlink($oldAvatarPath);
                    }
                }

                $avatarFileName = uniqid() . '.' . $avatar->guessExtension();
                try {
                    $avatar->move($avatarRepo, $avatarFileName);
                    $user->setAvatar($avatarFileName);
                } catch (\Exception $e) {
                    return new JsonResponse(['message' => 'Failed to upload avatar: ' . $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
                }
            }

            $cover = $request->files->get('cover');
            if ($cover && $cover instanceof UploadedFile) {
                if (!is_dir($coverRepo)) {
                    return new JsonResponse(['message' => 'Upload directory does not exist'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
                }

                // Supprimer l'ancienne bannière si elle existe
                if ($user->getCover()) {
                    $oldcoverPath = $coverRepo . '/' . $user->getCover();
                    if (file_exists($oldcoverPath)) {
                        unlink($oldcoverPath);
                    }
                }

                $coverFileName = uniqid() . '.' . $cover->guessExtension();
                try {
                    $cover->move($coverRepo, $coverFileName);
                    $user->setCover($coverFileName);
                } catch (\Exception $e) {
                    return new JsonResponse(['message' => 'Failed to upload cover: ' . $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
                }
            }

            $entityManager->persist($user);
            $entityManager->flush();

            return new JsonResponse([
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'name' => $user->getName(),
                    'bio' => $user->getBio(),
                    'location' => $user->getLocation(),
                    'siteWeb' => $user->getSiteWeb(),
                    'avatar' => $user->getAvatar(),
                    'cover' => $user->getCover()
                ]
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur est survenue lors de la mise à jour du profil: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/users/{id}/banned', name: 'get_banned_users', methods: ['GET'], format: 'json')]
    public function getBannedUsers(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // Récupérer tous les utilisateurs bannis par l'utilisateur
        $bannedUsers = $this->userInteractionRepository->findBy([
            'user' => $user,
            'isBanned' => true
        ]);

        // Si aucun utilisateur banni, retourner un tableau vide
        if (empty($bannedUsers)) {
            return $this->json([]);
        }

        $bannedUsersData = array_map(function($interaction) {
            $bannedUser = $interaction->getSecondUser();
            return [
                'id' => $bannedUser->getId(),
                'username' => $bannedUser->getUsername(),
                'name' => $bannedUser->getName(),
                'avatar' => $bannedUser->getAvatar()
            ];
        }, $bannedUsers);

        return $this->json($bannedUsersData);
    }

    #[Route('/pin/post/{id}', name: 'pin.post', methods: ['POST'])]
    public function pinPost(Request $request, UserRepository $userRepository, PostRepository $postRepository, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;

        if (!$userId) {
            return $this->json(['error' => 'Utilisateur non spécifié'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $post = $postRepository->find($id);
        if (!$post) {
            return $this->json(['error' => 'Post non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si l'utilisateur est le propriétaire du post
        if ($post->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous ne pouvez épingler que vos propres posts'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si le post est déjà épinglé
        $currentPinnedPost = $user->getPin();
        
        if ($currentPinnedPost && $currentPinnedPost->getId() === $post->getId()) {
            // Si le post est déjà épinglé, on le désépingle
            $user->setPin(null);
            $this->entityManager->flush();
            return $this->json(['success' => true, 'action' => 'unpinned']);
        } else {
            // Sinon, on épinglé le nouveau post
            $user->setPin($post);
            $this->entityManager->flush();
            return $this->json(['success' => true, 'action' => 'pinned']);
        }
    }

    #[Route('/users/all', name: 'users.all', methods: ['GET'])]
    public function getAllUsers(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findAll();
        $usersData = [];

        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'joined_date' => $user->getJoinedDate()->format('Y-m-d H:i:s'),
                'avatar' => $user->getAvatar(),
                'cover' => $user->getCover(),
                'bio' => $user->getBio(),
                'location' => $user->getLocation(),
                'siteWeb' => $user->getSiteWeb(),
                'banned' => $user->isBanned(),
                'is_banned_by_current_user' => false, // Cette valeur devrait être calculée en fonction de l'utilisateur connecté
                'followers_count' => 0, // À implémenter si nécessaire
                'following_count' => 0  // À implémenter si nécessaire
            ];
        }

        return $this->json(['users' => $usersData]);
    }
}