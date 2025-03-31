<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class SecurityController extends AbstractController
{

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['email'], $data['password'])) {
                return $this->json([
                    'error' => 'Email et mot de passe requis'
                ], 400);
            }

            $user = $userRepository->findOneBy(['email' => $data['email']]);


            if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'])) {
                return $this->json([
                    'error' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            if ($user->isBanned()) {
                return $this->json([
                    'error' => 'Votre compte a été banni'
                ], 403);
            }
            
            // NOTE: Currently not checking for email verification
            // If you want to enable this check, uncomment the following code
            // if (!$user->isVerified()) {
            //     return $this->json([
            //         'error' => 'Veuillez vérifier votre email avant de vous connecter'
            //     ], 401);
            // }

            // Génération d'un nouveau token API
            $user->setApiToken(bin2hex(random_bytes(32)));
            $entityManager->flush();

            return $this->json([
                'token' => $user->getApiToken(),
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'username' => $user->getUsername(),
                    'name' => $user->getName(),
                    'avatar' => $user->getAvatar(),
                    'cover' => $user->getCover(),
                    'reloading' => $user->getReloading(),
                    'location' => $user->getLocation(),
                    'siteWeb' => $user->getSiteWeb(),
                    'bio' => $user->getBio(),
                    
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors de la connexion'
            ], 500);
        }
    }

    #[Route('/admin', name: 'admin', methods: ['POST'])]
    public function admin(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['email'], $data['password'])) {
                return $this->json([
                    'error' => 'Email et mot de passe requis'
                ], 400);
            }

            // On récupère d'abord l'utilisateur
            $user = $userRepository->findOneBy(['email' => $data['email']]);

            if (!$user) {
                return $this->json([
                    'error' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            // On vérifie si l'utilisateur a le rôle ROLE_ADMIN
            $roles = $user->getRoles();
            if (!in_array('ROLE_ADMIN', $roles)) {
                return $this->json([
                    'error' => 'Vous n\'avez pas les permissions pour accéder à cette page'
                ], 403);
            }

            // On vérifie ensuite le mot de passe
            if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
                return $this->json([
                    'error' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            // Génération d'un nouveau token API
            $user->setApiToken(bin2hex(random_bytes(32)));
            $entityManager->flush();

            return $this->json([
                'token' => $user->getApiToken(),
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'username' => $user->getUsername(),
                    'name' => $user->getName(),
                    'avatar' => $user->getAvatar(),
                    'roles' => $user->getRoles()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors de la connexion'
            ], 500);
        }
    }

    // #[Route('/verify-token', name: 'verify_token', methods: ['POST'])]
    // public function verifyToken(
    //     Request $request,
    //     AccessTokenRepository $tokenRepository
    // ): JsonResponse {
    //     try {
    //         $data = json_decode($request->getContent(), true);
            
    //         if (!isset($data['token'])) {
    //             return $this->json([
    //                 'error' => 'Token requis'
    //             ], 400);
    //         }

    //         $token = $tokenRepository->findValidToken($data['token']);

    //         if (!$token) {
    //             return $this->json([
    //                 'error' => 'Token invalide ou expiré'
    //             ], 401);
    //         }

    //         $user = $token->getUser();
    //         return $this->json([
    //             'user' => [
    //                 'id' => $user->getId(),
    //                 'email' => $user->getEmail(),
    //                 'username' => $user->getUsername(),
    //                 'name' => $user->getName(),
    //                 'avatar' => $user->getAvatar()
    //             ]
    //         ]);

    //     } catch (\Exception $e) {
    //         return $this->json([
    //             'error' => 'Une erreur est survenue lors de la vérification du token'
    //         ], 500);
    //     }
    // }

    // #[Route('/logout', name: 'logout', methods: ['POST'])]
    // public function logout(
    //     Request $request,
    //     AccessTokenRepository $tokenRepository,
    //     EntityManagerInterface $entityManager
    // ): JsonResponse {
    //     try {
    //         $data = json_decode($request->getContent(), true);
            
    //         if (!isset($data['token'])) {
    //             return $this->json([
    //                 'error' => 'Token requis'
    //             ], 400);
    //         }

    //         $token = $tokenRepository->findOneBy(['token' => $data['token']]);
            
    //         if ($token) {
    //             $entityManager->remove($token);
    //             $entityManager->flush();
    //         }

    //         return $this->json([
    //             'message' => 'Déconnexion réussie'
    //         ]);

    //     } catch (\Exception $e) {
    //         return $this->json([
    //             'error' => 'Une erreur est survenue lors de la déconnexion'
    //         ], 500);
    //     }
    // }
}
