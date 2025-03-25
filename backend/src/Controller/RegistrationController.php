<?php

// RegistrationController.php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Form\RegistrationFormType;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class RegistrationController extends AbstractController
{
    public function __construct(private EmailVerifier $emailVerifier)
    {
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            // Vérification des données requises
            if (!isset($data['email'], $data['password'], $data['username'], $data['name'])) {
                return $this->json([
                    'error' => 'Données manquantes'
                ], 400);
            }

            // Vérification si l'email existe déjà
            if ($userRepository->findOneBy(['email' => $data['email']])) {
                return $this->json([
                    'error' => 'Cet email est déjà utilisé'
                ], 400);
            }

            // Vérification si le username existe déjà
            if ($userRepository->findOneBy(['username' => $data['username']])) {
                return $this->json([
                    'error' => 'Ce nom d\'utilisateur est déjà utilisé'
                ], 400);
            }

            // Création du nouvel utilisateur
            $user = new User();
            $user->setEmail($data['email']);
            $user->setUsername($data['username']);
            $user->setName($data['name']);
            $user->setJoinedDate(new \DateTime());
            $user->setIsVerified(false);
            
            if (isset($data['birthDate'])) {
                $user->setBirthdate(new \DateTime($data['birthDate']));
            }

            // Hashage du mot de passe
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);

            // Génération du token d'API
            $user->setApiToken(bin2hex(random_bytes(32)));

            // Sauvegarde en base de données
            $entityManager->persist($user);
            $entityManager->flush();

            try {
                $this->emailVerifier->sendEmailConfirmation('app_verify_email', $user,
                (new TemplatedEmail())
                    ->from(new Address('mailer@example.com', 'AcmeMailBot'))
                    ->to($user->getEmail())
                    ->subject('Please Confirm your Email')
                    ->htmlTemplate('registration/confirmation_email.html.twig')
                );
            } catch (\Exception $emailException) {
                // Log the email sending error but continue with registration
                error_log('Failed to send verification email: ' . $emailException->getMessage());
            }

            return $this->json([
                'token' => $user->getApiToken(),
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'username' => $user->getUsername(),
                    'name' => $user->getName()
                ]
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors de l\'inscription'
            ], 500);
        }
    }


    #[Route('/verify/email', name: 'app_verify_email')]
    public function verifyUserEmail(Request $request, UserRepository $userRepository): Response
    {
        $id = $request->query->get('id'); // retrieve the user id from the url
    
        // Verify the user id exists and is not null
        if (null === $id) {
            return $this->redirectToRoute('app_home');
        }
    
        $user = $userRepository->find($id);

        // Ensure the user exists in persistence
        if (null === $user) {
            return $this->redirectToRoute('app_home');
        }
        
        try {
            $this->emailVerifier->handleEmailConfirmation($request, $user);
            
            // After verification, redirect to login page
            return $this->redirect('http://localhost:8090/login?verified=true');
        } catch (VerifyEmailExceptionInterface $exception) {
            // Redirect to login page with error
            return $this->redirect('http://localhost:8090/login?verified=false&error=' . urlencode($exception->getMessage()));
        }
    }
}