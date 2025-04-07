<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250407121524 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post_interaction DROP notif');
        $this->addSql('ALTER TABLE user ADD is_private TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE user_interaction DROP notif');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_interaction ADD notif TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE user DROP is_private');
        $this->addSql('ALTER TABLE post_interaction ADD notif TINYINT(1) DEFAULT NULL');
    }
}
