<?php

namespace App\Entity;

use App\Repository\PendingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PendingRepository::class)]
class Pending
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $userSending = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $userReceive = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getUserSending(): ?user
    {
        return $this->userSending;
    }

    public function setUserSending(?user $userSending): static
    {
        $this->userSending = $userSending;

        return $this;
    }

    public function getUserReceive(): ?user
    {
        return $this->userReceive;
    }

    public function setUserReceive(?user $userReceive): static
    {
        $this->userReceive = $userReceive;

        return $this;
    }
}
