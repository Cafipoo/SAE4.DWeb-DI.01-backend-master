<?php

namespace App\Entity;

use App\Repository\UserInteractionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserInteractionRepository::class)]
class UserInteraction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $secondUser = null;

    #[ORM\Column(nullable: true)]
    private ?bool $followed = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?user
    {
        return $this->user;
    }

    public function setUser(?user $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getSecondUser(): ?user
    {
        return $this->secondUser;
    }

    public function setSecondUser(?user $secondUser): static
    {
        $this->secondUser = $secondUser;

        return $this;
    }

    public function isFollowed(): ?bool
    {
        return $this->followed;
    }

    public function setFollowed(?bool $followed): static
    {
        $this->followed = $followed;

        return $this;
    }
}
