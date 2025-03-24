<?php

namespace App\Entity;

use App\Repository\PostInteractionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PostInteractionRepository::class)]
class PostInteraction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?post $post = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $user = null;

    #[ORM\Column(nullable: true)]
    private ?bool $likes = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdPost(): ?post
    {
        return $this->post;
    }

    public function setIdPost(?post $post): static
    {
        $this->post = $post;

        return $this;
    }

    public function getIdUser(): ?user
    {
        return $this->user;
    }

    public function setIdUser(?user $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function isLikes(): ?bool
    {
        return $this->likes;
    }

    public function setLikes(?bool $likes): static
    {
        $this->likes = $likes;

        return $this;
    }
}
