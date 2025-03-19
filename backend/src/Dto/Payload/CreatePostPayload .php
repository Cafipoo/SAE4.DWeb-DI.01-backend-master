<?php

namespace App\Dto\Payload;

use Symfony\Component\Validator\Constraints as Assert;

class CreatePostPayload
{
    #[Assert\NotBlank(message: "Le contenu du post ne peut pas être vide.")]
    #[Assert\Length(
        min: 1,
        max: 280,
        minMessage: "Le contenu du post doit contenir au moins {{ limit }} caractère.",
        maxMessage: "Le contenu du post ne peut pas dépasser {{ limit }} caractères."
    )]
    private ?string $content = null;

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): self
    {
        $this->content = $content;
        return $this;
    }
}