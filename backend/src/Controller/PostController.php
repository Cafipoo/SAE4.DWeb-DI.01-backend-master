<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Repository\PostInteractionRepository;
use App\Repository\UserInteractionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\Tools\Pagination\Paginator;

class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository, UserInteractionRepository $userInteractionRepository): JsonResponse
    {
        $postsPerPage = 5;
        $page = max(1, $request->query->getInt('page', 1));
        $offset = ($page - 1) * $postsPerPage;

        $paginator = $postRepository->paginateAllOrderedByLatest($offset, $postsPerPage);
        
        $totalPosts = count($paginator);
        $maxPages = ceil($totalPosts / $postsPerPage);

        // Récupérer l'ID de l'utilisateur depuis la requête pour vérifier les follows
        $currentUserId = $request->query->getInt('userId', 0);

        $posts = [];
        foreach ($paginator as $post) {
            $user = $post->getUser();
            
            // Récupérer les likes pour ce post
            $likes = $post->getPostInteractions()->filter(function($interaction) {
                return $interaction->isLikes() === true;
            });
            
            $likedByIds = $likes->map(function($interaction) {
                return $interaction->getIdUser()->getId();
            })->toArray();

            // Récupérer les commentaires pour ce post
            $comments = $post->getPostInteractions()->filter(function($interaction) {
                return $interaction->getComments() !== null;
            })->map(function($interaction) {
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
            })->toArray();
            
            // Vérifier si l'utilisateur suit l'auteur du post
            $isFollowed = false;
            if ($currentUserId > 0) {
                $isFollowed = $userInteractionRepository->findOneBy([
                    'user' => $currentUserId,
                    'secondUser' => $user->getId(),
                    'followed' => true
                ]) !== null;
            }
            
            $posts[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'media' => $post->getMedia() ? json_decode($post->getMedia()) : [],
                'author' => [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'username' => $user->getUsername(),
                    'avatar' => $user->getAvatar(),
                    'email' => $user->getEmail(),
                    'banned' => $user->isBanned()
                ],
                'likes_count' => count($likes),
                'liked_by' => $likedByIds,
                'isFollowed' => $isFollowed,
                'comments' => $comments,
                'replies' => count($comments)
            ];
        }

        $previousPage = ($page > 1) ? $page - 1 : null;
        $nextPage = ($page < $maxPages) ? $page + 1 : null;

        return $this->json([
            'posts' => $posts,
            'previous_page' => $previousPage,
            'next_page' => $nextPage,
            'total_posts' => $totalPosts,
            'current_page' => $page,
            'max_pages' => $maxPages,
            'posts_per_page' => $postsPerPage
        ]);
    }

    #[Route('/posts/subscribed/{id}', name: 'posts.subscribed', methods: ['GET'])]
    public function subscribed(
        Request $request, 
        PostRepository $postRepository, 
        UserRepository $userRepository,
        UserInteractionRepository $userInteractionRepository,
        int $id
    ): JsonResponse {
        // Récupérer les IDs des utilisateurs suivis
        $followedUsers = $userInteractionRepository->findBy([
            'user' => $id,
            'followed' => true
        ]);
        
        $followedUserIds = array_map(function($interaction) {
            return $interaction->getSecondUser()->getId();
        }, $followedUsers);

        // Si aucun utilisateur suivi, retourner un tableau vide
        if (empty($followedUserIds)) {
            return $this->json([
                'posts' => [],
                'previous_page' => null,
                'next_page' => null,
                'total_posts' => 0,
                'current_page' => 1,
                'max_pages' => 0,
                'posts_per_page' => 5
            ]);
        }

        // Pagination
        $postsPerPage = 5;
        $page = max(1, $request->query->getInt('page', 1));
        $offset = ($page - 1) * $postsPerPage;

        // Récupérer les posts des utilisateurs suivis
        $qb = $postRepository->createQueryBuilder('p')
            ->where('p.user IN (:userIds)')
            ->setParameter('userIds', $followedUserIds)
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($postsPerPage);

        $paginator = new Paginator($qb);
        $totalPosts = count($paginator);
        $maxPages = ceil($totalPosts / $postsPerPage);

        $posts = [];
        foreach ($paginator as $post) {
            $user = $post->getUser();
            
            // Récupérer les likes pour ce post
            $likes = $post->getPostInteractions()->filter(function($interaction) {
                return $interaction->isLikes() === true;
            });
            
            $likedByIds = $likes->map(function($interaction) {
                return $interaction->getIdUser()->getId();
            })->toArray();

            // Récupérer les commentaires pour ce post
            $comments = $post->getPostInteractions()->filter(function($interaction) {
                return $interaction->getComments() !== null;
            })->map(function($interaction) {
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
            })->toArray();

            // Vérifier si l'utilisateur suit l'auteur du post
            $isFollowed = $userInteractionRepository->findOneBy([
                'user' => $id,
                'secondUser' => $user,
                'followed' => true
            ]) !== null;
            
            $posts[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'media' => $post->getMedia() ? json_decode($post->getMedia()) : [],
                'author' => [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'username' => $user->getUsername(),
                    'avatar' => $user->getAvatar(),
                    'email' => $user->getEmail(),
                    'banned' => $user->isBanned()
                ],
                'likes_count' => count($likes),
                'liked_by' => $likedByIds,
                'isFollowed' => $isFollowed,
                'comments' => $comments,
                'replies' => count($comments)
            ];
        }

        return $this->json([
            'posts' => $posts,
            'previous_page' => ($page > 1) ? $page - 1 : null,
            'next_page' => ($page < $maxPages) ? $page + 1 : null,
            'total_posts' => $totalPosts,
            'current_page' => $page,
            'max_pages' => $maxPages,
            'posts_per_page' => $postsPerPage
        ]);
    }


    #[Route('/posts/{id}', name: 'posts.create', methods: ['POST'])]
    public function create(int $id, Request $request, PostRepository $postRepository, UserRepository $userRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['content']) || empty(trim($data['content']))) {
                return $this->json(['errors' => ['content' => 'Le contenu du post est requis']], Response::HTTP_BAD_REQUEST);
            }

            if (strlen($data['content']) > 280) {
                return $this->json(['errors' => ['content' => 'Le contenu ne doit pas dépasser 280 caractères']], Response::HTTP_BAD_REQUEST);
            }

            $user = $userRepository->find($id);
            if (!$user) {
                throw new \Exception('Utilisateur non trouvé');
            }
            if ($user->isBanned()) {
                return $this->json(['errors' => ['content' => 'Vous ne pouvez pas publier de message car vous êtes banni']], 403);
            }

            $post = new Post();
            $post->setContent($data['content']);
            $post->setCreatedAt(new \DateTime());
            $post->setUser($user);

            // Gérer les médias si présents
            if (isset($data['images']) && is_array($data['images'])) {
                $uploadDir = $this->getParameter('uploads_directory') . '/posts';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $mediaUrls = [];
                foreach ($data['images'] as $mediaData) {
                    // Détecter le type de fichier à partir des données base64
                    $fileType = 'jpg'; // par défaut
                    if (strpos($mediaData, 'data:image/jpeg;base64,') !== false) {
                        $fileType = 'jpg';
                        $mediaData = str_replace('data:image/jpeg;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:image/png;base64,') !== false) {
                        $fileType = 'png';
                        $mediaData = str_replace('data:image/png;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:image/gif;base64,') !== false) {
                        $fileType = 'gif';
                        $mediaData = str_replace('data:image/gif;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:image/webp;base64,') !== false) {
                        $fileType = 'webp';
                        $mediaData = str_replace('data:image/webp;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:video/mp4;base64,') !== false) {
                        $fileType = 'mp4';
                        $mediaData = str_replace('data:video/mp4;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:video/webm;base64,') !== false) {
                        $fileType = 'webm';
                        $mediaData = str_replace('data:video/webm;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:video/quicktime;base64,') !== false) {
                        $fileType = 'mov';
                        $mediaData = str_replace('data:video/quicktime;base64,', '', $mediaData);
                    }
                    
                    $mediaData = str_replace(' ', '+', $mediaData);
                    $mediaData = base64_decode($mediaData);

                    // Vérifier la taille du fichier (max 50MB)
                    if (strlen($mediaData) > 50 * 1024 * 1024) {
                        return $this->json(['errors' => ['content' => 'Le fichier ne doit pas dépasser 50MB']], Response::HTTP_BAD_REQUEST);
                    }

                    // Générer un nom de fichier unique avec l'extension originale
                    $fileName = uniqid() . '.' . $fileType;
                    $filePath = $uploadDir . '/' . $fileName;

                    // Sauvegarder le fichier
                    file_put_contents($filePath, $mediaData);
                    $mediaUrls[] = $fileName;
                }

                // Stocker les URLs des médias dans la colonne media
                $post->setMedia(json_encode($mediaUrls));
            }

            $postRepository->save($post, true);

            return $this->json([
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'media' => $post->getMedia() ? json_decode($post->getMedia()) : [],
                'author' => [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'username' => $user->getUsername(),
                    'avatar' => $user->getAvatar(),
                    'email' => $user->getEmail(),
                    'banned' => $user->isBanned()
                ]
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json([
                'errors' => ['content' => 'Une erreur est survenue lors de la création du post']
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    #[Route('/posts/{id}', name: 'posts.delete', methods: ['DELETE'])]
    public function delete(
        int $id, 
        Request $request, 
        PostRepository $postRepository,
        UserRepository $userRepository,
        PostInteractionRepository $postInteractionRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $post = $postRepository->find($id);
            if (!$post) {
                throw new \Exception('Post non trouvé');
            }

            // Supprimer les images associées au post
            if ($post->getMedia()) {
                $mediaUrls = json_decode($post->getMedia(), true);
                if (is_array($mediaUrls)) {
                    $uploadDir = $this->getParameter('uploads_directory') . '/posts';
                    foreach ($mediaUrls as $imageUrl) {
                        $filePath = $uploadDir . '/' . $imageUrl;
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                    }
                }
            }

            // Supprimer d'abord toutes les interactions liées au post
            $interactions = $postInteractionRepository->findBy(['post' => $post]);
            foreach ($interactions as $interaction) {
                $entityManager->remove($interaction);
            }
            $entityManager->flush();

            // Ensuite supprimer le post
            $postRepository->remove($post, true);

            return $this->json(['message' => 'Post, images et interactions supprimés avec succès'], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['errors' => ['message' => 'Une erreur est survenue lors de la suppression du post']], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/posts/{id}/edit', name: 'posts.update', methods: ['POST'])]
    public function update(int $id, Request $request, PostRepository $postRepository, UserRepository $userRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $post = $postRepository->find($id);
            
            if (!$post) {
                return $this->json(['errors' => ['post' => 'Post non trouvé']], Response::HTTP_NOT_FOUND);
            }

            // Vérifier si l'utilisateur est l'auteur du post
            $currentUserId = $data['userId'] ?? null;
            if ($currentUserId && $post->getUser()->getId() !== (int)$currentUserId) {
                return $this->json(['errors' => ['post' => 'Vous n\'êtes pas autorisé à modifier ce post']], Response::HTTP_FORBIDDEN);
            }

            // Vérifier que le contenu respecte les limites
            if (!isset($data['content']) || empty(trim($data['content']))) {
                return $this->json(['errors' => ['content' => 'Le contenu du post est requis']], Response::HTTP_BAD_REQUEST);
            }

            if (strlen($data['content']) > 280) {
                return $this->json(['errors' => ['content' => 'Le contenu ne doit pas dépasser 280 caractères']], Response::HTTP_BAD_REQUEST);
            }

            // Mettre à jour le contenu
            $post->setContent($data['content']);

            // Gérer les médias si présents
            if (isset($data['media']) && is_array($data['media'])) {
                $uploadDir = $this->getParameter('uploads_directory') . '/posts';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Récupérer les médias actuels
                $currentMedia = $post->getMedia() ? json_decode($post->getMedia(), true) : [];
                $newMediaUrls = [];
                $keepMedia = $data['keepMedia'] ?? [];

                // Conserver les médias existants sélectionnés
                foreach ($keepMedia as $mediaIndex) {
                    if (isset($currentMedia[$mediaIndex])) {
                        $newMediaUrls[] = $currentMedia[$mediaIndex];
                    }
                }

                // Supprimer les médias qui ne sont plus utilisés
                foreach ($currentMedia as $mediaUrl) {
                    if (!in_array($mediaUrl, $newMediaUrls)) {
                        $filePath = $uploadDir . '/' . $mediaUrl;
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                    }
                }

                // Ajouter les nouveaux médias
                foreach ($data['media'] as $mediaData) {
                    // Ignorer les URL existantes (qui commencent par http)
                    if (strpos($mediaData, 'http') === 0) {
                        continue;
                    }

                    // Détecter le type de fichier à partir des données base64
                    $fileType = 'jpg'; // par défaut
                    if (strpos($mediaData, 'data:image/jpeg;base64,') !== false) {
                        $fileType = 'jpg';
                        $mediaData = str_replace('data:image/jpeg;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:image/png;base64,') !== false) {
                        $fileType = 'png';
                        $mediaData = str_replace('data:image/png;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:image/gif;base64,') !== false) {
                        $fileType = 'gif';
                        $mediaData = str_replace('data:image/gif;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:image/webp;base64,') !== false) {
                        $fileType = 'webp';
                        $mediaData = str_replace('data:image/webp;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:video/mp4;base64,') !== false) {
                        $fileType = 'mp4';
                        $mediaData = str_replace('data:video/mp4;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:video/webm;base64,') !== false) {
                        $fileType = 'webm';
                        $mediaData = str_replace('data:video/webm;base64,', '', $mediaData);
                    } elseif (strpos($mediaData, 'data:video/quicktime;base64,') !== false) {
                        $fileType = 'mov';
                        $mediaData = str_replace('data:video/quicktime;base64,', '', $mediaData);
                    }
                    
                    $mediaData = str_replace(' ', '+', $mediaData);
                    $mediaData = base64_decode($mediaData);

                    // Vérifier la taille du fichier (max 50MB)
                    if (strlen($mediaData) > 50 * 1024 * 1024) {
                        return $this->json(['errors' => ['content' => 'Le fichier ne doit pas dépasser 50MB']], Response::HTTP_BAD_REQUEST);
                    }

                    // Générer un nom de fichier unique avec l'extension originale
                    $fileName = uniqid() . '.' . $fileType;
                    $filePath = $uploadDir . '/' . $fileName;

                    // Sauvegarder le fichier
                    file_put_contents($filePath, $mediaData);
                    $newMediaUrls[] = $fileName;
                }

                // Mettre à jour les médias du post
                $post->setMedia(json_encode($newMediaUrls));
            }

            $postRepository->save($post, true);

            return $this->json([
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'media' => $post->getMedia() ? json_decode($post->getMedia()) : [],
                'author' => [
                    'id' => $post->getUser()->getId(),
                    'name' => $post->getUser()->getName(),
                    'username' => $post->getUser()->getUsername(),
                    'avatar' => $post->getUser()->getAvatar(),
                    'email' => $post->getUser()->getEmail(),
                    'banned' => $post->getUser()->isBanned()
                ]
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json([
                'errors' => ['content' => 'Une erreur est survenue lors de la modification du post: ' . $e->getMessage()]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // #[Route('/posts', name: 'posts_create', methods: ['POST'])]
    // public function create(Request $request, PostRepository $postRepository): JsonResponse
    // {
    //     $data = json_decode($request->getContent(), true);
    //     $post = new Post();
    //     $post->setContent($data['content']);
    //     $post->setCreatedAt(new \DateTime());

    //     $postRepository->save($post, true);

    //     return $this->json($post, 201);
    // }

    // #[Route('/posts/{id}', name: 'posts_show', methods: ['GET'])]
    // public function show(int $id, PostRepository $postRepository): JsonResponse
    // {
    //     $post = $postRepository->find($id);

    //     if (!$post) {
    //         return $this->json(['message' => 'Post not found'], 404);
    //     }

    //     return $this->json($post);
    // }
}
