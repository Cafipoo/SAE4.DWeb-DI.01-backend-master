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

class UserController extends AbstractController
{
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
    public function find(Request $request, UserRepository $userRepository, PostRepository $postRepository, string $username): JsonResponse
    {
        $user = $userRepository->findOneBy(['username' => $username]);
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
            'location' => $user->getLocation(),
            'siteWeb' => $user->getSiteWeb(),
            'posts' => array_map(function($post) {
                $postAvatar = $post->getUser()->getAvatar();
                return [
                    'id' => $post->getId(),
                    'content' => $post->getContent(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'author' => [
                        'name' => $post->getUser()->getName(),
                        'username' => $post->getUser()->getUsername(),
                        'avatar' => $postAvatar,
                        'banned' => $post->getUser()->isBanned()
                    ]
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

    #[Route('/update/reloading/{id}', name: 'user.reloading', methods: ['POST'])]
    public function reloading(
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

            $user->setReloading($data['reloading']);
            
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'reloading' => $user->getReloading()
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

    // #[Route('/profile/{username}/cover', name: 'user.cover.upload', methods: ['POST'])]
    // public function uploadCover(
    //     Request $request,
    //     UserRepository $userRepository,
    //     EntityManagerInterface $entityManager,
    //     string $username
    // ): JsonResponse {
    //     try {
    //         // Trouver l'utilisateur dont on veut modifier la couverture
    //         $user = $userRepository->findOneBy(['username' => $username]);
    //         if (!$user) {
    //             return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
    //         }

    //         // Vérifier si l'utilisateur authentifié est admin ou le même que celui qu'il veut modifier
    //         if ($authenticatedUser->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $authenticatedUser->getRoles())) {
    //             return new JsonResponse(['error' => 'Vous n\'avez pas les droits pour modifier cet utilisateur'], Response::HTTP_FORBIDDEN);
    //         }

    //         // Vérifier si une image a été envoyée
    //         if (!$request->files->has('cover')) {
    //             // Débogage des fichiers reçus
    //             $filesInfo = [];
    //             foreach ($request->files as $key => $file) {
    //                 $filesInfo[$key] = 'File present';
    //             }
                
    //             // Débogage des données de la requête
    //             $requestData = [
    //                 'files' => $filesInfo,
    //                 'content_type' => $request->headers->get('Content-Type'),
    //                 'method' => $request->getMethod(),
    //                 'request_format' => $request->getRequestFormat(),
    //             ];
                
    //             return new JsonResponse([
    //                 'error' => 'Aucune image n\'a été envoyée',
    //                 'debug' => $requestData
    //             ], Response::HTTP_BAD_REQUEST);
    //         }

    //         $coverFile = $request->files->get('cover');

    //         // Vérifier le type MIME
    //         $mimeType = $coverFile->getMimeType();
    //         if (!in_array($mimeType, ['image/jpeg', 'image/png'])) {
    //             return new JsonResponse(['error' => 'Format d\'image non supporté. Utilisez JPEG ou PNG'], Response::HTTP_BAD_REQUEST);
    //         }

    //         // Vérifier la taille de l'image
    //         if ($coverFile->getSize() > 5 * 1024 * 1024) { // 5MB max
    //             return new JsonResponse(['error' => 'L\'image est trop grande. Taille maximum: 5MB'], Response::HTTP_BAD_REQUEST);
    //         }

    //         // Générer un nom de fichier unique
    //         $fileName = $username . '_cover_' . uniqid() . '.' . $coverFile->guessExtension();
            
    //         // Définir le répertoire de destination
    //         $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/covers';
            
    //         try {
    //             $coverFile->move($uploadsDir, $fileName);
    //         } catch (\Exception $e) {
    //             // En cas d'échec, essayons d'obtenir plus d'informations
    //             throw new \Exception('Erreur lors du déplacement du fichier: ' . $e->getMessage() . 
    //                 ', Répertoire: ' . $uploadsDir . 
    //                 ', Permissions: ' . substr(sprintf('%o', fileperms($uploadsDir)), -4));
    //         }
            
    //         $publicPath = '/uploads/covers/' . $fileName;

    //         $user->setCover($publicPath);

    //         $entityManager->persist($user);
    //         $entityManager->flush();
            
    //         $fileContent = file_get_contents($uploadsDir . '/' . $fileName);
    //         $base64Content = base64_encode($fileContent);

    //         return new JsonResponse([
    //             'message' => 'Image de couverture mise à jour avec succès',
    //             'cover' => $base64Content,
    //             'mimeType' => $mimeType,
    //             'coverUrl' => $publicPath
    //         ]);

    //     } catch (\Exception $e) {
    //         return new JsonResponse([
    //             'error' => 'Une erreur est survenue lors du téléchargement de l\'image: ' . $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ], Response::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    // }

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

}