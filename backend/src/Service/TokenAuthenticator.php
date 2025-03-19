<?php

namespace App\Service;

use App\Repository\AccessTokenRepository;
use Symfony\Component\HttpFoundation\Request;

class TokenAuthenticator
{
    private $tokenRepository;

    public function __construct(AccessTokenRepository $tokenRepository)
    {
        $this->tokenRepository = $tokenRepository;
    }

    public function authenticateRequest(Request $request): ?User
    {
        // Récupération du token depuis le cookie
        $token = $request->cookies->get('auth_token');
        
        if (!$token) {
            return null;
        }

        // Vérification du token
        $accessToken = $this->tokenRepository->findValidToken($token);
        
        if (!$accessToken) {
            return null;
        }

        return $accessToken->getUser();
    }
} 