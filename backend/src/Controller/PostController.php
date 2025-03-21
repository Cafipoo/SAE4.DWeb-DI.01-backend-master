<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\Tools\Pagination\Paginator;

class PostController extends AbstractController
{
    #[Route('/posts', name: 'posts.index', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): JsonResponse
    {
        $postsPerPage = 1;
        $page = max(1, $request->query->getInt('page', 1));
        $offset = ($page - 1) * $postsPerPage;

        $paginator = $postRepository->paginateAllOrderedByLatest($offset, $postsPerPage);
        
        $totalPosts = count($paginator);
        $maxPages = ceil($totalPosts / $postsPerPage);

        $posts = [];
        foreach ($paginator as $post) {
            $user = $post->getUser();
            $posts[] = [
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'author' => [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'username' => $user->getUsername(),
                    'avatar' => $user->getAvatar(),
                    'email' => $user->getEmail()
                ]
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

            $post = new Post();
            $post->setContent($data['content']);
            $post->setCreatedAt(new \DateTime());
            $post->setUser($user);

            $postRepository->save($post, true);

            return $this->json([
                'id' => $post->getId(),
                'content' => $post->getContent(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'author' => [
                    'id' => $user->getId(),
                    'name' => $user->getName(),
                    'username' => $user->getUsername(),
                    'avatar' => $user->getAvatar(),
                    'email' => $user->getEmail()
                ]
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json([
                'errors' => ['content' => 'Une erreur est survenue lors de la création du post']
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
