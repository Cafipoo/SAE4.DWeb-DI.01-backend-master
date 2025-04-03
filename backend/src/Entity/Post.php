<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 280, nullable: true)]
    private ?string $content = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $created_at = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'post', targetEntity: PostInteraction::class)]
    private Collection $postInteractions;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $media = null;

    #[ORM\Column(nullable: true)]
    private ?bool $censored = null;

    #[ORM\Column(nullable: true)]
    private ?int $retweet = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isDeleted = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $retweetContent = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $retweetMedia = null;


    public function __construct()
    {
        $this->postInteractions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeInterface $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, PostInteraction>
     */
    public function getPostInteractions(): Collection
    {
        return $this->postInteractions;
    }

    public function addPostInteraction(PostInteraction $postInteraction): static
    {
        if (!$this->postInteractions->contains($postInteraction)) {
            $this->postInteractions->add($postInteraction);
            $postInteraction->setIdPost($this);
        }

        return $this;
    }

    public function removePostInteraction(PostInteraction $postInteraction): static
    {
        if ($this->postInteractions->removeElement($postInteraction)) {
            // set the owning side to null (unless already changed)
            if ($postInteraction->getIdPost() === $this) {
                $postInteraction->setIdPost(null);
            }
        }

        return $this;
    }

    public function getMedia(): ?string
    {
        return $this->media;
    }

    public function setMedia(?string $media): static
    {
        $this->media = $media;

        return $this;
    }

    public function isCensored(): ?bool
    {
        return $this->censored;
    }

    public function setCensored(?bool $censored): static
    {
        $this->censored = $censored;

        return $this;
    }

    public function getRetweet(): ?int
    {
        return $this->retweet;
    }

    public function setRetweet(?int $retweet): static
    {
        $this->retweet = $retweet;

        return $this;
    }

    public function isDeleted(): ?bool
    {
        return $this->isDeleted;
    }

    public function setIsDeleted(?bool $isDeleted): static
    {
        $this->isDeleted = $isDeleted;

        return $this;
    }

    public function getRetweetContent(): ?string
    {
        return $this->retweetContent;
    }

    public function setRetweetContent(?string $retweetContent): static
    {
        $this->retweetContent = $retweetContent;

        return $this;
    }

    public function getRetweetMedia(): ?string
    {
        return $this->retweetMedia;
    }

    public function setRetweetMedia(?string $retweetMedia): static
    {
        $this->retweetMedia = $retweetMedia;

        return $this;
    }

}
